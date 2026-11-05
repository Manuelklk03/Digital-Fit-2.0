package com.example.digital_fit.dto.Explorar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LugarExploracionDTO {

    private Long id;

    private Long osmId;

    private String nombre;

    private String categoria; // GIMNASIO, CALISTENIA, POLIDEPORTIVO, PISCINA, OTRO

    private String tipoOrigen; // LOCAL_PRIVADO, LOCAL_PUBLICO, OSM

    private String direccion;

    private Double latitud;

    private Double longitud;

    private String telefono;

    private String horario;

    private Double precioMensual;

    private String equipamiento;

    private Double distanciaKm;
}
