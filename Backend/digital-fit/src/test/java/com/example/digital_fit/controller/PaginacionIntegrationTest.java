package com.example.digital_fit.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.digital_fit.config.SecurityConfig;
import com.example.digital_fit.controller.CentroPrivado.CentroPrivadoBaseRestController;
import com.example.digital_fit.controller.CentroPrivado.CentroPrivadoUsuarioRestController;
import com.example.digital_fit.controller.Entrenamientos.EntrenamientoBaseRestController;
import com.example.digital_fit.controller.Entrenamientos.EntrenamientoComunidadRestController;
import com.example.digital_fit.controller.Entrenamientos.EntrenamientoUsuarioRestController;
import com.example.digital_fit.controller.Entrenamientos.HistorialEntrenamientosRestController;
import com.example.digital_fit.controller.LugarPublico.LugarPublicoBaseRestController;
import com.example.digital_fit.controller.LugarPublico.LugarPublicoUsuarioRestController;
import com.example.digital_fit.controller.Valoracion.ValoracionRestController;
import com.example.digital_fit.dto.CentroPrivado.CentroPrivadoBaseDTO;
import com.example.digital_fit.dto.CentroPrivado.CentroPrivadoUsuarioDTO;
import com.example.digital_fit.dto.comun.PaginaResponse;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoBaseDTO;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoComunidadDTO;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoUsuarioDTO;
import com.example.digital_fit.dto.Entrenamientos.HistorialEntrenamientosDTO;
import com.example.digital_fit.dto.LugarPublico.LugarPublicoBaseDTO;
import com.example.digital_fit.dto.LugarPublico.LugarPublicoUsuarioDTO;
import com.example.digital_fit.dto.Valoracion.ValoracionDTO;
import com.example.digital_fit.handler.GlobalExceptionHandler;
import com.example.digital_fit.model.Enums.TipoDeValoracion;
import com.example.digital_fit.service.CentroPrivado.AutocompletadoCentroPrivadoService;
import com.example.digital_fit.service.CentroPrivado.CentroPrivadoBaseService;
import com.example.digital_fit.service.CentroPrivado.CentroPrivadoUsuarioService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoBaseService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoComunidadService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoUsuarioService;
import com.example.digital_fit.service.Entrenamientos.HistorialEntrenamientosService;
import com.example.digital_fit.service.LugarPublico.AutocompletadoLugarPublicoService;
import com.example.digital_fit.service.LugarPublico.LugarPublicoBaseService;
import com.example.digital_fit.service.LugarPublico.LugarPublicoUsuarioService;
import com.example.digital_fit.service.Valoracion.ValoracionService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@WebMvcTest(controllers = {
        EntrenamientoBaseRestController.class,
        EntrenamientoUsuarioRestController.class,
        EntrenamientoComunidadRestController.class,
        HistorialEntrenamientosRestController.class,
        CentroPrivadoBaseRestController.class,
        CentroPrivadoUsuarioRestController.class,
        LugarPublicoBaseRestController.class,
        LugarPublicoUsuarioRestController.class,
        ValoracionRestController.class
})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
@DisplayName("Pruebas de integración de paginación y ordenación en endpoints REST")
class PaginacionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EntrenamientoBaseService entrenamientoBaseService;

    @MockitoBean
    private EntrenamientoUsuarioService entrenamientoUsuarioService;

    @MockitoBean
    private EntrenamientoComunidadService entrenamientoComunidadService;

    @MockitoBean
    private HistorialEntrenamientosService historialEntrenamientosService;

    @MockitoBean
    private CentroPrivadoBaseService centroPrivadoBaseService;

    @MockitoBean
    private CentroPrivadoUsuarioService centroPrivadoUsuarioService;

    @MockitoBean
    private AutocompletadoCentroPrivadoService autocompletadoCentroPrivadoService;

    @MockitoBean
    private LugarPublicoBaseService lugarPublicoBaseService;

    @MockitoBean
    private LugarPublicoUsuarioService lugarPublicoUsuarioService;

    @MockitoBean
    private AutocompletadoLugarPublicoService autocompletadoLugarPublicoService;

    @MockitoBean
    private ValoracionService valoracionService;

    @Test
    @DisplayName("GET /api/entrenamientos devuelve PaginaResponse con estructura y valores por defecto")
    void testListarEntrenamientosBasePaginacionPorDefecto() throws Exception {
        EntrenamientoBaseDTO dto = new EntrenamientoBaseDTO();
        dto.setId(1L);
        dto.setNombre("Full Body Fuerza");

        PaginaResponse<EntrenamientoBaseDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(entrenamientoBaseService.listarOFiltrarPaginado(any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/entrenamientos")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].nombre").value("Full Body Fuerza"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(entrenamientoBaseService).listarOFiltrarPaginado(any(), any(), any(), any(), captor.capture());
        assertEquals(0, captor.getValue().getPageNumber());
        assertEquals(20, captor.getValue().getPageSize());
    }

    @Test
    @DisplayName("GET /api/entrenamientos con page, size y sort personalizados los propaga correctamente")
    void testListarEntrenamientosBaseParametrosPersonalizados() throws Exception {
        PaginaResponse<EntrenamientoBaseDTO> paginaVacia = new PaginaResponse<>(
                List.of(), 2, 10, 45, 5);

        when(entrenamientoBaseService.listarOFiltrarPaginado(any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(paginaVacia);

        mockMvc.perform(get("/api/entrenamientos")
                        .param("page", "2")
                        .param("size", "10")
                        .param("sort", "nombre,desc")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(45))
                .andExpect(jsonPath("$.totalPages").value(5));

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(entrenamientoBaseService).listarOFiltrarPaginado(any(), any(), any(), any(), captor.capture());
        assertEquals(2, captor.getValue().getPageNumber());
        assertEquals(10, captor.getValue().getPageSize());
        assertTrue(captor.getValue().getSort().getOrderFor("nombre").isDescending());
    }

    @Test
    @DisplayName("GET /api/mis-entrenamientos autenticado aplica paginación con aislamiento de usuario")
    void testListarMisEntrenamientosPaginado() throws Exception {
        EntrenamientoUsuarioDTO dto = new EntrenamientoUsuarioDTO();
        dto.setId(10L);
        dto.setNombre("Mi Rutina Calistenia");

        PaginaResponse<EntrenamientoUsuarioDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(entrenamientoUsuarioService.listarOFiltrarPaginado(eq("usuario1"), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/mis-entrenamientos")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(10))
                .andExpect(jsonPath("$.content[0].nombre").value("Mi Rutina Calistenia"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20));

        verify(entrenamientoUsuarioService).listarOFiltrarPaginado(eq("usuario1"), any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/centros-privados devuelve estructura paginada PaginaResponse")
    void testListarCentrosPrivadosPaginado() throws Exception {
        CentroPrivadoBaseDTO dto = new CentroPrivadoBaseDTO();
        dto.setId(5L);
        dto.setNombre("Gimnasio Central");

        PaginaResponse<CentroPrivadoBaseDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(centroPrivadoBaseService.listarOFiltrarPaginado(any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/centros-privados")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(5))
                .andExpect(jsonPath("$.content[0].nombre").value("Gimnasio Central"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/valoraciones/publicas devuelve estructura paginada PaginaResponse")
    void testListarValoracionesPublicasPaginado() throws Exception {
        ValoracionDTO dto = new ValoracionDTO();
        dto.setId(100L);
        dto.setPuntuacion(5);

        PaginaResponse<ValoracionDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(valoracionService.listarValoracionesPublicasPaginado(any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/valoraciones/publicas")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(100))
                .andExpect(jsonPath("$.content[0].puntuacion").value(5))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/entrenamientos-comunidad devuelve PaginaResponse")
    void testListarEntrenamientosComunidadPaginado() throws Exception {
        EntrenamientoComunidadDTO dto = new EntrenamientoComunidadDTO();
        dto.setId(12L);
        dto.setNombre("Comunidad WOD");

        PaginaResponse<EntrenamientoComunidadDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(entrenamientoComunidadService.listarOFiltrarPaginado(any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/entrenamientos-comunidad")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(12))
                .andExpect(jsonPath("$.content[0].nombre").value("Comunidad WOD"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/entrenamientos/mi-historial devuelve PaginaResponse")
    void testListarMiHistorialPaginado() throws Exception {
        HistorialEntrenamientosDTO dto = new HistorialEntrenamientosDTO();
        dto.setId(30L);

        PaginaResponse<HistorialEntrenamientosDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(historialEntrenamientosService.listarOFiltrarHistorialPaginado(eq("usuario1"), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/entrenamientos/mi-historial")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(30))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/entrenamientos/mi-historial?q=fuerza busca por texto y devuelve PaginaResponse")
    void testListarMiHistorialConParametroQPaginado() throws Exception {
        HistorialEntrenamientosDTO dto = new HistorialEntrenamientosDTO();
        dto.setId(31L);

        PaginaResponse<HistorialEntrenamientosDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(historialEntrenamientosService.listarOFiltrarHistorialPaginado(eq("usuario1"), eq("fuerza"), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/entrenamientos/mi-historial")
                        .param("q", "fuerza")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(31))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/mis-centros-privados devuelve PaginaResponse")
    void testListarMisCentrosPrivadosPaginado() throws Exception {
        CentroPrivadoUsuarioDTO dto = new CentroPrivadoUsuarioDTO();
        dto.setId(40L);
        dto.setNombre("Mi Gym Privado");

        PaginaResponse<CentroPrivadoUsuarioDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(centroPrivadoUsuarioService.listarOFiltrarPaginado(eq("usuario1"), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/mis-centros-privados")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(40))
                .andExpect(jsonPath("$.content[0].nombre").value("Mi Gym Privado"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/lugares-publicos devuelve PaginaResponse")
    void testListarLugaresPublicosPaginado() throws Exception {
        LugarPublicoBaseDTO dto = new LugarPublicoBaseDTO();
        dto.setId(50L);
        dto.setNombre("Parque Calistenia Base");

        PaginaResponse<LugarPublicoBaseDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(lugarPublicoBaseService.listarOFiltrarPaginado(any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/lugares-publicos")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(50))
                .andExpect(jsonPath("$.content[0].nombre").value("Parque Calistenia Base"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/mis-lugares-publicos devuelve PaginaResponse")
    void testListarMisLugaresPublicosPaginado() throws Exception {
        LugarPublicoUsuarioDTO dto = new LugarPublicoUsuarioDTO();
        dto.setId(60L);
        dto.setNombre("Mi Parque Favorito");

        PaginaResponse<LugarPublicoUsuarioDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(lugarPublicoUsuarioService.listarOFiltrarPaginado(eq("usuario1"), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/mis-lugares-publicos")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(60))
                .andExpect(jsonPath("$.content[0].nombre").value("Mi Parque Favorito"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/valoraciones/mis-valoraciones devuelve PaginaResponse")
    void testListarMisValoracionesPaginado() throws Exception {
        ValoracionDTO dto = new ValoracionDTO();
        dto.setId(70L);
        dto.setPuntuacion(4);

        PaginaResponse<ValoracionDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(valoracionService.listarMisValoracionesPaginado(eq("usuario1"), any(), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/valoraciones/mis-valoraciones")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(70))
                .andExpect(jsonPath("$.content[0].puntuacion").value(4))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/valoraciones/mis-valoraciones con parametro q filtra por texto")
    void testListarMisValoracionesConParametroQ() throws Exception {
        ValoracionDTO dto = new ValoracionDTO();
        dto.setId(71L);
        dto.setPuntuacion(5);
        dto.setComentario("Excelente entrenamiento");

        PaginaResponse<ValoracionDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(valoracionService.listarMisValoracionesPaginado(eq("usuario1"), eq("excelente"), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/valoraciones/mis-valoraciones?q=excelente")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(71))
                .andExpect(jsonPath("$.content[0].comentario").value("Excelente entrenamiento"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/valoraciones/{tipoContenido}/{idContenido} devuelve PaginaResponse")
    void testListarValoracionesPorContenidoPaginado() throws Exception {
        ValoracionDTO dto = new ValoracionDTO();
        dto.setId(80L);
        dto.setPuntuacion(5);

        PaginaResponse<ValoracionDTO> pagina = new PaginaResponse<>(
                List.of(dto), 0, 20, 1, 1);

        when(valoracionService.listarPorContenidoPaginado(eq(TipoDeValoracion.ENTRENAMIENTO_BASE), eq(1L), any(Pageable.class)))
                .thenReturn(pagina);

        mockMvc.perform(get("/api/valoraciones/ENTRENAMIENTO_BASE/1")
                        .with(user("usuario1").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(80))
                .andExpect(jsonPath("$.content[0].puntuacion").value(5))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
