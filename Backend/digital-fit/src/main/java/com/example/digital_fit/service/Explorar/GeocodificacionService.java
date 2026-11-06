package com.example.digital_fit.service.Explorar;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.example.digital_fit.dto.Explorar.GeocodificacionResultadoDTO;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class GeocodificacionService {

    private static final Logger log = LoggerFactory.getLogger(GeocodificacionService.class);
    private static final String USER_AGENT = "Digital-FIT/2.0 (contacto: soporte@digitalfit.local; https://github.com/Manuelklk03/Digital-Fit-2.0)";
    private static final long RATE_LIMIT_MS = 1000L;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Caché en memoria para evitar llamadas repetidas y proteger la cuota de Nominatim
    private final Map<String, List<GeocodificacionResultadoDTO>> cacheBusqueda = new ConcurrentHashMap<>();
    private final Map<String, GeocodificacionResultadoDTO> cacheInversa = new ConcurrentHashMap<>();
    private final AtomicLong ultimaPeticionMs = new AtomicLong(0);

    public GeocodificacionService() {
        this(HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build());
    }

    public GeocodificacionService(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    public List<GeocodificacionResultadoDTO> buscar(String consulta) {
        if (consulta == null || consulta.trim().isBlank()) {
            return List.of();
        }

        String claveCache = consulta.trim().toLowerCase();
        if (cacheBusqueda.containsKey(claveCache)) {
            log.debug("Recuperando geocodificación desde caché para: {}", consulta);
            return cacheBusqueda.get(claveCache);
        }

        aplicarRateLimit();

        List<GeocodificacionResultadoDTO> resultados = new ArrayList<>();
        try {
            String url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=es&addressdetails=1&q="
                    + URLEncoder.encode(consulta.trim(), StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .header("Accept-Language", "es")
                    .header("User-Agent", USER_AGENT)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300 && response.body() != null) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.isArray()) {
                    for (JsonNode item : root) {
                        double lat = item.path("lat").asDouble(0.0);
                        double lon = item.path("lon").asDouble(0.0);
                        String nombre = item.path("name").asText(item.path("display_name").asText(""));
                        String direccion = item.path("display_name").asText("");
                        String tipo = item.path("type").asText("");

                        resultados.add(GeocodificacionResultadoDTO.builder()
                                .nombre(nombre)
                                .direccionCompleta(direccion)
                                .latitud(lat)
                                .longitud(lon)
                                .tipo(tipo)
                                .build());
                    }
                }
            }

            if (cacheBusqueda.size() > 200) {
                cacheBusqueda.clear();
            }
            cacheBusqueda.put(claveCache, resultados);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Petición de geocodificación interrumpida para '{}': {}", consulta, e.getMessage());
        } catch (Exception e) {
            log.warn("Error consultando geocodificación en Nominatim para '{}': {}", consulta, e.getMessage());
        }

        return resultados;
    }

    public GeocodificacionResultadoDTO reversa(Double latitud, Double longitud) {
        if (latitud == null || longitud == null) {
            return null;
        }

        String claveCache = String.format("%.4f_%.4f", latitud, longitud);
        if (cacheInversa.containsKey(claveCache)) {
            return cacheInversa.get(claveCache);
        }

        aplicarRateLimit();

        try {
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=%s&lon=%s&addressdetails=1",
                    URLEncoder.encode(String.valueOf(latitud), StandardCharsets.UTF_8),
                    URLEncoder.encode(String.valueOf(longitud), StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .header("Accept-Language", "es")
                    .header("User-Agent", USER_AGENT)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300 && response.body() != null) {
                JsonNode root = objectMapper.readTree(response.body());
                String direccion = root.path("display_name").asText("");
                String nombre = root.path("name").asText(direccion);
                String tipo = root.path("type").asText("");

                GeocodificacionResultadoDTO res = GeocodificacionResultadoDTO.builder()
                        .nombre(nombre)
                        .direccionCompleta(direccion)
                        .latitud(latitud)
                        .longitud(longitud)
                        .tipo(tipo)
                        .build();

                if (cacheInversa.size() > 200) {
                    cacheInversa.clear();
                }
                cacheInversa.put(claveCache, res);
                return res;
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Petición de geocodificación inversa interrumpida para ({}, {}): {}", latitud, longitud, e.getMessage());
        } catch (Exception e) {
            log.warn("Error en geocodificación inversa para ({}, {}): {}", latitud, longitud, e.getMessage());
        }

        return null;
    }

    private void aplicarRateLimit() {
        long ahora = System.currentTimeMillis();
        long anterior = ultimaPeticionMs.get();
        long transcurrido = ahora - anterior;
        if (transcurrido < RATE_LIMIT_MS) {
            try {
                Thread.sleep(RATE_LIMIT_MS - transcurrido);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        ultimaPeticionMs.set(System.currentTimeMillis());
    }
}
