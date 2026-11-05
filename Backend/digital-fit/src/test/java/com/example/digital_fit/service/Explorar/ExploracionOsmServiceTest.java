package com.example.digital_fit.service.Explorar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.digital_fit.dto.Explorar.LugarExploracionDTO;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoBaseRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoBaseRepository;

@ExtendWith(MockitoExtension.class)
class ExploracionOsmServiceTest {

    @Mock
    private CentroPrivadoBaseRepository centroPrivadoBaseRepository;

    @Mock
    private LugarPublicoBaseRepository lugarPublicoBaseRepository;

    @InjectMocks
    private ExploracionOsmService exploracionOsmService;

    private CentroPrivadoBase gymTest;
    private LugarPublicoBase calisteniaTest;

    @BeforeEach
    void setUp() {
        gymTest = CentroPrivadoBase.builder()
                .id(1L)
                .osmId(12345L)
                .nombre("Gym Valencia Centro")
                .direccion("Calle Colon, 10, Valencia")
                .latitud(39.4699)
                .longitud(-0.3763)
                .precioMensual(45.0)
                .build();

        calisteniaTest = LugarPublicoBase.builder()
                .id(2L)
                .osmId(67890L)
                .nombre("Parque Calistenia Turia")
                .direccion("Jardin del Turia Tramo IX, Valencia")
                .latitud(39.4722)
                .longitud(-0.3712)
                .tipo(TipoLugarPublico.PARQUE_CALISTENIA)
                .descripcion("Barras paralelas y dominadas")
                .build();
    }

    @Test
    void testCalcularDistanciaKm() {
        // Distancia aproximada entre Plaza del Ayuntamiento y La Petxina: ~1.2 km
        double dist = exploracionOsmService.calcularDistanciaKm(39.4699, -0.3763, 39.4729, -0.3895);
        assertTrue(dist >= 1.0 && dist <= 1.5, "La distancia debe estar entre 1.0 y 1.5 km");
    }

    @Test
    void testExplorarRetornaVacioSiCoordenadasNulas() {
        List<LugarExploracionDTO> res = exploracionOsmService.explorar(null, null, 5.0, "TODOS");
        assertTrue(res.isEmpty());
    }

    @Test
    void testExplorarIncorporaLugaresLocalesOrdenadosPorDistancia() {
        when(centroPrivadoBaseRepository.findAll()).thenReturn(List.of(gymTest));
        when(lugarPublicoBaseRepository.findAll()).thenReturn(List.of(calisteniaTest));

        // Punto de referencia: 39.4700, -0.3760 (cerca de gymTest)
        List<LugarExploracionDTO> res = exploracionOsmService.explorar(39.4700, -0.3760, 5.0, "TODOS");

        assertNotNull(res);
        assertFalse(res.isEmpty());

        // Debe contener los dos lugares locales
        boolean tieneGym = res.stream().anyMatch(l -> l.getNombre().equals("Gym Valencia Centro"));
        boolean tieneCalistenia = res.stream().anyMatch(l -> l.getNombre().equals("Parque Calistenia Turia"));

        assertTrue(tieneGym);
        assertTrue(tieneCalistenia);

        // El gym está más cerca que la calistenia del punto (39.4700, -0.3760)
        assertEquals("Gym Valencia Centro", res.get(0).getNombre());
    }

    @Test
    void testExplorarFiltraPorCategoriaGimnasio() {
        when(centroPrivadoBaseRepository.findAll()).thenReturn(List.of(gymTest));

        List<LugarExploracionDTO> res = exploracionOsmService.explorar(39.4700, -0.3760, 5.0, "GIMNASIO");

        assertNotNull(res);
        for (LugarExploracionDTO l : res) {
            assertEquals("GIMNASIO", l.getCategoria());
        }
    }

    @Test
    void testExplorarMapeaTiposLugaresPublicos() {
        LugarPublicoBase piscina = LugarPublicoBase.builder()
                .id(3L)
                .nombre("Piscina Municipal")
                .latitud(39.4650)
                .longitud(-0.3750)
                .tipo(TipoLugarPublico.PISCINA_PUBLICA)
                .build();

        LugarPublicoBase polideportivo = LugarPublicoBase.builder()
                .id(4L)
                .nombre("Pabellon Polideportivo")
                .latitud(39.4660)
                .longitud(-0.3740)
                .tipo(TipoLugarPublico.ZONA_MULTIDEPORTE)
                .build();

        LugarPublicoBase sendero = LugarPublicoBase.builder()
                .id(5L)
                .nombre("Ruta Senderismo")
                .latitud(39.4670)
                .longitud(-0.3730)
                .tipo(TipoLugarPublico.RUTA_SENDERISMO)
                .build();

        when(lugarPublicoBaseRepository.findAll()).thenReturn(List.of(piscina, polideportivo, sendero));

        List<LugarExploracionDTO> resPiscina = exploracionOsmService.explorar(39.4650, -0.3750, 5.0, "PISCINA");
        assertEquals(1, resPiscina.size());
        assertEquals("PISCINA", resPiscina.get(0).getCategoria());

        List<LugarExploracionDTO> resPoli = exploracionOsmService.explorar(39.4660, -0.3740, 5.0, "POLIDEPORTIVO");
        assertEquals(1, resPoli.size());
        assertEquals("POLIDEPORTIVO", resPoli.get(0).getCategoria());

        List<LugarExploracionDTO> resOtro = exploracionOsmService.explorar(39.4670, -0.3730, 5.0, "OTRO");
        assertEquals(1, resOtro.size());
        assertEquals("OTRO", resOtro.get(0).getCategoria());
    }
}
