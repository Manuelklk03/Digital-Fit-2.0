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
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoComunidadDTO;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoComunidadDTO;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoComunidad;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoComunidadRepository;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class EntrenamientoComunidadService {

    @Autowired
    private EntrenamientoComunidadRepository entrenamientoComunidadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final Logger log = LoggerFactory.getLogger(EntrenamientoComunidadService.class);

    public PaginaResponse<EntrenamientoComunidadDTO> listarOFiltrarPaginado(
            CategoriaEntrenamientoComunidad categoria,
            NivelEntrenamiento nivel,
            Integer duracionEnMinutos,
            String nombre,
            Pageable pageable) {

        log.debug("Listando entrenamientos comunidad con paginación");

        Pageable paginacion = PaginacionUtil.normalizar(pageable, Sort.by(Sort.Direction.DESC, "fechaPublicacion"));
        Page<EntrenamientoComunidad> pagina;

        if (categoria != null) {
            pagina = entrenamientoComunidadRepository.findByCategoria(categoria, paginacion);
        } else if (nivel != null) {
            pagina = entrenamientoComunidadRepository.findByNivel(nivel, paginacion);
        } else if (duracionEnMinutos != null) {
            pagina = entrenamientoComunidadRepository.findByDuracionEnMinutosLessThanEqual(duracionEnMinutos, paginacion);
        } else if (nombre != null) {
            pagina = entrenamientoComunidadRepository.findByNombreContainingIgnoreCase(nombre, paginacion);
        } else {
            pagina = entrenamientoComunidadRepository.findAllConUsuario(paginacion);
        }

        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public List<EntrenamientoComunidadDTO> listarOFiltrar(CategoriaEntrenamientoComunidad categoria,
            NivelEntrenamiento nivel, Integer duracionEnMinutos, String nombre) {

        log.debug("Listando entrenamientos comunidad");

        List<EntrenamientoComunidad> entrenamientosComunidad = new ArrayList<>();

        if (categoria != null) {
            entrenamientosComunidad = entrenamientoComunidadRepository.findByCategoria(categoria);
        } else if (nivel != null) {
            entrenamientosComunidad = entrenamientoComunidadRepository.findByNivel(nivel);
        } else if (duracionEnMinutos != null) {
            entrenamientosComunidad = entrenamientoComunidadRepository
                    .findByDuracionEnMinutosLessThanEqual(duracionEnMinutos);
        } else if (nombre != null) {
            entrenamientosComunidad = entrenamientoComunidadRepository.findByNombreContainingIgnoreCase(nombre);
        } else {
            entrenamientosComunidad = entrenamientoComunidadRepository.findAllByOrderByFechaPublicacionDesc();
        }

        List<EntrenamientoComunidadDTO> entrenamientosComunidadDTO = new ArrayList<>();

        for (EntrenamientoComunidad entrenamientoComunidad : entrenamientosComunidad) {
            entrenamientosComunidadDTO.add(entityToDto(entrenamientoComunidad));
        }

        return entrenamientosComunidadDTO;
    }

    public EntrenamientoComunidadDTO verDetalles(Long id) {

        log.debug("Buscando entrenamiento con id: {}", id);

        EntrenamientoComunidad entrenamiento = entrenamientoComunidadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento no encontrado"));

        return entityToDto(entrenamiento);
    }

    @Transactional
    public EntrenamientoComunidadDTO crearEntrenamiento(CrearEntrenamientoComunidadDTO dto, String username) {

        log.info("Usuario {} crea entrenamiento de la comunidad", username);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (entrenamientoComunidadRepository.findByUsuarioAndNombreIgnoreCase(usuario, dto.getNombre()).isPresent()) {
            throw new OperacionNoPermitida("Ya has publicado un entrenamiento de comunidad con ese nombre.");
        }

        EntrenamientoComunidad entrenamiento = new EntrenamientoComunidad();
        entrenamiento.setNombre(dto.getNombre());
        entrenamiento.setDescripcion(dto.getDescripcion());
        entrenamiento.setCategoria(dto.getCategoria());
        entrenamiento.setNivel(dto.getNivel());
        entrenamiento.setDuracionEnMinutos(dto.getDuracionEnMinutos());
        entrenamiento.setUsuario(usuario);
        entrenamiento.setFechaPublicacion(LocalDateTime.now());

        EntrenamientoComunidad entrenamientoGuardado = entrenamientoComunidadRepository.save(entrenamiento);

        log.info("Entrenamiento {} creado para usuario {}", dto.getNombre(), username);

        return entityToDto(entrenamientoGuardado);
    }

    @Transactional
    public void borrarEntrenamiento(Long id, String username) {

        log.info("Usuario {} borra entrenamiento {}", username, id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        EntrenamientoComunidad entrenamiento = entrenamientoComunidadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento no encontrado"));

        if (!entrenamiento.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para borrar este entrenamiento");
        }

        entrenamientoComunidadRepository.delete(entrenamiento);

        log.info("Entrenamiento {} borrado para usuario {}", id, username);
    }

    @Transactional
    public EntrenamientoComunidadDTO actualizarEntrenamiento(Long id, CrearEntrenamientoComunidadDTO dto,
            String username) {

        log.info("Usuario {} actualiza entrenamiento {}", username, id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        EntrenamientoComunidad entrenamiento = entrenamientoComunidadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento no encontrado"));

        if (!entrenamiento.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para actualizar este entrenamiento");
        }

        entrenamientoComunidadRepository.findByUsuarioAndNombreIgnoreCase(usuario, dto.getNombre()).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new OperacionNoPermitida("Ya has publicado otro entrenamiento de comunidad con ese nombre.");
            }
        });

        entrenamiento.setNombre(dto.getNombre());
        entrenamiento.setDescripcion(dto.getDescripcion());
        entrenamiento.setCategoria(dto.getCategoria());
        entrenamiento.setNivel(dto.getNivel());
        entrenamiento.setDuracionEnMinutos(dto.getDuracionEnMinutos());

        EntrenamientoComunidad entrenamientoGuardado = entrenamientoComunidadRepository.save(entrenamiento);

        log.info("Entrenamiento {} actualizado para usuario {}", id, username);

        return entityToDto(entrenamientoGuardado);
    }

    private EntrenamientoComunidadDTO entityToDto(EntrenamientoComunidad entrenamiento) {
        EntrenamientoComunidadDTO dto = new EntrenamientoComunidadDTO();

        dto.setId(entrenamiento.getId());
        dto.setNombre(entrenamiento.getNombre());
        dto.setDescripcion(entrenamiento.getDescripcion());
        dto.setCategoria(entrenamiento.getCategoria());
        dto.setNivel(entrenamiento.getNivel());
        dto.setDuracionEnMinutos(entrenamiento.getDuracionEnMinutos());
        dto.setFechaPublicacion(entrenamiento.getFechaPublicacion());
        dto.setUsuario(entrenamiento.getUsuario().getUsername());

        return dto;
    }

    @SuppressWarnings("unused")
    private EntrenamientoComunidad dtoToEntity(EntrenamientoComunidadDTO dto) {
        EntrenamientoComunidad entrenamiento = new EntrenamientoComunidad();

        entrenamiento.setNombre(dto.getNombre());
        entrenamiento.setDescripcion(dto.getDescripcion());
        entrenamiento.setCategoria(dto.getCategoria());
        entrenamiento.setNivel(dto.getNivel());
        entrenamiento.setDuracionEnMinutos(dto.getDuracionEnMinutos());

        if (dto.getUsuario() != null) {
            entrenamiento.setUsuario(usuarioRepository.findByUsername(dto.getUsuario()).orElse(null));
        }

        return entrenamiento;
    }
}