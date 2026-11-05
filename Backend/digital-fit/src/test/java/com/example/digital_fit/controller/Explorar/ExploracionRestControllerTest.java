package com.example.digital_fit.controller.Explorar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.digital_fit.dto.Explorar.GeocodificacionResultadoDTO;
import com.example.digital_fit.dto.Explorar.LugarExploracionDTO;
import com.example.digital_fit.service.Explorar.ExploracionOsmService;
import com.example.digital_fit.service.Explorar.GeocodificacionService;

@ExtendWith(MockitoExtension.class)
class ExploracionRestControllerTest {

    @Mock
    private ExploracionOsmService exploracionOsmService;

    @Mock
    private GeocodificacionService geocodificacionService;

    @InjectMocks
    private ExploracionRestController exploracionRestController;

    @Test
    void testBuscarLugaresPorZona() {
        LugarExploracionDTO lugar = LugarExploracionDTO.builder()
                .id(1L)
                .nombre("Gym Test")
                .categoria("GIMNASIO")
                .latitud(39.4699)
                .longitud(-0.3763)
                .distanciaKm(0.4)
                .build();

        when(exploracionOsmService.explorar(39.4699, -0.3763, 5.0, "GIMNASIO"))
                .thenReturn(List.of(lugar));

        ResponseEntity<List<LugarExploracionDTO>> response = exploracionRestController.buscarLugaresPorZona(
                39.4699, -0.3763, 5.0, "GIMNASIO");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Gym Test", response.getBody().get(0).getNombre());
    }

    @Test
    void testGeocodificarDireccion() {
        GeocodificacionResultadoDTO geo = GeocodificacionResultadoDTO.builder()
                .nombre("Plaza del Ayuntamiento")
                .direccionCompleta("Plaza del Ayuntamiento, Valencia, España")
                .latitud(39.4699)
                .longitud(-0.3763)
                .tipo("pedestrian")
                .build();

        when(geocodificacionService.buscar("Valencia")).thenReturn(List.of(geo));

        ResponseEntity<List<GeocodificacionResultadoDTO>> response = exploracionRestController.geocodificarDireccion("Valencia");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Plaza del Ayuntamiento", response.getBody().get(0).getNombre());
    }

    @Test
    void testGeocodificarInversa() {
        GeocodificacionResultadoDTO geo = GeocodificacionResultadoDTO.builder()
                .nombre("Calle Colon")
                .direccionCompleta("Calle Colon, 1, Valencia")
                .latitud(39.47)
                .longitud(-0.37)
                .build();

        when(geocodificacionService.reversa(39.47, -0.37)).thenReturn(geo);

        ResponseEntity<GeocodificacionResultadoDTO> response = exploracionRestController.geocodificarInversa(39.47, -0.37);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Calle Colon", response.getBody().getNombre());
    }
}
