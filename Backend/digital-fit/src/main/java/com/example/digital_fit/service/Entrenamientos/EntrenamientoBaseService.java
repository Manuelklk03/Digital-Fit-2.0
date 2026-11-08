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
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoBaseDTO;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoBaseDTO;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoBase;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;
import com.example.digital_fit.repository.Entrenamientos.EntrenamientoBaseRepository;
import com.example.digital_fit.util.LogSanitizer;
import com.example.digital_fit.util.PaginacionUtil;

import jakarta.transaction.Transactional;

@Service
public class EntrenamientoBaseService {

    @Autowired
    private EntrenamientoBaseRepository entrenamientoBaseRepository;

    private static final Logger log = LoggerFactory.getLogger(EntrenamientoBaseService.class);

    public PaginaResponse<EntrenamientoBaseDTO> listarOFiltrarPaginado(
            CategoriaEntrenamientoComunidad categoria,
            NivelEntrenamiento nivel,
            Integer duracionEnMinutos,
            String nombre,
            Pageable pageable) {

        log.debug("Listando entrenamientos base con paginación");

        Pageable paginacion = PaginacionUtil.normalizar(pageable);
        Page<EntrenamientoBase> pagina;

        if (categoria != null) {
            pagina = entrenamientoBaseRepository.findByCategoria(categoria, paginacion);
        } else if (nivel != null) {
            pagina = entrenamientoBaseRepository.findByNivel(nivel, paginacion);
        } else if (duracionEnMinutos != null) {
            pagina = entrenamientoBaseRepository.findByDuracionEnMinutosLessThanEqual(duracionEnMinutos, paginacion);
        } else if (nombre != null) {
            pagina = entrenamientoBaseRepository.findByNombreContainingIgnoreCase(nombre, paginacion);
        } else {
            pagina = entrenamientoBaseRepository.findAll(paginacion);
        }

        return PaginaResponse.de(pagina, this::entityToDto);
    }

    public List<EntrenamientoBaseDTO> listarOFiltrar(CategoriaEntrenamientoComunidad categoria,
            NivelEntrenamiento nivel, Integer duracionEnMinutos, String nombre) {

        log.debug("Listando entrenamientos base");

        List<EntrenamientoBase> entrenamientosBase = new ArrayList<>();

        if (categoria != null) {
            entrenamientosBase = entrenamientoBaseRepository.findByCategoria(categoria);
        } else if (nivel != null) {
            entrenamientosBase = entrenamientoBaseRepository.findByNivel(nivel);
        } else if (duracionEnMinutos != null) {
            entrenamientosBase = entrenamientoBaseRepository.findByDuracionEnMinutosLessThanEqual(duracionEnMinutos);
        } else if (nombre != null) {
            entrenamientosBase = entrenamientoBaseRepository.findByNombreContainingIgnoreCase(nombre);
        } else {
            entrenamientosBase = entrenamientoBaseRepository.findAll();
        }

        List<EntrenamientoBaseDTO> entrenamientosBaseDTO = new ArrayList<>();

        for (EntrenamientoBase entrenamientoBase : entrenamientosBase) {
            entrenamientosBaseDTO.add(entityToDto(entrenamientoBase));
        }

        return entrenamientosBaseDTO;
    }

    public EntrenamientoBaseDTO obtenerPorId(Long id) {

        log.debug("Buscando entrenamiento base con id: {}", id);

        EntrenamientoBase entrenamientoBase = entrenamientoBaseRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento base no encontrado con ID: " + id));

        return entityToDto(entrenamientoBase);
    }

    public EntrenamientoBaseDTO entityToDto(EntrenamientoBase entrenamientoBase) {
        EntrenamientoBaseDTO dto = new EntrenamientoBaseDTO();
        dto.setId(entrenamientoBase.getId());
        dto.setNombre(entrenamientoBase.getNombre());
        dto.setDescripcion(entrenamientoBase.getDescripcion());
        dto.setCategoria(entrenamientoBase.getCategoria());
        dto.setNivel(entrenamientoBase.getNivel());
        dto.setDuracionEnMinutos(entrenamientoBase.getDuracionEnMinutos());
        return dto;
    }

    public EntrenamientoBase dtoToEntity(EntrenamientoBaseDTO dto) {
        EntrenamientoBase entrenamientoBase = new EntrenamientoBase();
        entrenamientoBase.setId(dto.getId());
        entrenamientoBase.setNombre(dto.getNombre());
        entrenamientoBase.setDescripcion(dto.getDescripcion());
        entrenamientoBase.setCategoria(dto.getCategoria());
        entrenamientoBase.setNivel(dto.getNivel());
        entrenamientoBase.setDuracionEnMinutos(dto.getDuracionEnMinutos());
        return entrenamientoBase;
    }

    @Transactional
    public EntrenamientoBaseDTO crearEntrenamientoBase(CrearEntrenamientoBaseDTO dto) {

        log.info("Creando entrenamiento base {}", LogSanitizer.sanitize(dto.getNombre()));

        if (entrenamientoBaseRepository.findByNombreIgnoreCase(dto.getNombre()).isPresent()) {
            throw new OperacionNoPermitida("Ya existe un entrenamiento base con ese nombre.");
        }

        EntrenamientoBase entrenamientoBase = new EntrenamientoBase();
        entrenamientoBase.setNombre(dto.getNombre());
        entrenamientoBase.setDescripcion(dto.getDescripcion());
        entrenamientoBase.setCategoria(dto.getCategoria());
        entrenamientoBase.setNivel(dto.getNivel());
        entrenamientoBase.setDuracionEnMinutos(dto.getDuracionEnMinutos());

        EntrenamientoBase entrenamientoBaseGuardado = entrenamientoBaseRepository.save(entrenamientoBase);

        log.info("Entrenamiento base {} creado", LogSanitizer.sanitize(dto.getNombre()));

        return entityToDto(entrenamientoBaseGuardado);
    }

    @Transactional
    public EntrenamientoBaseDTO actualizarEntrenamientoBase(Long id, CrearEntrenamientoBaseDTO dto) {

        log.info("Actualizando entrenamiento base con id {}", id);

        EntrenamientoBase entrenamientoBase = entrenamientoBaseRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento base no encontrado con ID: " + id));

        entrenamientoBaseRepository.findByNombreIgnoreCase(dto.getNombre()).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new OperacionNoPermitida("Ya existe otro entrenamiento base con ese nombre.");
            }
        });

        entrenamientoBase.setNombre(dto.getNombre());
        entrenamientoBase.setDescripcion(dto.getDescripcion());
        entrenamientoBase.setCategoria(dto.getCategoria());
        entrenamientoBase.setNivel(dto.getNivel());
        entrenamientoBase.setDuracionEnMinutos(dto.getDuracionEnMinutos());

        EntrenamientoBase entrenamientoBaseGuardado = entrenamientoBaseRepository.save(entrenamientoBase);

        log.info("Entrenamiento base con id {} actualizado", id);

        return entityToDto(entrenamientoBaseGuardado);
    }

    @Transactional
    public void eliminarEntrenamientoBase(Long id) {

        log.info("Eliminando entrenamiento base con id {}", id);

        EntrenamientoBase entrenamientoBase = entrenamientoBaseRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Entrenamiento base no encontrado con ID: " + id));

        entrenamientoBaseRepository.delete(entrenamientoBase);

        log.info("Entrenamiento base con id {} eliminado", id);
    }
}