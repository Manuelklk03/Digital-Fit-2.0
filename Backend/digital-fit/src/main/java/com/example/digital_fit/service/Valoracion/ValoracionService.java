package com.example.digital_fit.service.Valoracion;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.digital_fit.dto.comun.PaginaResponse;
import com.example.digital_fit.dto.Valoracion.CrearValoracionDTO;
import com.example.digital_fit.dto.Valoracion.ValoracionDTO;
import com.example.digital_fit.exception.ErrorArgumentoException;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoUsuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoBase;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoComunidad;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoUsuario;
import com.example.digital_fit.model.Entrenamientos.HistorialEntrenamientos;
import com.example.digital_fit.model.Enums.TipoDeValoracion;
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
import com.example.digital_fit.util.LogSanitizer;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class ValoracionService {

    private static final String CAMPO_FECHA = "fecha";

    @Autowired
    private ValoracionRepository valoracionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EntrenamientoBaseRepository entrenamientoBaseRepository;

    @Autowired
    private EntrenamientoUsuarioRepository entrenamientoUsuarioRepository;

    @Autowired
    private HistorialEntrenamientosRepository historialEntrenamientosRepository;

    @Autowired
    private EntrenamientoComunidadRepository entrenamientoComunidadRepository;

    @Autowired
    private CentroPrivadoBaseRepository centroPrivadoBaseRepository;

    @Autowired
    private CentroPrivadoUsuarioRepository centroPrivadoUsuarioRepository;

    @Autowired
    private LugarPublicoBaseRepository lugarPublicoBaseRepository;

    @Autowired
    private LugarPublicoUsuarioRepository lugarPublicoUsuarioRepository;

    private static final Logger log = LoggerFactory.getLogger(ValoracionService.class);

    public PaginaResponse<ValoracionDTO> listarPorContenidoPaginado(TipoDeValoracion tipo, Long contenidoId, Pageable pageable) {
        log.info("Listando valoraciones de un contenido con paginación");
        Pageable paginacion = PaginacionUtil.normalizar(pageable, Sort.by(Sort.Direction.DESC, CAMPO_FECHA));
        Page<Valoracion> pagina = valoracionRepository.findByTipoDeValoracionAndIdRelacionado(tipo, contenidoId, paginacion);
        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public PaginaResponse<ValoracionDTO> listarValoracionesPublicasPaginado(String categoria, Pageable pageable) {
        log.info("Listando valoraciones públicas con paginación. Categoría: {}", LogSanitizer.sanitize(categoria));
        List<TipoDeValoracion> tiposPermitidos = obtenerTiposSegunCategoria(categoria);
        Pageable paginacion = PaginacionUtil.normalizar(pageable, Sort.by(Sort.Direction.DESC, CAMPO_FECHA));
        Page<Valoracion> pagina = valoracionRepository.findByTipoDeValoracionIn(tiposPermitidos, paginacion);
        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public PaginaResponse<ValoracionDTO> listarMisValoracionesPaginado(String username, String q, Pageable pageable) {
        log.info("Listando mis valoraciones con paginación");
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        Pageable paginacion = PaginacionUtil.normalizar(pageable, Sort.by(Sort.Direction.DESC, CAMPO_FECHA));
        Page<Valoracion> pagina;
        if (q != null && !q.trim().isEmpty()) {
            pagina = valoracionRepository.buscarPorTexto(usuario, q.trim(), paginacion);
        } else {
            pagina = valoracionRepository.findByUsuario(usuario, paginacion);
        }
        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public PaginaResponse<ValoracionDTO> listarMisValoracionesPaginado(String username, Pageable pageable) {
        return listarMisValoracionesPaginado(username, null, pageable);
    }

    // Listar valoraciones de un contenido
    public List<ValoracionDTO> listarPorContenido(TipoDeValoracion tipo, Long contenidoId) {

        log.info("Listando valoraciones de un contenido");

        List<Valoracion> valoraciones = valoracionRepository.findByTipoDeValoracionAndIdRelacionado(tipo, contenidoId);

        List<ValoracionDTO> dtos = new ArrayList<>();

        for (Valoracion v : valoraciones) {
            dtos.add(entityToDto(v));
        }

        return dtos;
    }

    // Listar valoraciones públicas por categoría general
    public List<ValoracionDTO> listarValoracionesPublicas(String categoria) {

        log.info("Listando valoraciones públicas. Categoría: {}", LogSanitizer.sanitize(categoria));

        List<TipoDeValoracion> tiposPermitidos = obtenerTiposSegunCategoria(categoria);

        List<Valoracion> valoraciones = valoracionRepository.findByTipoDeValoracionInOrderByFechaDesc(tiposPermitidos);

        List<ValoracionDTO> dtos = new ArrayList<>();

        for (Valoracion v : valoraciones) {
            dtos.add(entityToDto(v));
        }

        return dtos;
    }

    // Listar mis valoraciones
    public List<ValoracionDTO> listarMisValoraciones(String username) {

        log.info("Listando mis valoraciones");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        List<Valoracion> valoraciones = valoracionRepository.findByUsuario(usuario);

        List<ValoracionDTO> dtos = new ArrayList<>();

        for (Valoracion v : valoraciones) {
            dtos.add(entityToDto(v));
        }

        return dtos;
    }

    // Borrar mi valoracion
    @Transactional
    public void borrarMiValoracion(TipoDeValoracion tipo, Long contenidoId, String username) {

        log.info("Borrando mi valoracion");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Valoracion valoracion = valoracionRepository
                .findByUsuarioAndTipoDeValoracionAndIdRelacionado(usuario, tipo, contenidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Valoración no encontrada"));

        log.info("Valoracion con id {} borrada", valoracion.getId());

        valoracionRepository.delete(valoracion);
    }

    @Transactional
    public ValoracionDTO crearOActualizar(TipoDeValoracion tipo, Long contenidoId, CrearValoracionDTO dto,
            String username) {

        log.info("Creando o actualizando valoracion");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (dto.getPuntuacion() == null || dto.getPuntuacion() < 1 || dto.getPuntuacion() > 5) {
            throw new ErrorArgumentoException("La puntuación debe estar entre 1 y 5");
        }

        validarContenidoExisteYPermisos(tipo, contenidoId, usuario);

        Valoracion valoracion = valoracionRepository
                .findByUsuarioAndTipoDeValoracionAndIdRelacionado(usuario, tipo, contenidoId)
                .orElseGet(() -> Valoracion.builder()
                        .usuario(usuario)
                        .tipoDeValoracion(tipo)
                        .idRelacionado(contenidoId)
                        .build());

        valoracion.setPuntuacion(dto.getPuntuacion());
        valoracion.setComentario(dto.getComentario());
        valoracion.setFecha(LocalDateTime.now());

        Valoracion guardada = valoracionRepository.save(valoracion);

        log.info("Valoracion con id {} guardada/actualizada", guardada.getId());

        return entityToDto(guardada);
    }

    private void validarContenidoExisteYPermisos(TipoDeValoracion tipo, Long contenidoId, Usuario usuario) {

        switch (tipo) {
            case ENTRENAMIENTO_BASE -> entrenamientoBaseRepository.findById(contenidoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento base no encontrado"));

            case ENTRENAMIENTO_COMUNIDAD -> entrenamientoComunidadRepository.findById(contenidoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento comunidad no encontrado"));

            case ENTRENAMIENTO_USUARIO -> {
                EntrenamientoUsuario entrenamientoUsuario = entrenamientoUsuarioRepository.findById(contenidoId)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento usuario no encontrado"));

                if (!entrenamientoUsuario.getUsuario().getId().equals(usuario.getId())) {
                    throw new OperacionNoPermitida("No puedes valorar un entrenamiento de usuario que no es tuyo");
                }
            }

            case HISTORIAL_ENTRENAMIENTO -> {
                HistorialEntrenamientos historial = historialEntrenamientosRepository.findById(contenidoId)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Registro de historial no encontrado"));

                if (!historial.getUsuario().getId().equals(usuario.getId())) {
                    throw new OperacionNoPermitida("No puedes valorar un historial que no es tuyo");
                }
            }

            case CENTRO_PRIVADO_BASE -> centroPrivadoBaseRepository.findById(contenidoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Centro privado base no encontrado"));

            case CENTRO_PRIVADO_USUARIO -> {
                CentroPrivadoUsuario centro = centroPrivadoUsuarioRepository.findById(contenidoId)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Centro privado usuario no encontrado"));

                if (!centro.getUsuario().getId().equals(usuario.getId())) {
                    throw new OperacionNoPermitida("No puedes valorar un centro privado que no es tuyo");
                }
            }

            case LUGAR_PUBLICO_BASE -> lugarPublicoBaseRepository.findById(contenidoId)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Lugar público base no encontrado"));

            case LUGAR_PUBLICO_USUARIO -> {
                LugarPublicoUsuario lugar = lugarPublicoUsuarioRepository.findById(contenidoId)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Lugar público usuario no encontrado"));

                if (!lugar.getUsuario().getId().equals(usuario.getId())) {
                    throw new OperacionNoPermitida("No puedes valorar un lugar público que no es tuyo");
                }
            }

            default -> throw new ErrorArgumentoException("Tipo de valoración no válido");
        }
    }

    private List<TipoDeValoracion> obtenerTiposSegunCategoria(String categoria) {

        if (categoria == null || categoria.isBlank() || categoria.equalsIgnoreCase("TODOS")) {
            return List.of(
                    TipoDeValoracion.ENTRENAMIENTO_BASE,
                    TipoDeValoracion.ENTRENAMIENTO_USUARIO,
                    TipoDeValoracion.HISTORIAL_ENTRENAMIENTO,
                    TipoDeValoracion.ENTRENAMIENTO_COMUNIDAD,
                    TipoDeValoracion.CENTRO_PRIVADO_BASE,
                    TipoDeValoracion.CENTRO_PRIVADO_USUARIO,
                    TipoDeValoracion.LUGAR_PUBLICO_BASE,
                    TipoDeValoracion.LUGAR_PUBLICO_USUARIO);
        }

        return switch (categoria.toUpperCase()) {
            case "ENTRENAMIENTOS" -> List.of(
                    TipoDeValoracion.ENTRENAMIENTO_BASE,
                    TipoDeValoracion.ENTRENAMIENTO_USUARIO,
                    TipoDeValoracion.HISTORIAL_ENTRENAMIENTO,
                    TipoDeValoracion.ENTRENAMIENTO_COMUNIDAD);

            case "CENTROS_PRIVADOS" -> List.of(
                    TipoDeValoracion.CENTRO_PRIVADO_BASE,
                    TipoDeValoracion.CENTRO_PRIVADO_USUARIO);

            case "LUGARES_PUBLICOS" -> List.of(
                    TipoDeValoracion.LUGAR_PUBLICO_BASE,
                    TipoDeValoracion.LUGAR_PUBLICO_USUARIO);

            default -> throw new ErrorArgumentoException("Categoría de valoraciones no válida");
        };
    }

    private String obtenerNombreContenido(TipoDeValoracion tipo, Long contenidoId) {
        return switch (tipo) {
            case ENTRENAMIENTO_BASE -> entrenamientoBaseRepository.findById(contenidoId)
                    .map(EntrenamientoBase::getNombre)
                    .orElse("Contenido no encontrado");

            case ENTRENAMIENTO_USUARIO -> entrenamientoUsuarioRepository.findById(contenidoId)
                    .map(EntrenamientoUsuario::getNombre)
                    .orElse("Contenido no encontrado");

            case HISTORIAL_ENTRENAMIENTO -> historialEntrenamientosRepository.findById(contenidoId)
                    .map(h -> {
                        if (h.getEntrenamientoBase() != null) {
                            return h.getEntrenamientoBase().getNombre();
                        } else if (h.getEntrenamientoUsuario() != null) {
                            return h.getEntrenamientoUsuario().getNombre();
                        }
                        return "Historial sin entrenamiento";
                    })
                    .orElse("Contenido no encontrado");

            case ENTRENAMIENTO_COMUNIDAD -> entrenamientoComunidadRepository.findById(contenidoId)
                    .map(EntrenamientoComunidad::getNombre)
                    .orElse("Contenido no encontrado");

            case CENTRO_PRIVADO_BASE -> centroPrivadoBaseRepository.findById(contenidoId)
                    .map(CentroPrivadoBase::getNombre)
                    .orElse("Contenido no encontrado");

            case CENTRO_PRIVADO_USUARIO -> centroPrivadoUsuarioRepository.findById(contenidoId)
                    .map(CentroPrivadoUsuario::getNombre)
                    .orElse("Contenido no encontrado");

            case LUGAR_PUBLICO_BASE -> lugarPublicoBaseRepository.findById(contenidoId)
                    .map(LugarPublicoBase::getNombre)
                    .orElse("Contenido no encontrado");

            case LUGAR_PUBLICO_USUARIO -> lugarPublicoUsuarioRepository.findById(contenidoId)
                    .map(LugarPublicoUsuario::getNombre)
                    .orElse("Contenido no encontrado");
        };
    }

    // Mappers
    private ValoracionDTO entityToDto(Valoracion valoracion) {
        ValoracionDTO dto = new ValoracionDTO();

        dto.setId(valoracion.getId());
        dto.setPuntuacion(valoracion.getPuntuacion());
        dto.setComentario(valoracion.getComentario());
        dto.setTipoDeValoracion(valoracion.getTipoDeValoracion());
        dto.setContenidoId(valoracion.getIdRelacionado());
        dto.setContenidoNombre(obtenerNombreContenido(valoracion.getTipoDeValoracion(), valoracion.getIdRelacionado()));

        dto.setUsuarioId(valoracion.getUsuario().getId());
        dto.setUsername(valoracion.getUsuario().getUsername());

        dto.setFecha(valoracion.getFecha());
        return dto;
    }

    @SuppressWarnings("unused")
    private Valoracion dtoToEntity(ValoracionDTO dto) {
        Valoracion valoracion = new Valoracion();
        valoracion.setId(dto.getId());
        valoracion.setPuntuacion(dto.getPuntuacion());
        valoracion.setComentario(dto.getComentario());
        valoracion.setTipoDeValoracion(dto.getTipoDeValoracion());
        valoracion.setIdRelacionado(dto.getContenidoId());

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        valoracion.setUsuario(usuario);

        valoracion.setFecha(dto.getFecha());

        return valoracion;
    }
}