package com.example.digital_fit.dto.Explorar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeocodificacionResultadoDTO {

    private String nombre;

    private String direccionCompleta;

    private Double latitud;

    private Double longitud;

    private String tipo;
}
