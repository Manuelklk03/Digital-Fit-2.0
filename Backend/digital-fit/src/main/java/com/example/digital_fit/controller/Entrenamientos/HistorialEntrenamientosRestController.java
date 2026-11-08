package com.example.digital_fit.controller.Entrenamientos;

import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.digital_fit.dto.Comun.PaginaResponse;
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoHistorialDTO;
import com.example.digital_fit.dto.Entrenamientos.HistorialEntrenamientosDTO;
import com.example.digital_fit.service.Entrenamientos.HistorialEntrenamientosService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/entrenamientos/mi-historial")
public class HistorialEntrenamientosRestController {

    @Autowired
    private HistorialEntrenamientosService historialEntrenamientosService;

    // Listar historial:
    @GetMapping
    public ResponseEntity<PaginaResponse<HistorialEntrenamientosDTO>> listarHistorialEntrenamientos(
            Authentication authentication,
            @RequestParam(required = false) Integer duracionMinutos,
            @RequestParam(required = false) LocalDateTime fecha,
            @PageableDefault(page = 0, size = 20) Pageable pageable) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(historialEntrenamientosService.listarOFiltrarHistorialPaginado(
                        authentication.getName(),
                        duracionMinutos,
                        fecha,
                        pageable));
    }

    // Ver detalles:

    @GetMapping("/{id}")
    public ResponseEntity<HistorialEntrenamientosDTO> verDetalles(@PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(historialEntrenamientosService.verDetalles(id, authentication.getName()));
    }

    // Registrar entrenamiento realizado:
    @PostMapping
    public ResponseEntity<HistorialEntrenamientosDTO> crearHistorialEntrenamiento(
            @Valid @RequestBody CrearEntrenamientoHistorialDTO dto, Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(historialEntrenamientosService.crearHistorialEntrenamiento(dto, authentication.getName()));
    }

    // Borrar registro:
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarHistorialEntrenamiento(@PathVariable Long id, Authentication authentication) {

        historialEntrenamientosService.borrarHistorialEntrenamiento(id, authentication.getName());

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
