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
import com.example.digital_fit.dto.LugarPublico.LugarPublicoBaseDTO;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;
import com.example.digital_fit.repository.LugarPublico.LugarPublicoBaseRepository;
import com.example.digital_fit.util.LogSanitizer;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class LugarPublicoBaseService {

    @Autowired
    private LugarPublicoBaseRepository lugarPublicoBaseRepository;

    private static final Logger log = LoggerFactory.getLogger(LugarPublicoBaseService.class);

    public PaginaResponse<LugarPublicoBaseDTO> listarOFiltrarPaginado(
            String nombre,
            String direccion,
            TipoLugarPublico tipo,
            Pageable pageable) {

        log.debug("Listando lugares publicos de la app con paginación");

        Pageable paginacion = PaginacionUtil.normalizar(pageable);
        Page<LugarPublicoBase> pagina;

        if (nombre != null) {
            pagina = lugarPublicoBaseRepository.findByNombreContainingIgnoreCase(nombre, paginacion);
        } else if (direccion != null) {
            pagina = lugarPublicoBaseRepository.findByDireccionContainingIgnoreCase(direccion, paginacion);
        } else if (tipo != null) {
            pagina = lugarPublicoBaseRepository.findByTipo(tipo, paginacion);
        } else {
            pagina = lugarPublicoBaseRepository.findAll(paginacion);
        }

        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public List<LugarPublicoBaseDTO> listarOFiltrar(String nombre, String direccion, TipoLugarPublico tipo) {

        log.debug("Listando lugares publicos de la app");

        List<LugarPublicoBase> lugares = new ArrayList<>();

        if (nombre != null) {
            lugares = lugarPublicoBaseRepository.findByNombreContainingIgnoreCase(nombre);
        } else if (direccion != null) {
            lugares = lugarPublicoBaseRepository.findByDireccionContainingIgnoreCase(direccion);
        } else if (tipo != null) {
            lugares = lugarPublicoBaseRepository.findByTipo(tipo);
        } else {
            lugares = lugarPublicoBaseRepository.findAll();
        }

        List<LugarPublicoBaseDTO> lugaresDTO = new ArrayList<>();

        for (LugarPublicoBase lugar : lugares) {
            lugaresDTO.add(entityToDto(lugar));
        }

        return lugaresDTO;
    }

    public LugarPublicoBaseDTO buscarPorId(Long id) {

        log.debug("Buscando lugar con id: {}", id);

        LugarPublicoBase lugar = lugarPublicoBaseRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lugar con id: " + id + " No encontrado."));

        return entityToDto(lugar);
    }

    @Transactional
    public LugarPublicoBaseDTO crearLugarPublico(CrearLugarPublicoDTO dto) {

        log.info("Creando lugar publico {}", LogSanitizer.sanitize(dto.getNombre()));

        if (lugarPublicoBaseRepository.findByNombreIgnoreCase(dto.getNombre()).isPresent()) {
            throw new OperacionNoPermitida("Ya existe un lugar público base con ese nombre.");
        }

        LugarPublicoBase lugar = new LugarPublicoBase();
        lugar.setNombre(dto.getNombre());
        lugar.setDireccion(dto.getDireccion());
        lugar.setTelefono(dto.getTelefono());
        lugar.setHorario(dto.getHorario());
        lugar.setDescripcion(dto.getDescripcion());
        lugar.setLatitud(dto.getLatitud());
        lugar.setLongitud(dto.getLongitud());
        lugar.setTipo(dto.getTipo());

        LugarPublicoBase lugarGuardado = lugarPublicoBaseRepository.save(lugar);

        log.info("Lugar publico base {} creado", dto.getNombre());

        return entityToDto(lugarGuardado);
    }

    @Transactional
    public LugarPublicoBaseDTO actualizarLugarPublico(Long id, CrearLugarPublicoDTO dto) {

        log.info("Actualizando lugar publico con id: {}", id);

        LugarPublicoBase lugar = lugarPublicoBaseRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lugar con id: " + id + " No encontrado."));

        lugarPublicoBaseRepository.findByNombreIgnoreCase(dto.getNombre()).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new OperacionNoPermitida("Ya existe otro lugar público base con ese nombre.");
            }
        });

        lugar.setNombre(dto.getNombre());
        lugar.setDireccion(dto.getDireccion());
        lugar.setTelefono(dto.getTelefono());
        lugar.setHorario(dto.getHorario());
        lugar.setDescripcion(dto.getDescripcion());
        lugar.setLatitud(dto.getLatitud());
        lugar.setLongitud(dto.getLongitud());
        lugar.setTipo(dto.getTipo());

        LugarPublicoBase lugarGuardado = lugarPublicoBaseRepository.save(lugar);

        log.info("Lugar publico base {} actualizado", dto.getNombre());

        return entityToDto(lugarGuardado);
    }

    @Transactional
    public void eliminarLugarPublico(Long id) {

        log.info("Eliminando lugar publico con id: {}", id);

        LugarPublicoBase lugar = lugarPublicoBaseRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lugar con id: " + id + " No encontrado."));

        lugarPublicoBaseRepository.delete(lugar);

        log.info("Lugar publico base {} eliminado", lugar.getNombre());
    }

    public LugarPublicoBase dtoToEntity(LugarPublicoBaseDTO dto) {
        LugarPublicoBase lugar = new LugarPublicoBase();
        lugar.setId(dto.getId());
        lugar.setOsmId(dto.getOsmId());
        lugar.setNombre(dto.getNombre());
        lugar.setDireccion(dto.getDireccion());
        lugar.setTelefono(dto.getTelefono());
        lugar.setHorario(dto.getHorario());
        lugar.setDescripcion(dto.getDescripcion());
        lugar.setLatitud(dto.getLatitud());
        lugar.setLongitud(dto.getLongitud());
        lugar.setTipo(dto.getTipo());
        return lugar;
    }

    public LugarPublicoBaseDTO entityToDto(LugarPublicoBase lugar) {
        LugarPublicoBaseDTO dto = new LugarPublicoBaseDTO();
        dto.setId(lugar.getId());
        dto.setOsmId(lugar.getOsmId());
        dto.setNombre(lugar.getNombre());
        dto.setDireccion(lugar.getDireccion());
        dto.setTelefono(lugar.getTelefono());
        dto.setHorario(lugar.getHorario());
        dto.setDescripcion(lugar.getDescripcion());
        dto.setLatitud(lugar.getLatitud());
        dto.setLongitud(lugar.getLongitud());
        dto.setTipo(lugar.getTipo());
        return dto;
    }
}