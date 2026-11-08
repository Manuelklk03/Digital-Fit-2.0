package com.example.digital_fit.service.LugarPublico;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.digital_fit.dto.Comun.PaginaResponse;
import com.example.digital_fit.dto.LugarPublico.CrearLugarPublicoDTO;
import com.example.digital_fit.dto.LugarPublico.LugarPublicoUsuarioDTO;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;
import com.example.digital_fit.model.LugarPublico.LugarPublicoUsuario;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoBaseRepository;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoUsuarioRepository;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class LugarPublicoUsuarioService {

    @Autowired
    private LugarPublicoUsuarioRepository lugarPublicoUsuarioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LugarPublicoBaseRepository lugarPublicoBaseRepository;

    private static final Logger log = LoggerFactory.getLogger(LugarPublicoUsuarioService.class);

    public PaginaResponse<LugarPublicoUsuarioDTO> listarOFiltrarPaginado(
            String username,
            String nombre,
            String direccion,
            TipoLugarPublico tipo,
            Pageable pageable) {

        log.debug("Listando mis lugares publicos con paginación");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

        Pageable paginacion = PaginacionUtil.normalizar(pageable);
        Page<LugarPublicoUsuario> pagina;

        if (nombre != null) {
            pagina = lugarPublicoUsuarioRepository
                    .findVisiblesByUsuarioAndNombreContainingIgnoreCase(usuario, nombre, paginacion);
        } else if (direccion != null) {
            pagina = lugarPublicoUsuarioRepository
                    .findVisiblesByUsuarioAndDireccionContainingIgnoreCase(usuario, direccion, paginacion);
        } else if (tipo != null) {
            pagina = lugarPublicoUsuarioRepository
                    .findVisiblesByUsuarioAndTipo(usuario, tipo, paginacion);
        } else {
            pagina = lugarPublicoUsuarioRepository.findVisiblesByUsuario(usuario, paginacion);
        }

        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public List<LugarPublicoUsuarioDTO> listarOFiltrar(String username, String nombre, String direccion,
            TipoLugarPublico tipo) {

        log.debug("Listando mis lugares publicos");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado."));

        List<LugarPublicoUsuario> lugares = new ArrayList<>();

        if (nombre != null) {
            lugares = lugarPublicoUsuarioRepository
                    .findVisiblesByUsuarioAndNombreContainingIgnoreCase(usuario, nombre);

        } else if (direccion != null) {
            lugares = lugarPublicoUsuarioRepository
                    .findVisiblesByUsuarioAndDireccionContainingIgnoreCase(usuario, direccion);

        } else if (tipo != null) {
            lugares = lugarPublicoUsuarioRepository
                    .findVisiblesByUsuarioAndTipo(usuario, tipo);

        } else {
            lugares = lugarPublicoUsuarioRepository.findVisiblesByUsuario(usuario);
        }

        List<LugarPublicoUsuarioDTO> lugaresDTO = new ArrayList<>();

        for (LugarPublicoUsuario lugar : lugares) {
            lugaresDTO.add(entityToDto(lugar));
        }

        return lugaresDTO;
    }

    public LugarPublicoUsuarioDTO verDetalle(Long id, String username) {

        log.debug("Buscando lugar con id: {}", id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        LugarPublicoUsuario lugar = lugarPublicoUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lugar con id: " + id + " No encontrado."));

        if (!lugar.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para ver este lugar.");
        }

        return entityToDto(lugar);
    }

    public void borrarLugar(Long id, String username) {

        log.info("Borrando lugar con id: {}", id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        LugarPublicoUsuario lugar = lugarPublicoUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lugar con id: " + id + " No encontrado."));

        if (!lugar.getUsuario().getId().equals(usuario.getId())) {
            throw new OperacionNoPermitida("No tienes permiso para borrar este lugar.");
        }

        lugar.setActivo(false);
        lugarPublicoUsuarioRepository.save(lugar);

        log.info("Lugar {} ocultado para usuario {}", id, username);
    }

    @Transactional
    public LugarPublicoUsuarioDTO guardarDesdeBase(Long lugarId, String username) {

        log.debug("Guardando lugar desde base con id: {}", lugarId);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        LugarPublicoBase lugarBase = lugarPublicoBaseRepository.findById(lugarId)
                .orElseThrow(
                        () -> new RecursoNoEncontradoException("Lugar base con id: " + lugarId + " No encontrado."));

        if (lugarPublicoUsuarioRepository.findVisibleByUsuarioAndNombreIgnoreCase(usuario, lugarBase.getNombre())
                .isPresent()) {
            throw new OperacionNoPermitida("Ya tienes añadido ese lugar en mis lugares.");
        }

        LugarPublicoUsuario lugar = new LugarPublicoUsuario();

        lugar.setUsuario(usuario);
        lugar.setNombre(lugarBase.getNombre());
        lugar.setDireccion(lugarBase.getDireccion());
        lugar.setDescripcion(lugarBase.getDescripcion());
        lugar.setTelefono(lugarBase.getTelefono());
        lugar.setHorario(lugarBase.getHorario());
        lugar.setLatitud(lugarBase.getLatitud());
        lugar.setLongitud(lugarBase.getLongitud());
        lugar.setTipo(lugarBase.getTipo());
        lugar.setActivo(true);

        LugarPublicoUsuario lugarGuardado = lugarPublicoUsuarioRepository.save(lugar);

        log.debug("Lugar guardado con id: {}", lugarGuardado.getId());

        return entityToDto(lugarGuardado);
    }

    @Transactional
    public LugarPublicoUsuarioDTO guardarDesdeMaps(CrearLugarPublicoDTO dto, String username) {

        log.debug("Guardando lugar desde maps");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (lugarPublicoUsuarioRepository.findVisibleByUsuarioAndNombreIgnoreCase(usuario, dto.getNombre()).isPresent()) {
            throw new OperacionNoPermitida("Ya tienes un lugar con ese nombre en mis lugares.");
        }

        LugarPublicoUsuario lugar = new LugarPublicoUsuario();

        lugar.setUsuario(usuario);
        lugar.setNombre(dto.getNombre());
        lugar.setDireccion(dto.getDireccion());
        lugar.setDescripcion(dto.getDescripcion());
        lugar.setTelefono(dto.getTelefono());
        lugar.setHorario(dto.getHorario());
        lugar.setLatitud(dto.getLatitud());
        lugar.setLongitud(dto.getLongitud());
        lugar.setTipo(dto.getTipo());
        lugar.setActivo(true);

        LugarPublicoUsuario lugarGuardado = lugarPublicoUsuarioRepository.save(lugar);

        log.debug("Lugar guardado con id: {}", lugarGuardado.getId());

        return entityToDto(lugarGuardado);
    }

    public LugarPublicoUsuario dtoToEntity(LugarPublicoUsuarioDTO dto) {
        LugarPublicoUsuario lugar = new LugarPublicoUsuario();

        lugar.setId(dto.getId());
        lugar.setNombre(dto.getNombre());
        lugar.setDireccion(dto.getDireccion());
        lugar.setDescripcion(dto.getDescripcion());
        lugar.setTelefono(dto.getTelefono());
        lugar.setHorario(dto.getHorario());
        lugar.setLatitud(dto.getLatitud());
        lugar.setLongitud(dto.getLongitud());
        lugar.setTipo(dto.getTipo());

        return lugar;
    }

    public LugarPublicoUsuarioDTO entityToDto(LugarPublicoUsuario lugar) {
        LugarPublicoUsuarioDTO dto = new LugarPublicoUsuarioDTO();

        dto.setId(lugar.getId());
        dto.setNombre(lugar.getNombre());
        dto.setDireccion(lugar.getDireccion());
        dto.setDescripcion(lugar.getDescripcion());
        dto.setTelefono(lugar.getTelefono());
        dto.setHorario(lugar.getHorario());
        dto.setLatitud(lugar.getLatitud());
        dto.setLongitud(lugar.getLongitud());
        dto.setTipo(lugar.getTipo());

        return dto;
    }
}