package com.example.digital_fit.service.Entrenamientos;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.digital_fit.dto.comun.PaginaResponse;
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoUsuario;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoUsuarioDTO;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoBase;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoComunidad;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoUsuario;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoBaseRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoComunidadRepository;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoUsuarioRepository;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class EntrenamientoUsuarioService {

    @Autowired
    private EntrenamientoUsuarioRepository entrenamientoUsuarioRepository;

    @Autowired
    private EntrenamientoBaseRepository entrenamientoBaseRepository;

    @Autowired
    private EntrenamientoComunidadRepository entrenamientoComunidadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final Logger log = LoggerFactory.getLogger(EntrenamientoUsuarioService.class);

    public PaginaResponse<EntrenamientoUsuarioDTO> listarOFiltrarPaginado(
            String username,
            CategoriaEntrenamientoComunidad categoria,
            NivelEntrenamiento nivel,
            Integer duracionEnMinutos,
            String nombre,
            Pageable pageable) {

        log.debug("Listando entrenamientos de usuario {} con paginación", username);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Pageable paginacion = PaginacionUtil.normalizar(pageable);
        Page<EntrenamientoUsuario> pagina;

        if (categoria != null) {
            pagina = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndCategoria(usuario, categoria, paginacion);
        } else if (nivel != null) {
            pagina = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndNivel(usuario, nivel, paginacion);
        } else if (duracionEnMinutos != null) {
            pagina = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndDuracionEnMinutosLessThanEqual(
                    usuario,
                    duracionEnMinutos,
                    paginacion);
        } else if (nombre != null) {
            pagina = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndNombreContainingIgnoreCase(usuario, nombre, paginacion);
        } else {
            pagina = entrenamientoUsuarioRepository.findVisiblesByUsuario(usuario, paginacion);
        }

        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public List<EntrenamientoUsuarioDTO> listarOFiltrar(String username,
            CategoriaEntrenamientoComunidad categoria,
            NivelEntrenamiento nivel,
            Integer duracionEnMinutos,
            String nombre) {

        log.debug("Listando entrenamientos de usuario {}", username);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        List<EntrenamientoUsuario> entrenamientos = new ArrayList<>();

        if (categoria != null) {
            entrenamientos = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndCategoria(usuario, categoria);
        } else if (nivel != null) {
            entrenamientos = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndNivel(usuario, nivel);
        } else if (duracionEnMinutos != null) {
            entrenamientos = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndDuracionEnMinutosLessThanEqual(
                    usuario,
                    duracionEnMinutos);
        } else if (nombre != null) {
            entrenamientos = entrenamientoUsuarioRepository.findVisiblesByUsuarioAndNombreContainingIgnoreCase(usuario, nombre);
        } else {
            entrenamientos = entrenamientoUsuarioRepository.findVisiblesByUsuario(usuario);
        }

        List<EntrenamientoUsuarioDTO> entrenamientoDTOs = new ArrayList<>();

        for (EntrenamientoUsuario entrenamiento : entrenamientos) {
            entrenamientoDTOs.add(entityToDto(entrenamiento));
        }

        return entrenamientoDTOs;
    }

    @Transactional
    public EntrenamientoUsuarioDTO crearEntrenamientoPersonalizado(CrearEntrenamientoUsuario dto, String username) {

        log.info("Usuario {} crea entrenamiento {}", username, dto.getNombre());

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (entrenamientoUsuarioRepository.findVisibleByUsuarioAndNombreIgnoreCase(usuario, dto.getNombre()).isPresent()) {
            throw new OperacionNoPermitida("Ya tienes un entrenamiento con ese nombre.");
        }

        EntrenamientoUsuario entrenamientoUsuario = new EntrenamientoUsuario();
        entrenamientoUsuario.setNombre(dto.getNombre());
        entrenamientoUsuario.setDescripcion(dto.getDescripcion());
        entrenamientoUsuario.setCategoria(dto.getCategoria());
        entrenamientoUsuario.setNivel(dto.getNivel());
        entrenamientoUsuario.setDuracionEnMinutos(dto.getDuracionEnMinutos());
        entrenamientoUsuario.setActivo(true);
        entrenamientoUsuario.setUsuario(usuario);

        EntrenamientoUsuario entrenamientoUsuarioGuardado = entrenamientoUsuarioRepository.save(entrenamientoUsuario);

        log.info("Entrenamiento {} creado para usuario {}", dto.getNombre(), username);

        return entityToDto(entrenamientoUsuarioGuardado);
    }

    @Transactional
    public EntrenamientoUsuarioDTO anadirDesdeBase(Long idBase, String username) {

        log.info("Usuario {} añade entrenamiento de la base {}", username, idBase);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        EntrenamientoBase entrenamientoBase = entrenamientoBaseRepository.findById(idBase)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento base no encontrado"));

        boolean yaAnadidoPorOrigen = entrenamientoUsuarioRepository
                .findVisibleByUsuarioAndEntrenamientoBaseOrigen(usuario, entrenamientoBase)
                .isPresent();
        boolean yaAnadidoPorNombre = entrenamientoUsuarioRepository
                .findVisibleByUsuarioAndNombreIgnoreCase(usuario, entrenamientoBase.getNombre())
                .isPresent();

        if (yaAnadidoPorOrigen || yaAnadidoPorNombre) {
            throw new OperacionNoPermitida("Entrenamiento ya añadido");
        }

        EntrenamientoUsuario entrenamientoUsuario = new EntrenamientoUsuario();
        entrenamientoUsuario.setNombre(entrenamientoBase.getNombre());
        entrenamientoUsuario.setDescripcion(entrenamientoBase.getDescripcion());
        entrenamientoUsuario.setCategoria(entrenamientoBase.getCategoria());
        entrenamientoUsuario.setNivel(entrenamientoBase.getNivel());
        entrenamientoUsuario.setDuracionEnMinutos(entrenamientoBase.getDuracionEnMinutos());
        entrenamientoUsuario.setActivo(true);
        entrenamientoUsuario.setEntrenamientoBaseOrigen(entrenamientoBase);
        entrenamientoUsuario.setUsuario(usuario);

        EntrenamientoUsuario entrenamientoUsuarioGuardado = entrenamientoUsuarioRepository.save(entrenamientoUsuario);

        log.info("Entrenamiento {} creado para usuario {}", entrenamientoBase.getNombre(), username);

        return entityToDto(entrenamientoUsuarioGuardado);
    }

    @Transactional
    public EntrenamientoUsuarioDTO anadirDesdeComunidad(Long idComunidad, String username) {

        log.info("Usuario {} añade entrenamiento de la comunidad {}", username, idComunidad);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        EntrenamientoComunidad entrenamientoComunidad = entrenamientoComunidadRepository.findById(idComunidad)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento comunidad no encontrado"));

        boolean yaAnadidoPorOrigen = entrenamientoUsuarioRepository
                .findVisibleByUsuarioAndEntrenamientoComunidadOrigen(usuario, entrenamientoComunidad)
                .isPresent();
        boolean yaAnadidoPorNombre = entrenamientoUsuarioRepository
                .findVisibleByUsuarioAndNombreIgnoreCase(usuario, entrenamientoComunidad.getNombre())
                .isPresent();

        if (yaAnadidoPorOrigen || yaAnadidoPorNombre) {
            throw new OperacionNoPermitida("Entrenamiento ya añadido");
        }

        EntrenamientoUsuario entrenamientoUsuario = new EntrenamientoUsuario();
        entrenamientoUsuario.setNombre(entrenamientoComunidad.getNombre());
        entrenamientoUsuario.setDescripcion(entrenamientoComunidad.getDescripcion());
        entrenamientoUsuario.setCategoria(entrenamientoComunidad.getCategoria());
        entrenamientoUsuario.setNivel(entrenamientoComunidad.getNivel());
        entrenamientoUsuario.setDuracionEnMinutos(entrenamientoComunidad.getDuracionEnMinutos());
        entrenamientoUsuario.setActivo(true);
        entrenamientoUsuario.setEntrenamientoComunidadOrigen(entrenamientoComunidad);
        entrenamientoUsuario.setUsuario(usuario);

        EntrenamientoUsuario entrenamientoUsuarioGuardado = entrenamientoUsuarioRepository.save(entrenamientoUsuario);

        log.info("Entrenamiento {} creado para usuario {}", entrenamientoComunidad.getNombre(), username);

        return entityToDto(entrenamientoUsuarioGuardado);
    }

    @Transactional
    public void borrarDeMisEntrenamientos(Long id, String username) {

        log.info("Usuario {} borra entrenamiento {}", username, id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        EntrenamientoUsuario entrenamientoUsuario = entrenamientoUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento usuario no encontrado"));

        if (!entrenamientoUsuario.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para borrar este entrenamiento");
        }

        entrenamientoUsuario.setActivo(false);
        entrenamientoUsuarioRepository.save(entrenamientoUsuario);

        log.info("Entrenamiento {} ocultado para usuario {}", id, username);
    }

    public EntrenamientoUsuarioDTO detalle(Long id, String username) {

        log.debug("Usuario {} consulta entrenamiento {}", username, id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        EntrenamientoUsuario entrenamientoUsuario = entrenamientoUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento usuario no encontrado"));

        if (!entrenamientoUsuario.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para ver este entrenamiento");
        }

        return entityToDto(entrenamientoUsuario);
    }

    public EntrenamientoUsuarioDTO entityToDto(EntrenamientoUsuario entrenamientoUsuario) {
        EntrenamientoUsuarioDTO entrenamientoUsuarioDTO = new EntrenamientoUsuarioDTO();
        entrenamientoUsuarioDTO.setId(entrenamientoUsuario.getId());
        entrenamientoUsuarioDTO.setNombre(entrenamientoUsuario.getNombre());
        entrenamientoUsuarioDTO.setDescripcion(entrenamientoUsuario.getDescripcion());
        entrenamientoUsuarioDTO.setCategoria(entrenamientoUsuario.getCategoria());
        entrenamientoUsuarioDTO.setNivel(entrenamientoUsuario.getNivel());
        entrenamientoUsuarioDTO.setDuracionEnMinutos(entrenamientoUsuario.getDuracionEnMinutos());

        return entrenamientoUsuarioDTO;
    }

    public EntrenamientoUsuario dtoToEntity(EntrenamientoUsuarioDTO dto) {
        EntrenamientoUsuario entrenamientoUsuario = new EntrenamientoUsuario();
        entrenamientoUsuario.setId(dto.getId());
        entrenamientoUsuario.setNombre(dto.getNombre());
        entrenamientoUsuario.setDescripcion(dto.getDescripcion());
        entrenamientoUsuario.setCategoria(dto.getCategoria());
        entrenamientoUsuario.setNivel(dto.getNivel());
        entrenamientoUsuario.setDuracionEnMinutos(dto.getDuracionEnMinutos());

        return entrenamientoUsuario;
    }
}
