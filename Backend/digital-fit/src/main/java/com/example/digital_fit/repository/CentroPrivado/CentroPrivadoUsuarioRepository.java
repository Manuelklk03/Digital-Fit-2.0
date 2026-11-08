package com.example.digital_fit.repository.CentroPrivado;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.CentroPrivado.CentroPrivadoUsuario;

@Repository
public interface CentroPrivadoUsuarioRepository extends JpaRepository<CentroPrivadoUsuario, Long> {

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND (c.activo IS NULL OR c.activo = true)
            """)
    List<CentroPrivadoUsuario> findVisiblesByUsuario(@Param("usuario") Usuario usuario);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND (c.activo IS NULL OR c.activo = true)
            """)
    Page<CentroPrivadoUsuario> findVisiblesByUsuario(@Param("usuario") Usuario usuario, Pageable pageable);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))
            AND (c.activo IS NULL OR c.activo = true)
            """)
    List<CentroPrivadoUsuario> findVisiblesByUsuarioAndNombreContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("nombre") String nombre);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))
            AND (c.activo IS NULL OR c.activo = true)
            """)
    Page<CentroPrivadoUsuario> findVisiblesByUsuarioAndNombreContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("nombre") String nombre,
            Pageable pageable);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND LOWER(c.direccion) LIKE LOWER(CONCAT('%', :direccion, '%'))
            AND (c.activo IS NULL OR c.activo = true)
            """)
    List<CentroPrivadoUsuario> findVisiblesByUsuarioAndDireccionContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("direccion") String direccion);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND LOWER(c.direccion) LIKE LOWER(CONCAT('%', :direccion, '%'))
            AND (c.activo IS NULL OR c.activo = true)
            """)
    Page<CentroPrivadoUsuario> findVisiblesByUsuarioAndDireccionContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("direccion") String direccion,
            Pageable pageable);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND c.precioMensual <= :precioMensual
            AND (c.activo IS NULL OR c.activo = true)
            """)
    List<CentroPrivadoUsuario> findVisiblesByUsuarioAndPrecioMensualLessThanEqual(
            @Param("usuario") Usuario usuario,
            @Param("precioMensual") Double precioMensual);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND c.precioMensual <= :precioMensual
            AND (c.activo IS NULL OR c.activo = true)
            """)
    Page<CentroPrivadoUsuario> findVisiblesByUsuarioAndPrecioMensualLessThanEqual(
            @Param("usuario") Usuario usuario,
            @Param("precioMensual") Double precioMensual,
            Pageable pageable);

    @Query("""
            SELECT c FROM CentroPrivadoUsuario c
            WHERE c.usuario = :usuario
            AND LOWER(c.nombre) = LOWER(:nombre)
            AND (c.activo IS NULL OR c.activo = true)
            """)
    Optional<CentroPrivadoUsuario> findVisibleByUsuarioAndNombreIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("nombre") String nombre);
}