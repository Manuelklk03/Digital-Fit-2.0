package com.example.digital_fit.repository.Entrenamientos;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Entrenamientos.EntrenamientoComunidad;
import com.example.digital_fit.model.Enums.CategoriaEntrenamientoComunidad;
import com.example.digital_fit.model.Enums.NivelEntrenamiento;

@Repository
public interface EntrenamientoComunidadRepository extends JpaRepository<EntrenamientoComunidad, Long> {

    List<EntrenamientoComunidad> findByCategoria(CategoriaEntrenamientoComunidad categoria);

    @EntityGraph(attributePaths = {"usuario"})
    Page<EntrenamientoComunidad> findByCategoria(CategoriaEntrenamientoComunidad categoria, Pageable pageable);

    List<EntrenamientoComunidad> findByNivel(NivelEntrenamiento nivel);

    @EntityGraph(attributePaths = {"usuario"})
    Page<EntrenamientoComunidad> findByNivel(NivelEntrenamiento nivel, Pageable pageable);

    List<EntrenamientoComunidad> findByDuracionEnMinutosLessThanEqual(Integer duracionEnMinutos);

    @EntityGraph(attributePaths = {"usuario"})
    Page<EntrenamientoComunidad> findByDuracionEnMinutosLessThanEqual(Integer duracionEnMinutos, Pageable pageable);

    List<EntrenamientoComunidad> findByNombreContainingIgnoreCase(String nombre);

    @EntityGraph(attributePaths = {"usuario"})
    Page<EntrenamientoComunidad> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    List<EntrenamientoComunidad> findAllByOrderByFechaPublicacionDesc();

    @EntityGraph(attributePaths = {"usuario"})
    @Query("SELECT e FROM EntrenamientoComunidad e")
    Page<EntrenamientoComunidad> findAllConUsuario(Pageable pageable);

    Optional<EntrenamientoComunidad> findByUsuarioAndNombreIgnoreCase(Usuario usuario, String nombre);
}