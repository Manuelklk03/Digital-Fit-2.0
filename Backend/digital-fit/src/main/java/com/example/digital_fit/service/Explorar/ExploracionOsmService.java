package com.example.digital_fit.service.Explorar;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.digital_fit.dto.Explorar.LugarExploracionDTO;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoBaseRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoBaseRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class ExploracionOsmService {

    private static final Logger log = LoggerFactory.getLogger(ExploracionOsmService.class);
    private static final String OVERPASS_URL = "https://overpass-api.de/api/interpreter";
    private static final String USER_AGENT = "Digital-FIT/2.0 (contacto: soporte@digitalfit.local; https://github.com/Manuelklk03/Digital-Fit-2.0)";
    private static final long RATE_LIMIT_MS = 1000L;

    @Autowired
    private CentroPrivadoBaseRepository centroPrivadoBaseRepository;

    @Autowired
    private LugarPublicoBaseRepository lugarPublicoBaseRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Caché geográfica en memoria para evitar saturar Overpass
    private final Map<String, List<LugarExploracionDTO>> cacheOverpass = new ConcurrentHashMap<>();
    private final AtomicLong ultimaPeticionOverpassMs = new AtomicLong(0);

    public List<LugarExploracionDTO> explorar(Double latitud, Double longitud, Double radioKm, String categoriaFiltro) {
        if (latitud == null || longitud == null) {
            return List.of();
        }

        double radio = (radioKm == null || radioKm <= 0) ? 5.0 : Math.min(radioKm, 20.0);
        String categoria = (categoriaFiltro == null || categoriaFiltro.trim().equalsIgnoreCase("TODOS"))
                ? null
                : categoriaFiltro.trim().toUpperCase(Locale.ROOT);

        List<LugarExploracionDTO> resultados = new ArrayList<>();
        Set<String> nombresUnicos = new HashSet<>();

        // 1. Incorporar lugares propios de la base de datos local
        agregarLugaresLocales(latitud, longitud, radio, categoria, resultados, nombresUnicos);

        // 2. Incorporar puntos de OpenStreetMap (Overpass) con caché
        agregarLugaresOsm(latitud, longitud, radio, categoria, resultados, nombresUnicos);

        // 3. Ordenar por distancia geodésica ascendente
        resultados.sort(Comparator.comparing(
                LugarExploracionDTO::getDistanciaKm,
                Comparator.nullsLast(Double::compareTo)));

        // Limitar a máximo 80 resultados para mantener la respuesta ligera
        if (resultados.size() > 80) {
            return resultados.subList(0, 80);
        }

        return resultados;
    }

    private void agregarLugaresLocales(Double centroLat, Double centroLon, double radioKm, String categoria,
            List<LugarExploracionDTO> resultados, Set<String> nombresUnicos) {

        // Centros privados locales
        if (categoria == null || categoria.equals("GIMNASIO")) {
            List<CentroPrivadoBase> privados = centroPrivadoBaseRepository.findAll();
            for (CentroPrivadoBase cp : privados) {
                if (cp.getLatitud() != null && cp.getLongitud() != null) {
                    double dist = calcularDistanciaKm(centroLat, centroLon, cp.getLatitud(), cp.getLongitud());
                    if (dist <= radioKm) {
                        nombresUnicos.add(normalizarNombre(cp.getNombre()));
                        resultados.add(LugarExploracionDTO.builder()
                                .id(cp.getId())
                                .osmId(cp.getOsmId())
                                .nombre(cp.getNombre())
                                .categoria("GIMNASIO")
                                .tipoOrigen("LOCAL_PRIVADO")
                                .direccion(cp.getDireccion())
                                .latitud(cp.getLatitud())
                                .longitud(cp.getLongitud())
                                .telefono(cp.getTelefono())
                                .horario(cp.getHorario())
                                .precioMensual(cp.getPrecioMensual())
                                .distanciaKm(dist)
                                .build());
                    }
                }
            }
        }

        // Lugares públicos locales
        List<LugarPublicoBase> publicos = lugarPublicoBaseRepository.findAll();
        for (LugarPublicoBase lp : publicos) {
            if (lp.getLatitud() != null && lp.getLongitud() != null) {
                String catPublico = mapearTipoPublico(lp.getTipo());
                if (categoria == null || categoria.equals(catPublico)) {
                    double dist = calcularDistanciaKm(centroLat, centroLon, lp.getLatitud(), lp.getLongitud());
                    if (dist <= radioKm) {
                        nombresUnicos.add(normalizarNombre(lp.getNombre()));
                        resultados.add(LugarExploracionDTO.builder()
                                .id(lp.getId())
                                .osmId(lp.getOsmId())
                                .nombre(lp.getNombre())
                                .categoria(catPublico)
                                .tipoOrigen("LOCAL_PUBLICO")
                                .direccion(lp.getDireccion())
                                .latitud(lp.getLatitud())
                                .longitud(lp.getLongitud())
                                .telefono(lp.getTelefono())
                                .horario(lp.getHorario())
                                .equipamiento(lp.getDescripcion())
                                .distanciaKm(dist)
                                .build());
                    }
                }
            }
        }
    }

    private void agregarLugaresOsm(Double latitud, Double longitud, double radioKm, String categoria,
            List<LugarExploracionDTO> resultados, Set<String> nombresUnicos) {

        String claveCache = String.format(Locale.US, "%.2f_%.2f_%.1f", latitud, longitud, radioKm);
        List<LugarExploracionDTO> lugaresOsm = cacheOverpass.get(claveCache);

        if (lugaresOsm == null) {
            lugaresOsm = consultarOverpass(latitud, longitud, radioKm);
            if (cacheOverpass.size() > 50) {
                cacheOverpass.clear();
            }
            cacheOverpass.put(claveCache, lugaresOsm);
        }

        for (LugarExploracionDTO osm : lugaresOsm) {
            if (categoria != null && !categoria.equals(osm.getCategoria())) {
                continue;
            }

            String normalizado = normalizarNombre(osm.getNombre());
            if (!nombresUnicos.contains(normalizado)) {
                nombresUnicos.add(normalizado);
                double dist = calcularDistanciaKm(latitud, longitud, osm.getLatitud(), osm.getLongitud());
                if (dist <= radioKm) {
                    LugarExploracionDTO copia = LugarExploracionDTO.builder()
                            .osmId(osm.getOsmId())
                            .nombre(osm.getNombre())
                            .categoria(osm.getCategoria())
                            .tipoOrigen(osm.getTipoOrigen())
                            .direccion(osm.getDireccion())
                            .latitud(osm.getLatitud())
                            .longitud(osm.getLongitud())
                            .telefono(osm.getTelefono())
                            .horario(osm.getHorario())
                            .equipamiento(osm.getEquipamiento())
                            .distanciaKm(dist)
                            .build();
                    resultados.add(copia);
                }
            }
        }
    }

    private List<LugarExploracionDTO> consultarOverpass(Double latitud, Double longitud, double radioKm) {
        aplicarRateLimit();
        List<LugarExploracionDTO> encontrados = new ArrayList<>();
        int radioMetros = (int) Math.round(radioKm * 1000);

        String query = String.format(Locale.US, """
                [out:json][timeout:15];
                (
                  nwr(around:%d,%.6f,%.6f)[leisure=fitness_centre];
                  nwr(around:%d,%.6f,%.6f)[amenity=gym];
                  nwr(around:%d,%.6f,%.6f)[leisure=fitness_station];
                  nwr(around:%d,%.6f,%.6f)[leisure=sports_centre];
                  nwr(around:%d,%.6f,%.6f)[leisure=swimming_pool];
                  nwr(around:%d,%.6f,%.6f)[leisure=pitch];
                  nwr(around:%d,%.6f,%.6f)[leisure=track];
                );
                out center tags;
                """,
                radioMetros, latitud, longitud,
                radioMetros, latitud, longitud,
                radioMetros, latitud, longitud,
                radioMetros, latitud, longitud,
                radioMetros, latitud, longitud,
                radioMetros, latitud, longitud,
                radioMetros, latitud, longitud);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OVERPASS_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("User-Agent", USER_AGENT)
                    .POST(HttpRequest.BodyPublishers.ofString("data=" + URLEncoder.encode(query, StandardCharsets.UTF_8)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300 && response.body() != null) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode elements = root.path("elements");
                if (elements.isArray()) {
                    for (JsonNode el : elements) {
                        LugarExploracionDTO dto = mapearElementoOsm(el);
                        if (dto != null) {
                            encontrados.add(dto);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Fallo consultando Overpass API para ({}, {}): {}", latitud, longitud, e.getMessage());
        }

        return encontrados;
    }

    private LugarExploracionDTO mapearElementoOsm(JsonNode el) {
        JsonNode tags = el.path("tags");
        if (tags.isMissingNode() || tags.isEmpty()) {
            return null;
        }

        long osmId = el.path("id").asLong(0L);
        double lat = el.has("lat") ? el.path("lat").asDouble() : el.path("center").path("lat").asDouble(0.0);
        double lon = el.has("lon") ? el.path("lon").asDouble() : el.path("center").path("lon").asDouble(0.0);

        if (lat == 0.0 && lon == 0.0) {
            return null;
        }

        String nombre = tags.path("name").asText("").trim();
        String categoria = determinarCategoria(tags);

        if (nombre.isBlank()) {
            nombre = "Zona de " + categoria.toLowerCase(Locale.ROOT) + " (OSM #" + osmId + ")";
        }

        String direccion = construirDireccionDesdeTags(tags);
        String telefono = primerValorNoVacio(
                tags.path("phone").asText(""),
                tags.path("contact:phone").asText(""));
        String horario = tags.path("opening_hours").asText("");
        String equipamiento = primerValorNoVacio(
                tags.path("sport").asText(""),
                tags.path("description").asText(""));

        return LugarExploracionDTO.builder()
                .osmId(osmId)
                .nombre(nombre)
                .categoria(categoria)
                .tipoOrigen("OSM")
                .direccion(direccion)
                .latitud(lat)
                .longitud(lon)
                .telefono(telefono)
                .horario(horario)
                .equipamiento(equipamiento)
                .build();
    }

    private String determinarCategoria(JsonNode tags) {
        String leisure = tags.path("leisure").asText("");
        String amenity = tags.path("amenity").asText("");
        String sport = tags.path("sport").asText("");

        if (leisure.equalsIgnoreCase("fitness_station") || sport.contains("calisthenics")) {
            return "CALISTENIA";
        }
        if (leisure.equalsIgnoreCase("fitness_centre") || amenity.equalsIgnoreCase("gym")) {
            return "GIMNASIO";
        }
        if (leisure.equalsIgnoreCase("swimming_pool") || sport.contains("swimming")) {
            return "PISCINA";
        }
        if (leisure.equalsIgnoreCase("sports_centre") || leisure.equalsIgnoreCase("stadium")
                || leisure.equalsIgnoreCase("pitch") || leisure.equalsIgnoreCase("track")) {
            return "POLIDEPORTIVO";
        }
        return "OTRO";
    }

    private String mapearTipoPublico(TipoLugarPublico tipo) {
        if (tipo == null) return "OTRO";
        String s = tipo.name().toUpperCase(Locale.ROOT);
        if (s.contains("CALISTENIA") || s.contains("PARQUE")) return "CALISTENIA";
        if (s.contains("POLIDEPORTIVO") || s.contains("CAMPO")) return "POLIDEPORTIVO";
        if (s.contains("PISCINA")) return "PISCINA";
        return "OTRO";
    }

    private String construirDireccionDesdeTags(JsonNode tags) {
        String calle = tags.path("addr:street").asText("").trim();
        String numero = tags.path("addr:housenumber").asText("").trim();
        String ciudad = tags.path("addr:city").asText("Valencia").trim();

        if (!calle.isBlank()) {
            return numero.isBlank() ? calle + ", " + ciudad : calle + " " + numero + ", " + ciudad;
        }
        return "Coordenadas OpenStreetMap";
    }

    private String primerValorNoVacio(String... valores) {
        for (String v : valores) {
            if (v != null && !v.trim().isBlank()) {
                return v.trim();
            }
        }
        return "";
    }

    private String normalizarNombre(String nombre) {
        if (nombre == null) return "";
        return nombre.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    private synchronized void aplicarRateLimit() {
        long ahora = System.currentTimeMillis();
        long anterior = ultimaPeticionOverpassMs.get();
        long transcurrido = ahora - anterior;
        if (transcurrido < RATE_LIMIT_MS) {
            try {
                Thread.sleep(RATE_LIMIT_MS - transcurrido);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        ultimaPeticionOverpassMs.set(System.currentTimeMillis());
    }

    public double calcularDistanciaKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }
}
