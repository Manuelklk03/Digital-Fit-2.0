package com.example.digital_fit.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoUsuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoBase;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoComunidad;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoUsuario;
import com.example.digital_fit.model.Entrenamientos.HistorialEntrenamientos;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;
import com.example.digital_fit.model.Enums.TipoDeValoracion;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;
import com.example.digital_fit.model.LugarPublico.LugarPublicoUsuario;
import com.example.digital_fit.model.Valoracion.Valoracion;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoBaseRepository;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoUsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoBaseRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoComunidadRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoUsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.HistorialEntrenamientosRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoBaseRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoUsuarioRepository;
import com.example.digital_fit.repository.Valoracion.ValoracionRepository;
import com.example.digital_fit.service.CentroPrivado.CentroPrivadoBaseService;
import com.example.digital_fit.service.CentroPrivado.CentroPrivadoUsuarioService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoBaseService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoComunidadService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoUsuarioService;
import com.example.digital_fit.service.Entrenamientos.HistorialEntrenamientosService;
import com.example.digital_fit.service.LugarPublico.LugarPublicoBaseService;
import com.example.digital_fit.service.LugarPublico.LugarPublicoUsuarioService;
import com.example.digital_fit.service.Valoracion.ValoracionService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas unitarias de métodos paginados en capa de servicios")
class PaginacionServicesTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EntrenamientoBaseRepository entrenamientoBaseRepository;

    @Mock
    private EntrenamientoComunidadRepository entrenamientoComunidadRepository;

    @Mock
    private EntrenamientoUsuarioRepository entrenamientoUsuarioRepository;

    @Mock
    private HistorialEntrenamientosRepository historialEntrenamientosRepository;

    @Mock
    private CentroPrivadoBaseRepository centroPrivadoBaseRepository;

    @Mock
    private CentroPrivadoUsuarioRepository centroPrivadoUsuarioRepository;

    @Mock
    private LugarPublicoBaseRepository lugarPublicoBaseRepository;

    @Mock
    private LugarPublicoUsuarioRepository lugarPublicoUsuarioRepository;

    @Mock
    private ValoracionRepository valoracionRepository;

    @InjectMocks
    private EntrenamientoBaseService entrenamientoBaseService;

    @InjectMocks
    private EntrenamientoComunidadService entrenamientoComunidadService;

    @InjectMocks
    private EntrenamientoUsuarioService entrenamientoUsuarioService;

    @InjectMocks
    private HistorialEntrenamientosService historialEntrenamientosService;

    @InjectMocks
    private CentroPrivadoBaseService centroPrivadoBaseService;

    @InjectMocks
    private CentroPrivadoUsuarioService centroPrivadoUsuarioService;

    @InjectMocks
    private LugarPublicoBaseService lugarPublicoBaseService;

    @InjectMocks
    private LugarPublicoUsuarioService lugarPublicoUsuarioService;

    @InjectMocks
    private ValoracionService valoracionService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUsername("usuario1");
    }

    @Test
    @DisplayName("EntrenamientoBaseService.listarOFiltrarPaginado retorna PaginaResponse")
    void testEntrenamientoBasePaginado() {
        EntrenamientoBase entity = new EntrenamientoBase();
        entity.setId(10L);
        entity.setNombre("Fuerza");
        Page<EntrenamientoBase> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(entrenamientoBaseRepository.findAll(any(Pageable.class))).thenReturn(page);
        PaginaResponse<EntrenamientoBaseDTO> resTodos = entrenamientoBaseService.listarOFiltrarPaginado(
                null, null, null, null, PageRequest.of(0, 20));
        assertNotNull(resTodos);
        assertEquals(1, resTodos.totalElements());

        when(entrenamientoBaseRepository.findByCategoria(eq(CategoriaEntrenamientoComunidad.FUERZA_TOTAL), any(Pageable.class))).thenReturn(page);
        PaginaResponse<EntrenamientoBaseDTO> resCat = entrenamientoBaseService.listarOFiltrarPaginado(
                CategoriaEntrenamientoComunidad.FUERZA_TOTAL, null, null, null, PageRequest.of(0, 20));
        assertEquals(10L, resCat.content().getFirst().getId());
    }

    @Test
    @DisplayName("EntrenamientoComunidadService.listarOFiltrarPaginado retorna PaginaResponse")
    void testEntrenamientoComunidadPaginado() {
        EntrenamientoComunidad entity = new EntrenamientoComunidad();
        entity.setId(20L);
        entity.setNombre("Comunidad WOD");
        entity.setUsuario(usuario);
        Page<EntrenamientoComunidad> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(entrenamientoComunidadRepository.findAllConUsuario(any(Pageable.class))).thenReturn(page);
        PaginaResponse<EntrenamientoComunidadDTO> resTodos = entrenamientoComunidadService.listarOFiltrarPaginado(
                null, null, null, null, PageRequest.of(0, 20));
        assertNotNull(resTodos);
        assertEquals(1, resTodos.totalElements());

        when(entrenamientoComunidadRepository.findByNivel(eq(NivelEntrenamiento.INTERMEDIO), any(Pageable.class))).thenReturn(page);
        PaginaResponse<EntrenamientoComunidadDTO> resNivel = entrenamientoComunidadService.listarOFiltrarPaginado(
                null, NivelEntrenamiento.INTERMEDIO, null, null, PageRequest.of(0, 20));
        assertEquals(20L, resNivel.content().getFirst().getId());
    }

    @Test
    @DisplayName("EntrenamientoUsuarioService.listarOFiltrarPaginado retorna PaginaResponse y valida usuario")
    void testEntrenamientoUsuarioPaginado() {
        when(usuarioRepository.findByUsername("usuario1")).thenReturn(Optional.of(usuario));

        EntrenamientoUsuario entity = new EntrenamientoUsuario();
        entity.setId(30L);
        entity.setNombre("Mi Rutina");
        entity.setUsuario(usuario);
        Page<EntrenamientoUsuario> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(entrenamientoUsuarioRepository.findVisiblesByUsuario(eq(usuario), any(Pageable.class))).thenReturn(page);
        PaginaResponse<EntrenamientoUsuarioDTO> res = entrenamientoUsuarioService.listarOFiltrarPaginado(
                "usuario1", null, null, null, null, PageRequest.of(0, 20));
        assertNotNull(res);
        assertEquals(1, res.totalElements());

        when(usuarioRepository.findByUsername("desconocido")).thenReturn(Optional.empty());
        Pageable p = PageRequest.of(0, 20);
        assertThrows(RecursoNoEncontradoException.class, () ->
                entrenamientoUsuarioService.listarOFiltrarPaginado("desconocido", null, null, null, null, p));
    }

    @Test
    @DisplayName("HistorialEntrenamientosService.listarOFiltrarHistorialPaginado retorna PaginaResponse")
    void testHistorialEntrenamientosPaginado() {
        when(usuarioRepository.findByUsername("usuario1")).thenReturn(Optional.of(usuario));

        HistorialEntrenamientos entity = new HistorialEntrenamientos();
        entity.setId(40L);
        entity.setUsuario(usuario);
        entity.setFechaHora(LocalDateTime.now());
        Page<HistorialEntrenamientos> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(historialEntrenamientosRepository.findByUsuario(eq(usuario), any(Pageable.class))).thenReturn(page);
        PaginaResponse<HistorialEntrenamientosDTO> res = historialEntrenamientosService.listarOFiltrarHistorialPaginado(
                "usuario1", null, null, PageRequest.of(0, 20));
        assertNotNull(res);
        assertEquals(1, res.totalElements());
    }

    @Test
    @DisplayName("CentroPrivadoBaseService.listarOFiltrarPaginado retorna PaginaResponse")
    void testCentroPrivadoBasePaginado() {
        CentroPrivadoBase entity = new CentroPrivadoBase();
        entity.setId(50L);
        entity.setNombre("Gimnasio Base");
        Page<CentroPrivadoBase> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(centroPrivadoBaseRepository.findAll(any(Pageable.class))).thenReturn(page);
        PaginaResponse<CentroPrivadoBaseDTO> res = centroPrivadoBaseService.listarOFiltrarPaginado(
                null, null, null, PageRequest.of(0, 20));
        assertNotNull(res);
        assertEquals(1, res.totalElements());
    }

    @Test
    @DisplayName("CentroPrivadoUsuarioService.listarOFiltrarPaginado retorna PaginaResponse")
    void testCentroPrivadoUsuarioPaginado() {
        when(usuarioRepository.findByUsername("usuario1")).thenReturn(Optional.of(usuario));

        CentroPrivadoUsuario entity = new CentroPrivadoUsuario();
        entity.setId(60L);
        entity.setNombre("Mi Gimnasio");
        entity.setUsuario(usuario);
        Page<CentroPrivadoUsuario> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(centroPrivadoUsuarioRepository.findVisiblesByUsuario(eq(usuario), any(Pageable.class))).thenReturn(page);
        PaginaResponse<CentroPrivadoUsuarioDTO> res = centroPrivadoUsuarioService.listarOFiltrarPaginado(
                "usuario1", null, null, null, PageRequest.of(0, 20));
        assertNotNull(res);
        assertEquals(1, res.totalElements());
    }

    @Test
    @DisplayName("LugarPublicoBaseService.listarOFiltrarPaginado retorna PaginaResponse")
    void testLugarPublicoBasePaginado() {
        LugarPublicoBase entity = new LugarPublicoBase();
        entity.setId(70L);
        entity.setNombre("Parque Base");
        Page<LugarPublicoBase> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(lugarPublicoBaseRepository.findAll(any(Pageable.class))).thenReturn(page);
        PaginaResponse<LugarPublicoBaseDTO> res = lugarPublicoBaseService.listarOFiltrarPaginado(
                null, null, null, PageRequest.of(0, 20));
        assertNotNull(res);
        assertEquals(1, res.totalElements());
    }

    @Test
    @DisplayName("LugarPublicoUsuarioService.listarOFiltrarPaginado retorna PaginaResponse")
    void testLugarPublicoUsuarioPaginado() {
        when(usuarioRepository.findByUsername("usuario1")).thenReturn(Optional.of(usuario));

        LugarPublicoUsuario entity = new LugarPublicoUsuario();
        entity.setId(80L);
        entity.setNombre("Mi Parque");
        entity.setUsuario(usuario);
        Page<LugarPublicoUsuario> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(lugarPublicoUsuarioRepository.findVisiblesByUsuario(eq(usuario), any(Pageable.class))).thenReturn(page);
        PaginaResponse<LugarPublicoUsuarioDTO> res = lugarPublicoUsuarioService.listarOFiltrarPaginado(
                "usuario1", null, null, null, PageRequest.of(0, 20));
        assertNotNull(res);
        assertEquals(1, res.totalElements());
    }

    @Test
    @DisplayName("ValoracionService métodos paginados retornan PaginaResponse")
    void testValoracionServicePaginado() {
        Valoracion entity = new Valoracion();
        entity.setId(90L);
        entity.setPuntuacion(5);
        entity.setTipoDeValoracion(TipoDeValoracion.ENTRENAMIENTO_BASE);
        entity.setIdRelacionado(1L);
        entity.setUsuario(usuario);
        entity.setFecha(LocalDateTime.now());

        Page<Valoracion> page = new PageImpl<>(List.of(entity), PageRequest.of(0, 20), 1);

        when(entrenamientoBaseRepository.findById(1L)).thenReturn(Optional.of(new EntrenamientoBase()));
        when(valoracionRepository.findByTipoDeValoracionAndIdRelacionado(eq(TipoDeValoracion.ENTRENAMIENTO_BASE), eq(1L), any(Pageable.class)))
                .thenReturn(page);

        PaginaResponse<ValoracionDTO> resContenido = valoracionService.listarPorContenidoPaginado(
                TipoDeValoracion.ENTRENAMIENTO_BASE, 1L, PageRequest.of(0, 20));
        assertNotNull(resContenido);
        assertEquals(1, resContenido.totalElements());

        when(valoracionRepository.findByTipoDeValoracionIn(any(), any(Pageable.class))).thenReturn(page);
        PaginaResponse<ValoracionDTO> resPublicas = valoracionService.listarValoracionesPublicasPaginado("TODOS", PageRequest.of(0, 20));
        assertNotNull(resPublicas);
        assertEquals(1, resPublicas.totalElements());

        when(usuarioRepository.findByUsername("usuario1")).thenReturn(Optional.of(usuario));
        when(valoracionRepository.findByUsuario(eq(usuario), any(Pageable.class))).thenReturn(page);
        PaginaResponse<ValoracionDTO> resMis = valoracionService.listarMisValoracionesPaginado("usuario1", PageRequest.of(0, 20));
        assertNotNull(resMis);
        assertEquals(1, resMis.totalElements());
    }
}
