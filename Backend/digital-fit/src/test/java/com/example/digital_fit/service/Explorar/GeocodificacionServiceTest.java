package com.example.digital_fit.service.Explorar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.digital_fit.dto.Explorar.GeocodificacionResultadoDTO;

class GeocodificacionServiceTest {

    private HttpClient mockHttpClient;
    private GeocodificacionService geocodificacionService;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        mockHttpClient = mock(HttpClient.class);
        geocodificacionService = new GeocodificacionService(mockHttpClient);
    }

    @Test
    void testBuscarCadenaNulaOVaciaRetornaListaVacia() {
        assertTrue(geocodificacionService.buscar(null).isEmpty());
        assertTrue(geocodificacionService.buscar("").isEmpty());
        assertTrue(geocodificacionService.buscar("   ").isEmpty());
    }

    @Test
    void testReversaCoordenadasNulasRetornaNull() {
        assertNull(geocodificacionService.reversa(null, null));
        assertNull(geocodificacionService.reversa(39.4, null));
        assertNull(geocodificacionService.reversa(null, -0.3));
    }

    @Test
    @SuppressWarnings("unchecked")
    void testBuscarLlamaHttpYParseaResultados() throws Exception {
        String jsonRespuesta = """
                [
                  {
                    "lat": "39.4699",
                    "lon": "-0.3763",
                    "name": "Plaza del Ayuntamiento",
                    "display_name": "Plaza del Ayuntamiento, Valencia, España",
                    "type": "plaza"
                  }
                ]
                """;
        HttpResponse<String> mockResponse = mock(HttpResponse.class);
        when(mockResponse.statusCode()).thenReturn(200);
        when(mockResponse.body()).thenReturn(jsonRespuesta);
        when(mockHttpClient.send(any(), any(HttpResponse.BodyHandler.class))).thenReturn(mockResponse);

        List<GeocodificacionResultadoDTO> resultados = geocodificacionService.buscar("Valencia Centro");

        assertNotNull(resultados);
        assertEquals(1, resultados.size());
        assertEquals("Plaza del Ayuntamiento", resultados.get(0).getNombre());
        assertEquals(39.4699, resultados.get(0).getLatitud());
        assertEquals(-0.3763, resultados.get(0).getLongitud());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testReversaLlamaHttpYParseaResultado() throws Exception {
        String jsonRespuesta = """
                {
                  "lat": "39.4700",
                  "lon": "-0.3700",
                  "name": "Calle Colon",
                  "display_name": "Calle Colon, 10, Valencia",
                  "type": "calle"
                }
                """;
        HttpResponse<String> mockResponse = mock(HttpResponse.class);
        when(mockResponse.statusCode()).thenReturn(200);
        when(mockResponse.body()).thenReturn(jsonRespuesta);
        when(mockHttpClient.send(any(), any(HttpResponse.BodyHandler.class))).thenReturn(mockResponse);

        GeocodificacionResultadoDTO res = geocodificacionService.reversa(39.4700, -0.3700);

        assertNotNull(res);
        assertEquals("Calle Colon", res.getNombre());
        assertEquals(39.4700, res.getLatitud());
        assertEquals(-0.3700, res.getLongitud());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testBuscarRecuperaDeCacheSiExiste() throws Exception {
        Field cacheField = GeocodificacionService.class.getDeclaredField("cacheBusqueda");
        cacheField.setAccessible(true);
        Map<String, List<GeocodificacionResultadoDTO>> cache =
                (Map<String, List<GeocodificacionResultadoDTO>>) cacheField.get(geocodificacionService);

        GeocodificacionResultadoDTO dto = GeocodificacionResultadoDTO.builder()
                .nombre("Plaza del Ayuntamiento")
                .direccionCompleta("Plaza del Ayuntamiento, Valencia")
                .latitud(39.4699)
                .longitud(-0.3763)
                .tipo("plaza")
                .build();
        cache.put("valencia", List.of(dto));

        List<GeocodificacionResultadoDTO> resultados = geocodificacionService.buscar("  Valencia  ");

        assertNotNull(resultados);
        assertEquals(1, resultados.size());
        assertEquals("Plaza del Ayuntamiento", resultados.get(0).getNombre());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testReversaRecuperaDeCacheSiExiste() throws Exception {
        Field cacheField = GeocodificacionService.class.getDeclaredField("cacheInversa");
        cacheField.setAccessible(true);
        Map<String, GeocodificacionResultadoDTO> cache =
                (Map<String, GeocodificacionResultadoDTO>) cacheField.get(geocodificacionService);

        GeocodificacionResultadoDTO dto = GeocodificacionResultadoDTO.builder()
                .nombre("Calle Colon")
                .direccionCompleta("Calle Colon, 10, Valencia")
                .latitud(39.4700)
                .longitud(-0.3700)
                .tipo("calle")
                .build();
        String claveCache = String.format("%.4f_%.4f", 39.4700, -0.3700);
        cache.put(claveCache, dto);

        GeocodificacionResultadoDTO resultado = geocodificacionService.reversa(39.4700, -0.3700);

        assertNotNull(resultado);
        assertEquals("Calle Colon", resultado.getNombre());
    }
}
