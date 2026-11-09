package com.example.digital_fit.model.Valoracion;

import java.time.LocalDateTime;

import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Enums.TipoDeValoracion;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "valoraciones", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "usuario_id", "tipo_valoracion", "id_relacionado" }) })
public class Valoracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer puntuacion;

    @Column(length = 1500)
    private String comentario;

    private LocalDateTime fecha;

    // Para saber que se esta valorando.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "tipo_valoracion")
    private TipoDeValoracion tipoDeValoracion;

    // ID del elemento que se esta valorando.
    @Column(name = "id_relacionado", nullable = false)
    private Long idRelacionado; // ID del centro, lugar público o entrenamiento relacionado
    
    // Quien valora:
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
