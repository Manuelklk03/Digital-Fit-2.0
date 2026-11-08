package com.example.digital_fit.controller.LugarPublico;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.digital_fit.dto.comun.PaginaResponse;
import com.example.digital_fit.dto.LugarPublico.LugarPublicoBaseDTO;
import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.service.LugarPublico.LugarPublicoBaseService;

@RestController
@RequestMapping("/api/lugares-publicos")
public class LugarPublicoBaseRestController {

    @Autowired
    private LugarPublicoBaseService lugarPublicoBaseService;

    @GetMapping
    public ResponseEntity<PaginaResponse<LugarPublicoBaseDTO>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String direccion,
            @RequestParam(required = false) TipoLugarPublico tipo,
            @PageableDefault(page = 0, size = 20) Pageable pageable) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(lugarPublicoBaseService.listarOFiltrarPaginado(nombre, direccion, tipo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LugarPublicoBaseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.OK).body(lugarPublicoBaseService.buscarPorId(id));
    }
}
