package com.example.digital_fit.controller.CentroPrivado;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.digital_fit.dto.CentroPrivado.AutocompletarCentroPrivadoDTO;
import com.example.digital_fit.dto.CentroPrivado.CentroPrivadoUsuarioDTO;
import com.example.digital_fit.dto.CentroPrivado.CrearCentroPrivadoDTO;
import com.example.digital_fit.dto.comun.PaginaResponse;
import com.example.digital_fit.service.CentroPrivado.AutocompletadoCentroPrivadoService;
import com.example.digital_fit.service.CentroPrivado.CentroPrivadoUsuarioService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/mis-centros-privados")
public class CentroPrivadoUsuarioRestController {

    @Autowired
    private CentroPrivadoUsuarioService centroPrivadoUsuarioService;

    @Autowired
    private AutocompletadoCentroPrivadoService autocompletadoCentroPrivadoService;

    @GetMapping
    public ResponseEntity<PaginaResponse<CentroPrivadoUsuarioDTO>> listar(Authentication authentication,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) Double precioMensual,
            @PageableDefault(page = 0, size = 20) Pageable pageable) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(centroPrivadoUsuarioService.listarOFiltrarPaginado(
                        authentication.getName(), nombre, direccion, precioMensual, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentroPrivadoUsuarioDTO> obtenerPorId(@PathVariable Long id, Authentication authentication) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(centroPrivadoUsuarioService.verDetalle(id, authentication.getName()));
    }

    @PostMapping("/centros-app/{id}")
    public ResponseEntity<CentroPrivadoUsuarioDTO> AñadirPrivadoAMisCentros(@PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(centroPrivadoUsuarioService.AñadirPrivadoAMisCentros(id, authentication.getName()));
    }

    @PostMapping("/centros-maps")
    public ResponseEntity<CentroPrivadoUsuarioDTO> AñadirCentroPrivadoMaps(
            @Valid @RequestBody CrearCentroPrivadoDTO dto,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(centroPrivadoUsuarioService.AñdirCentroPrivadoMaps(dto, authentication.getName()));
    }

    @GetMapping("/autocompletar")
    public ResponseEntity<AutocompletarCentroPrivadoDTO> autocompletarDesdeUbicacion(
            @RequestParam Double latitud,
            @RequestParam Double longitud) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(autocompletadoCentroPrivadoService.autocompletar(latitud, longitud));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarDeMisCentrosGuardados(@PathVariable Long id, Authentication authentication) {

        centroPrivadoUsuarioService.borrarDeMisCentrosGuardados(id, authentication.getName());

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}