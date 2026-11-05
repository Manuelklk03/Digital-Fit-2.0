package com.example.digital_fit.service.Explorar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.example.digital_fit.dto.Explorar.GeocodificacionResultadoDTO;

class GeocodificacionServiceTest {

    private GeocodificacionService geocodificacionService;

    @BeforeEach
    void setUp() {
        geocodificacionService = new GeocodificacionService();
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

