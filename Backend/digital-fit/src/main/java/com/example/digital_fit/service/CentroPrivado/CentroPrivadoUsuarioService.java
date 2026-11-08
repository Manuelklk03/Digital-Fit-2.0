package com.example.digital_fit.service.CentroPrivado;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.digital_fit.dto.CentroPrivado.CentroPrivadoUsuarioDTO;
import com.example.digital_fit.dto.CentroPrivado.CrearCentroPrivadoDTO;
import com.example.digital_fit.dto.Comun.PaginaResponse;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoUsuario;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoBaseRepository;
import com.example.digital_fit.repository.CentroPrivado.CentroPrivadoUsuarioRepository;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class CentroPrivadoUsuarioService {

    @Autowired
    private CentroPrivadoUsuarioRepository centroPrivadoUsuarioRepository;

    @Autowired
    private CentroPrivadoBaseRepository centroPrivadoBaseRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final Logger log = LoggerFactory.getLogger(CentroPrivadoUsuarioService.class);

    public PaginaResponse<CentroPrivadoUsuarioDTO> listarOFiltrarPaginado(
            String username,
            String nombre,
            String direccion,
            Double precioMensual,
            Pageable pageable) {

        log.debug("Listando centros privados al usuario {} con paginación", username);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Pageable paginacion = PaginacionUtil.normalizar(pageable);
        Page<CentroPrivadoUsuario> pagina;

        if (nombre != null) {
            pagina = centroPrivadoUsuarioRepository.findVisiblesByUsuarioAndNombreContainingIgnoreCase(usuario, nombre, paginacion);
        } else if (direccion != null) {
            pagina = centroPrivadoUsuarioRepository
                    .findVisiblesByUsuarioAndDireccionContainingIgnoreCase(usuario, direccion, paginacion);
        } else if (precioMensual != null) {
            pagina = centroPrivadoUsuarioRepository
                    .findVisiblesByUsuarioAndPrecioMensualLessThanEqual(usuario, precioMensual, paginacion);
        } else {
            pagina = centroPrivadoUsuarioRepository.findVisiblesByUsuario(usuario, paginacion);
        }

        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public List<CentroPrivadoUsuarioDTO> listarOFiltrar(String username, String nombre, String direccion,
            Double precioMensual) {

        log.debug("Listando centros privados al usuario {}", username);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        List<CentroPrivadoUsuario> centros = new ArrayList<>();

        if (nombre != null) {
            centros = centroPrivadoUsuarioRepository.findVisiblesByUsuarioAndNombreContainingIgnoreCase(usuario, nombre);

        } else if (direccion != null) {
            centros = centroPrivadoUsuarioRepository
                    .findVisiblesByUsuarioAndDireccionContainingIgnoreCase(usuario, direccion);

        } else if (precioMensual != null) {
            centros = centroPrivadoUsuarioRepository
                    .findVisiblesByUsuarioAndPrecioMensualLessThanEqual(usuario, precioMensual);
        } else {
            centros = centroPrivadoUsuarioRepository.findVisiblesByUsuario(usuario);
        }

        List<CentroPrivadoUsuarioDTO> centrosDTO = new ArrayList<>();

        for (CentroPrivadoUsuario centro : centros) {
            centrosDTO.add(entityToDto(centro));
        }

        return centrosDTO;
    }

    @Transactional
    public CentroPrivadoUsuarioDTO AñdirCentroPrivadoMaps(CrearCentroPrivadoDTO dto, String username) {

        log.info("Usuario {} añade centro privado desde maps {}", username, dto.getNombre());

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        if (centroPrivadoUsuarioRepository.findVisibleByUsuarioAndNombreIgnoreCase(usuario, dto.getNombre()).isPresent()) {
            throw new OperacionNoPermitida("Ya tienes un centro privado con ese nombre en mis centros.");
        }

        CentroPrivadoUsuario centro = new CentroPrivadoUsuario();
        centro.setNombre(dto.getNombre());
        centro.setDireccion(dto.getDireccion());
        centro.setTelefono(dto.getTelefono());
        centro.setHorario(dto.getHorario());
        centro.setPrecioMensual(dto.getPrecioMensual());
        centro.setDescripcion(dto.getDescripcion());
        centro.setLatitud(dto.getLatitud());
        centro.setLongitud(dto.getLongitud());
        centro.setActivo(true);
        centro.setUsuario(usuario);

        CentroPrivadoUsuario centroGuardado = centroPrivadoUsuarioRepository.save(centro);

        log.info("Centro privado {} guardado para usuario {}", dto.getNombre(), username);

        return entityToDto(centroGuardado);
    }

    @Transactional
    public CentroPrivadoUsuarioDTO AñadirPrivadoAMisCentros(Long idBase, String username) {

        log.info("Usuario {}añade centro privado de la base {}", username, idBase);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        CentroPrivadoBase centroBase = centroPrivadoBaseRepository.findById(idBase)
                .orElseThrow(() -> new RecursoNoEncontradoException("Centro base no encontrado en la lista."));

        if (centroPrivadoUsuarioRepository.findVisibleByUsuarioAndNombreIgnoreCase(usuario, centroBase.getNombre()).isPresent()) {
            throw new OperacionNoPermitida("Ya tienes añadido ese centro en mis centros.");
        }

        CentroPrivadoUsuario centro = new CentroPrivadoUsuario();
        centro.setNombre(centroBase.getNombre());
        centro.setDireccion(centroBase.getDireccion());
        centro.setTelefono(centroBase.getTelefono());
        centro.setHorario(centroBase.getHorario());
        centro.setPrecioMensual(centroBase.getPrecioMensual());
        centro.setDescripcion(centroBase.getDescripcion());
        centro.setLatitud(centroBase.getLatitud());
        centro.setLongitud(centroBase.getLongitud());
        centro.setActivo(true);
        centro.setUsuario(usuario);

        CentroPrivadoUsuario centroGuardado = centroPrivadoUsuarioRepository.save(centro);

        log.info("Centro privado {} guardado para usuario {}", centroBase.getNombre(), username);

        return entityToDto(centroGuardado);
    }

    public CentroPrivadoUsuarioDTO verDetalle(Long id, String username) {

        log.debug("Usuario {} consulta centro privado {}", username, id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        CentroPrivadoUsuario centro = centroPrivadoUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Centro con id: " + id + " No encontrado."));

        if (!centro.getUsuario().getId().equals(usuario.getId())) {
            log.warn("Usuario {} intentó acceder sin permiso al centro {}", username, id);
            throw new OperacionNoPermitida("No tienes permiso para ver este centro.");
        }

        return entityToDto(centro);
    }

    @Transactional
    public void borrarDeMisCentrosGuardados(Long id, String username) {

        log.info("Usuario {} borra centro privado {}", username, id);

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        CentroPrivadoUsuario centro = centroPrivadoUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Centro con id: " + id + " No encontrado."));

        if (!centro.getUsuario().getId().equals(usuario.getId())) {
            log.warn("Usuario {} intentó acceder sin permiso al centro {}", username, id);
            throw new OperacionNoPermitida("No tienes permiso para borrar este centro.");
        }

        centro.setActivo(false);
        centroPrivadoUsuarioRepository.save(centro);

        log.info("Centro privado {} ocultado para usuario {}", id, username);
    }

    public CentroPrivadoUsuario dtoToEntity(CentroPrivadoUsuarioDTO dto) {
        CentroPrivadoUsuario centro = new CentroPrivadoUsuario();
        centro.setId(dto.getId());
        centro.setNombre(dto.getNombre());
        centro.setDireccion(dto.getDireccion());
        centro.setTelefono(dto.getTelefono());
        centro.setHorario(dto.getHorario());
        centro.setPrecioMensual(dto.getPrecioMensual());
        centro.setDescripcion(dto.getDescripcion());
        centro.setLatitud(dto.getLatitud());
        centro.setLongitud(dto.getLongitud());
        return centro;
    }

    public CentroPrivadoUsuarioDTO entityToDto(CentroPrivadoUsuario centro) {
        CentroPrivadoUsuarioDTO dto = new CentroPrivadoUsuarioDTO();
        dto.setId(centro.getId());
        dto.setNombre(centro.getNombre());
        dto.setDireccion(centro.getDireccion());
        dto.setTelefono(centro.getTelefono());
        dto.setHorario(centro.getHorario());
        dto.setPrecioMensual(centro.getPrecioMensual());
        dto.setDescripcion(centro.getDescripcion());
        dto.setLatitud(centro.getLatitud());
        dto.setLongitud(centro.getLongitud());
        return dto;
    }
}