package com.example.digital_fit.dto.CentroPrivado;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@JsonPropertyOrder({
        "id",
        "osmId",
        "nombre",
        "direccion",
        "telefono",
        "horario",
        "precioMensual",
        "descripcion",
        "latitud",
        "longitud"
})
@NoArgsConstructor
public class CentroPrivadoBaseDTO {
    private Long id;

    private Long osmId;

    private String nombre;

    private String direccion;

    private String telefono;

    private String horario;

    private Double precioMensual;

    private String descripcion;

    private Double latitud;

    private Double longitud;
}
