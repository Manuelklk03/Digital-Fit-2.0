package com.example.digital_fit.repository.Entrenamientos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.Entrenamientos.EntrenamientoBase;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;

@Repository
public interface EntrenamientoBaseRepository extends JpaRepository<EntrenamientoBase, Long> {

        List<EntrenamientoBase> findByCategoria(CategoriaEntrenamientoComunidad categoria);

        Page<EntrenamientoBase> findByCategoria(CategoriaEntrenamientoComunidad categoria, Pageable pageable);

        List<EntrenamientoBase> findByNivel(NivelEntrenamiento nivel);

        Page<EntrenamientoBase> findByNivel(NivelEntrenamiento nivel, Pageable pageable);

        List<EntrenamientoBase> findByDuracionEnMinutosLessThanEqual(Integer duracionEnMinutos);

        Page<EntrenamientoBase> findByDuracionEnMinutosLessThanEqual(Integer duracionEnMinutos, Pageable pageable);

        List<EntrenamientoBase> findByNombreContainingIgnoreCase(String nombre);

        Page<EntrenamientoBase> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

        Optional<EntrenamientoBase> findByNombreIgnoreCase(String nombre);
}