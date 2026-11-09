package com.example.digital_fit.repository.Entrenamientos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @EntityGraph(attributePaths = {"entrenamientoBase", "entrenamientoUsuario", "lugarPublicoBase", "lugarPublicoUsuario", "centroPrivadoBase", "centroPrivadoUsuario"})
    @Query("""
        SELECT h FROM HistorialEntrenamientos h
        LEFT JOIN h.entrenamientoBase eb
        LEFT JOIN h.entrenamientoUsuario eu
        LEFT JOIN h.lugarPublicoBase lpb
        LEFT JOIN h.lugarPublicoUsuario lpu
        LEFT JOIN h.centroPrivadoBase cpb
        LEFT JOIN h.centroPrivadoUsuario cpu
        WHERE h.usuario = :usuario
        AND (
            LOWER(h.notas) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(eb.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(eu.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(lpb.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(lpb.direccion) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(lpu.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(lpu.direccion) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(cpb.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(cpb.direccion) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(cpu.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(cpu.direccion) LIKE LOWER(CONCAT('%', :q, '%'))
        )
    """)
    Page<HistorialEntrenamientos> buscarPorTexto(
            @Param("usuario") Usuario usuario,
            @Param("q") String q,
            Pageable pageable);
}
