package com.example.digital_fit.repository.Entrenamientos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Entrenamientos.HistorialEntrenamientos;

@Repository
public interface HistorialEntrenamientosRepository extends JpaRepository<HistorialEntrenamientos, Long> {

    @EntityGraph(attributePaths = {"entrenamientoBase", "entrenamientoUsuario", "lugarPublicoBase", "lugarPublicoUsuario", "centroPrivadoBase", "centroPrivadoUsuario"})
    List<HistorialEntrenamientos> findByUsuarioOrderByFechaHoraDesc(Usuario usuario);

    @EntityGraph(attributePaths = {"entrenamientoBase", "entrenamientoUsuario", "lugarPublicoBase", "lugarPublicoUsuario", "centroPrivadoBase", "centroPrivadoUsuario"})
    Page<HistorialEntrenamientos> findByUsuario(Usuario usuario, Pageable pageable);

    @EntityGraph(attributePaths = {"entrenamientoBase", "entrenamientoUsuario", "lugarPublicoBase", "lugarPublicoUsuario", "centroPrivadoBase", "centroPrivadoUsuario"})
    List<HistorialEntrenamientos> findByUsuarioAndDuracionMinutosLessThanEqualOrderByFechaHoraDesc(Usuario usuario,
            int minutos);

    @EntityGraph(attributePaths = {"entrenamientoBase", "entrenamientoUsuario", "lugarPublicoBase", "lugarPublicoUsuario", "centroPrivadoBase", "centroPrivadoUsuario"})
    Page<HistorialEntrenamientos> findByUsuarioAndDuracionMinutosLessThanEqual(Usuario usuario,
            int minutos, Pageable pageable);

    @EntityGraph(attributePaths = {"entrenamientoBase", "entrenamientoUsuario", "lugarPublicoBase", "lugarPublicoUsuario", "centroPrivadoBase", "centroPrivadoUsuario"})
    List<HistorialEntrenamientos> findByUsuarioAndFechaHoraAfterOrderByFechaHoraDesc(Usuario usuario,
            LocalDateTime fecha);

    @EntityGraph(attributePaths = {"entrenamientoBase", "entrenamientoUsuario", "lugarPublicoBase", "lugarPublicoUsuario", "centroPrivadoBase", "centroPrivadoUsuario"})
    Page<HistorialEntrenamientos> findByUsuarioAndFechaHoraAfter(Usuario usuario,
            LocalDateTime fecha, Pageable pageable);
}
