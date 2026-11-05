package com.example.digital_fit.controller.Explorar;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.digital_fit.dto.Explorar.GeocodificacionResultadoDTO;
import com.example.digital_fit.dto.Explorar.LugarExploracionDTO;
import com.example.digital_fit.service.Explorar.ExploracionOsmService;
import com.example.digital_fit.service.Explorar.GeocodificacionService;

@RestController
@RequestMapping("/api/explorar")
public class ExploracionRestController {

    @Autowired
    private ExploracionOsmService exploracionOsmService;

    @Autowired
    private GeocodificacionService geocodificacionService;

    @GetMapping("/lugares")
    public ResponseEntity<List<LugarExploracionDTO>> buscarLugaresPorZona(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(required = false, defaultValue = "5.0") Double radioKm,
            @RequestParam(required = false) String categoria) {

        List<LugarExploracionDTO> lugares = exploracionOsmService.explorar(lat, lon, radioKm, categoria);
        return ResponseEntity.status(HttpStatus.OK).body(lugares);
    }

    @GetMapping("/geocodificar")
    public ResponseEntity<List<GeocodificacionResultadoDTO>> geocodificarDireccion(
            @RequestParam String q) {

        List<GeocodificacionResultadoDTO> resultados = geocodificacionService.buscar(q);
        return ResponseEntity.status(HttpStatus.OK).body(resultados);
    }

    @GetMapping("/geocodificar/inversa")
    public ResponseEntity<GeocodificacionResultadoDTO> geocodificarInversa(
            @RequestParam Double lat,
            @RequestParam Double lon) {

        GeocodificacionResultadoDTO res = geocodificacionService.reversa(lat, lon);
        if (res == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
}
