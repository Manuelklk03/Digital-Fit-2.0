package com.example.digital_fit.model.Entrenamientos;

import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "entrenamientos_usuario")
public class EntrenamientoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, length = 1500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    private CategoriaEntrenamientoComunidad categoria;

    @Enumerated(EnumType.STRING)
    private NivelEntrenamiento nivel;

    private Integer duracionEnMinutos;

    @Builder.Default
    private Boolean activo = true;

    @ManyToOne
    @JoinColumn(name = "entrenamiento_base_origen_id")
    private EntrenamientoBase entrenamientoBaseOrigen;

    @ManyToOne
    @JoinColumn(name = "entrenamiento_comunidad_origen_id")
    private EntrenamientoComunidad entrenamientoComunidadOrigen;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
