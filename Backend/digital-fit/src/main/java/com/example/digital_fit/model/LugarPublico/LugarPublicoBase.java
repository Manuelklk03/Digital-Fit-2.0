package com.example.digital_fit.model.LugarPublico;

import com.example.digital_fit.model.Enums.TipoLugarPublico;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lugares_publicos_base")
public class LugarPublicoBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private String direccion;

    @Column(length = 1000)
    private String descripcion;

    private String telefono;

    private String horario;

    private Double latitud;

    private Double longitud;

    // ENUM:
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoLugarPublico tipo;

    @Column(name = "osm_id")
    private Long osmId;
}
