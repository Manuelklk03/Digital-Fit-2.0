package com.example.digital_fit.model.Entrenamientos;

import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;

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
@Entity
@AllArgsConstructor
@Builder
@Table(name = "entrenamientos_base")
public class EntrenamientoBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "nombre", unique = true)
    private String nombre;

    @Column(nullable = false, length = 1500, name = "descripcion")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private CategoriaEntrenamientoComunidad categoria;

    @Enumerated(EnumType.STRING)
    private NivelEntrenamiento nivel;

    private Integer duracionEnMinutos;
}
