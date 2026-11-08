package com.example.digital_fit.controller.LugarPublico;

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
import com.example.digital_fit.dto.LugarPublico.AutocompletarLugarPublicoDTO;
import com.example.digital_fit.dto.LugarPublico.CrearLugarPublicoDTO;
import com.example.digital_fit.dto.LugarPublico.LugarPublicoUsuarioDTO;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.service.LugarPublico.AutocompletadoLugarPublicoService;
import com.example.digital_fit.service.LugarPublico.LugarPublicoUsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mis-lugares-publicos")
public class LugarPublicoUsuarioRestController {

    @Autowired
    private LugarPublicoUsuarioService lugarPublicoUsuarioService;

    @Autowired
    private AutocompletadoLugarPublicoService autocompletadoLugarPublicoService;

    @GetMapping
    public ResponseEntity<PaginaResponse<LugarPublicoUsuarioDTO>> listar(Authentication authentication,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) TipoLugarPublico tipo,
            @PageableDefault(page = 0, size = 20) Pageable pageable) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(lugarPublicoUsuarioService.listarOFiltrarPaginado(
                        authentication.getName(), nombre, direccion, tipo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LugarPublicoUsuarioDTO> obtenerPorId(@PathVariable Long id, Authentication authentication) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(lugarPublicoUsuarioService.verDetalle(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Long id, Authentication authentication) {

        lugarPublicoUsuarioService.borrarLugar(id, authentication.getName());

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping
    public ResponseEntity<LugarPublicoUsuarioDTO> crear(@Valid @RequestBody CrearLugarPublicoDTO dto,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(lugarPublicoUsuarioService.guardarDesdeMaps(dto, authentication.getName()));
    }

    @PostMapping("/base/{idBase}")
    public ResponseEntity<LugarPublicoUsuarioDTO> crearDesdeBase(@PathVariable Long idBase,
            Authentication authentication) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(lugarPublicoUsuarioService.guardarDesdeBase(idBase, authentication.getName()));
    }

    @GetMapping("/autocompletar")
    public ResponseEntity<AutocompletarLugarPublicoDTO> autocompletarDesdeUbicacion(
            @RequestParam Double latitud,
            @RequestParam Double longitud) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(autocompletadoLugarPublicoService.autocompletar(latitud, longitud));
    }
}