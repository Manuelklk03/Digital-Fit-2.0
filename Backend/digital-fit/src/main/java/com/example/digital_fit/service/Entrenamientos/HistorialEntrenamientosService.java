package com.example.digital_fit.service.Entrenamientos;

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
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoHistorialDTO;
import com.example.digital_fit.dto.Entrenamientos.HistorialEntrenamientosDTO;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoUsuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoBase;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoUsuario;
import com.example.digital_fit.model.Entrenamientos.HistorialEntrenamientos;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;
import com.example.digital_fit.model.LugarPublico.LugarPublicoUsuario;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoBaseRepository;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoUsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoBaseRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoUsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.HistorialEntrenamientosRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoBaseRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoUsuarioRepository;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class HistorialEntrenamientosService {

    @Autowired
    private HistorialEntrenamientosRepository historialEntrenamientosRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EntrenamientoBaseRepository entrenamientoBaseRepository;

    @Autowired
    private EntrenamientoUsuarioRepository entrenamientoUsuarioRepository;

    @Autowired
    private LugarPublicoBaseRepository lugarPublicoBaseRepository;

    @Autowired
    private LugarPublicoUsuarioRepository lugarPublicoUsuarioRepository;

    @Autowired
    private CentroPrivadoBaseRepository centroPrivadoBaseRepository;

    @Autowired
    private CentroPrivadoUsuarioRepository centroPrivadoUsuarioRepository;

    private static final Logger log = LoggerFactory.getLogger(HistorialEntrenamientosService.class);

    public PaginaResponse<HistorialEntrenamientosDTO> listarOFiltrarHistorialPaginado(
            String username,
            Integer duracionEnMinutos,
            LocalDateTime fecha,
            Pageable pageable) {

        log.info("Listar historial de entrenamientos con paginación");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Pageable paginacion = PaginacionUtil.normalizar(pageable, Sort.by(Sort.Direction.DESC, "fechaHora"));
        Page<HistorialEntrenamientos> pagina;

        if (duracionEnMinutos != null) {
            pagina = historialEntrenamientosRepository
                    .findByUsuarioAndDuracionMinutosLessThanEqual(usuario, duracionEnMinutos, paginacion);
        } else if (fecha != null) {
            pagina = historialEntrenamientosRepository
                    .findByUsuarioAndFechaHoraAfter(usuario, fecha, paginacion);
        } else {
            pagina = historialEntrenamientosRepository.findByUsuario(usuario, paginacion);
        }

        return PaginaResponse.de(pagina, this::entityToDto);
    }

    // Listar filtrado
    public List<HistorialEntrenamientosDTO> listarOFiltrarHistorial(String username, Integer duracionEnMinutos,
            LocalDateTime fecha) {

        log.info("Listar historial de entrenamientos");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        List<HistorialEntrenamientos> registros = new ArrayList<>();

        if (duracionEnMinutos != null) {
            registros = historialEntrenamientosRepository
                    .findByUsuarioAndDuracionMinutosLessThanEqualOrderByFechaHoraDesc(usuario, duracionEnMinutos);
        } else if (fecha != null) {
            registros = historialEntrenamientosRepository
                    .findByUsuarioAndFechaHoraAfterOrderByFechaHoraDesc(usuario, fecha);
        } else {
            registros = historialEntrenamientosRepository.findByUsuarioOrderByFechaHoraDesc(usuario);
        }

        List<HistorialEntrenamientosDTO> registrosDTO = new ArrayList<>();

        for (HistorialEntrenamientos r : registros) {
            registrosDTO.add(entityToDto(r));
        }

        return registrosDTO;
    }

    // Ver detalles
    public HistorialEntrenamientosDTO verDetalles(Long id, String username) {

        log.debug("Buscando registro con id: {}", id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        HistorialEntrenamientos historial = historialEntrenamientosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Registro con id: " + id + " No encontrado."));

        if (!historial.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para ver este registro.");
        }

        return entityToDto(historial);
    }

    // Crear registro
    @Transactional
    public HistorialEntrenamientosDTO crearHistorialEntrenamiento(CrearEntrenamientoHistorialDTO dto, String username) {

        log.info("Usuario {} crea registro de entrenamiento realizado", username);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        boolean tieneEntrenamientoBase = dto.getEntrenamientoBaseId() != null;
        boolean tieneEntrenamientoUsuario = dto.getEntrenamientoUsuarioId() != null;

        if (tieneEntrenamientoBase == tieneEntrenamientoUsuario) {
            throw new OperacionNoPermitida("Debes seleccionar un único entrenamiento: base o de usuario.");
        }

        int ubicacionesSeleccionadas = 0;
        if (dto.getLugarPublicoBaseId() != null) ubicacionesSeleccionadas++;
        if (dto.getLugarPublicoUsuarioId() != null) ubicacionesSeleccionadas++;
        if (dto.getCentroPrivadoBaseId() != null) ubicacionesSeleccionadas++;
        if (dto.getCentroPrivadoUsuarioId() != null) ubicacionesSeleccionadas++;

        if (ubicacionesSeleccionadas > 1) {
            throw new OperacionNoPermitida("Solo puedes seleccionar una ubicación para el historial.");
        }

        HistorialEntrenamientos historial = new HistorialEntrenamientos();
        historial.setUsuario(usuario);
        historial.setFechaHora(dto.getFecha());
        historial.setDuracionMinutos(dto.getDuracionEnMinutos());
        historial.setNotas(dto.getNotas());

        // Entrenamiento base
        if (dto.getEntrenamientoBaseId() != null) {
            EntrenamientoBase entrenamientoBase = entrenamientoBaseRepository.findById(dto.getEntrenamientoBaseId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Entrenamiento base con id: " + dto.getEntrenamientoBaseId() + " No encontrado."));

            historial.setEntrenamientoBase(entrenamientoBase);
        }

        // Entrenamiento usuario
        if (dto.getEntrenamientoUsuarioId() != null) {
            EntrenamientoUsuario entrenamientoUsuario = entrenamientoUsuarioRepository
                    .findById(dto.getEntrenamientoUsuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Entrenamiento usuario con id: " + dto.getEntrenamientoUsuarioId() + " No encontrado."));

            if (!entrenamientoUsuario.getUsuario().getId().equals(usuario.getId())) {
                throw new OperacionNoPermitida("No puedes usar un entrenamiento que no es tuyo.");
            }

            historial.setEntrenamientoUsuario(entrenamientoUsuario);
        }

        // Lugar público base
        if (dto.getLugarPublicoBaseId() != null) {
            LugarPublicoBase lugarPublicoBase = lugarPublicoBaseRepository.findById(dto.getLugarPublicoBaseId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Lugar público base con id: " + dto.getLugarPublicoBaseId() + " No encontrado."));

            historial.setLugarPublicoBase(lugarPublicoBase);
        }

        // Lugar público usuario
        if (dto.getLugarPublicoUsuarioId() != null) {
            LugarPublicoUsuario lugarPublicoUsuario = lugarPublicoUsuarioRepository.findById(dto.getLugarPublicoUsuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Lugar público usuario con id: " + dto.getLugarPublicoUsuarioId() + " No encontrado."));

            if (!lugarPublicoUsuario.getUsuario().getId().equals(usuario.getId())) {
                throw new OperacionNoPermitida("No puedes usar un lugar público que no es tuyo.");
            }

            historial.setLugarPublicoUsuario(lugarPublicoUsuario);
        }

        // Centro privado base
        if (dto.getCentroPrivadoBaseId() != null) {
            CentroPrivadoBase centroPrivadoBase = centroPrivadoBaseRepository.findById(dto.getCentroPrivadoBaseId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Centro privado base con id: " + dto.getCentroPrivadoBaseId() + " No encontrado."));

            historial.setCentroPrivadoBase(centroPrivadoBase);
        }

        // Centro privado usuario
        if (dto.getCentroPrivadoUsuarioId() != null) {
            CentroPrivadoUsuario centroPrivadoUsuario = centroPrivadoUsuarioRepository.findById(dto.getCentroPrivadoUsuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Centro privado usuario con id: " + dto.getCentroPrivadoUsuarioId() + " No encontrado."));

            if (!centroPrivadoUsuario.getUsuario().getId().equals(usuario.getId())) {
                throw new OperacionNoPermitida("No puedes usar un centro privado que no es tuyo.");
            }

            historial.setCentroPrivadoUsuario(centroPrivadoUsuario);
        }

        HistorialEntrenamientos historialGuardado = historialEntrenamientosRepository.save(historial);

        log.info("Historial guardado con id: {}", historialGuardado.getId());

        return entityToDto(historialGuardado);
    }

    // Borrar registro
    @Transactional
    public void borrarHistorialEntrenamiento(Long id, String username) {

        log.info("Usuario {} borra registro con id: {}", username, id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        HistorialEntrenamientos historial = historialEntrenamientosRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Registro con id: " + id + " No encontrado."));

        if (!historial.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para borrar este registro.");
        }

        log.info("Borrando registro con id: {}", id);

        historialEntrenamientosRepository.delete(historial);
    }

    // Mapper
    public HistorialEntrenamientosDTO entityToDto(HistorialEntrenamientos historial) {
        HistorialEntrenamientosDTO dto = new HistorialEntrenamientosDTO();

        dto.setId(historial.getId());

        if (historial.getEntrenamientoBase() != null) {
            dto.setEntrenamiento(historial.getEntrenamientoBase().getNombre());
            dto.setTipoEntrenamiento("ENTRENAMIENTO_BASE");
        } else if (historial.getEntrenamientoUsuario() != null) {
            dto.setEntrenamiento(historial.getEntrenamientoUsuario().getNombre());
            dto.setTipoEntrenamiento("MI_ENTRENAMIENTO");
        }

        if (historial.getLugarPublicoBase() != null) {
            dto.setUbicacion(historial.getLugarPublicoBase().getNombre());
            dto.setTipoUbicacion("LUGAR_PUBLICO_BASE");
        } else if (historial.getLugarPublicoUsuario() != null) {
            dto.setUbicacion(historial.getLugarPublicoUsuario().getNombre());
            dto.setTipoUbicacion("MI_LUGAR_PUBLICO");
        } else if (historial.getCentroPrivadoBase() != null) {
            dto.setUbicacion(historial.getCentroPrivadoBase().getNombre());
            dto.setTipoUbicacion("CENTRO_PRIVADO_BASE");
        } else if (historial.getCentroPrivadoUsuario() != null) {
            dto.setUbicacion(historial.getCentroPrivadoUsuario().getNombre());
            dto.setTipoUbicacion("MI_CENTRO_PRIVADO");
        }

        dto.setFecha(historial.getFechaHora());
        dto.setDuracionEnMinutos(historial.getDuracionMinutos());
        dto.setNotas(historial.getNotas());

        return dto;
    }

    public HistorialEntrenamientos dtoToEntity(HistorialEntrenamientosDTO dto) {
        HistorialEntrenamientos historial = new HistorialEntrenamientos();

        historial.setId(dto.getId());
        historial.setFechaHora(dto.getFecha());
        historial.setDuracionMinutos(dto.getDuracionEnMinutos());
        historial.setNotas(dto.getNotas());

        return historial;
    }
}