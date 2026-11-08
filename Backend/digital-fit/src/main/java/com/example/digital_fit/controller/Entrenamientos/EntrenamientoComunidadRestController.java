package com.example.digital_fit.controller.Entrenamientos;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.digital_fit.dto.Comun.PaginaResponse;
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoComunidadDTO;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoComunidadDTO;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoComunidadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/entrenamientos-comunidad")
public class EntrenamientoComunidadRestController {

    @Autowired
    private EntrenamientoComunidadService entrenamientoComunidadService;

    @GetMapping
    public ResponseEntity<PaginaResponse<EntrenamientoComunidadDTO>> listarOFiltrar(
            @RequestParam(required = false) CategoriaEntrenamientoComunidad categoria,
            @RequestParam(required = false) NivelEntrenamiento nivel,
            @RequestParam(required = false) Integer duracionEnMinutos,
            @RequestParam(required = false) String nombre,
            @PageableDefault(page = 0, size = 20) Pageable pageable) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(entrenamientoComunidadService.listarOFiltrarPaginado(categoria, nivel, duracionEnMinutos, nombre, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntrenamientoComunidadDTO> verDetalles(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(entrenamientoComunidadService.verDetalles(id));
    }

    @PostMapping
    public ResponseEntity<EntrenamientoComunidadDTO> crearNuevo(
            @Valid @RequestBody CrearEntrenamientoComunidadDTO entrenamientoComunidadDTO,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(entrenamientoComunidadService.crearEntrenamiento(
                        entrenamientoComunidadDTO,
                        authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntrenamientoComunidadDTO> actualizarEntrenamiento(
            @PathVariable Long id,
            @Valid @RequestBody CrearEntrenamientoComunidadDTO entrenamientoComunidadDTO,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(entrenamientoComunidadService.actualizarEntrenamiento(
                        id,
                        entrenamientoComunidadDTO,
                        authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarEntrenamiento(@PathVariable Long id, Authentication authentication) {
        entrenamientoComunidadService.borrarEntrenamiento(id, authentication.getName());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}