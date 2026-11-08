package com.example.digital_fit.controller.Entrenamientos;

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

import com.example.digital_fit.dto.comun.PaginaResponse;
import com.example.digital_fit.dto.Entrenamientos.CrearEntrenamientoUsuario;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoUsuarioDTO;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoUsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mis-entrenamientos")
public class EntrenamientoUsuarioRestController {

        @Autowired
        private EntrenamientoUsuarioService entrenamientoUsuarioService;

        @GetMapping
        public ResponseEntity<PaginaResponse<EntrenamientoUsuarioDTO>> listarOFiltrar(
                        Authentication authentication,
                        @RequestParam(required = false) CategoriaEntrenamientoComunidad categoria,
                        @RequestParam(required = false) NivelEntrenamiento nivel,
                        @RequestParam(required = false) Integer duracionEnMinutos,
                        @RequestParam(required = false) String nombre,
                        @PageableDefault(page = 0, size = 20) Pageable pageable) {

                return ResponseEntity.status(HttpStatus.OK)
                                .body(entrenamientoUsuarioService.listarOFiltrarPaginado(
                                                authentication.getName(),
                                                categoria,
                                                nivel,
                                                duracionEnMinutos,
                                                nombre,
                                                pageable));
        }

        @PostMapping
        public ResponseEntity<EntrenamientoUsuarioDTO> crearEntrenamientoUsuario(
                        @Valid @RequestBody CrearEntrenamientoUsuario dto,
                        Authentication authentication) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(entrenamientoUsuarioService.crearEntrenamientoPersonalizado(dto,
                                                authentication.getName()));
        }

        @PostMapping("/desde-base/{idBase}")
        public ResponseEntity<EntrenamientoUsuarioDTO> anadirEntrenamientoDesdeBase(
                        @PathVariable Long idBase,
                        Authentication authentication) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(entrenamientoUsuarioService.anadirDesdeBase(idBase, authentication.getName()));
        }

        @PostMapping("/desde-comunidad/{idComunidad}")
        public ResponseEntity<EntrenamientoUsuarioDTO> anadirEntrenamientoDesdeComunidad(
                        @PathVariable Long idComunidad,
                        Authentication authentication) {

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(entrenamientoUsuarioService.anadirDesdeComunidad(idComunidad,
                                                authentication.getName()));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> borrarEntrenamientoUsuario(
                        @PathVariable Long id,
                        Authentication authentication) {

                entrenamientoUsuarioService.borrarDeMisEntrenamientos(id, authentication.getName());
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }

        @GetMapping("/{id}")
        public ResponseEntity<EntrenamientoUsuarioDTO> obtenerPorId(
                        @PathVariable Long id,
                        Authentication authentication) {

                return ResponseEntity.status(HttpStatus.OK)
                                .body(entrenamientoUsuarioService.detalle(id, authentication.getName()));
        }
}