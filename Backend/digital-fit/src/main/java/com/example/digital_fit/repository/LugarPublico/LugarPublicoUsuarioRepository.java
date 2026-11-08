package com.example.digital_fit.repository.LugarPublico;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.LugarPublico.LugarPublicoUsuario;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Enums.TipoLugarPublico;

@Repository
public interface LugarPublicoUsuarioRepository extends JpaRepository<LugarPublicoUsuario, Long> {

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND (l.activo IS NULL OR l.activo = true)
            """)
    List<LugarPublicoUsuario> findVisiblesByUsuario(@Param("usuario") Usuario usuario);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND (l.activo IS NULL OR l.activo = true)
            """)
    Page<LugarPublicoUsuario> findVisiblesByUsuario(@Param("usuario") Usuario usuario, Pageable pageable);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND LOWER(l.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))
            AND (l.activo IS NULL OR l.activo = true)
            """)
    List<LugarPublicoUsuario> findVisiblesByUsuarioAndNombreContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("nombre") String nombre);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND LOWER(l.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))
            AND (l.activo IS NULL OR l.activo = true)
            """)
    Page<LugarPublicoUsuario> findVisiblesByUsuarioAndNombreContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("nombre") String nombre,
            Pageable pageable);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND LOWER(l.direccion) LIKE LOWER(CONCAT('%', :direccion, '%'))
            AND (l.activo IS NULL OR l.activo = true)
            """)
    List<LugarPublicoUsuario> findVisiblesByUsuarioAndDireccionContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("direccion") String direccion);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND LOWER(l.direccion) LIKE LOWER(CONCAT('%', :direccion, '%'))
            AND (l.activo IS NULL OR l.activo = true)
            """)
    Page<LugarPublicoUsuario> findVisiblesByUsuarioAndDireccionContainingIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("direccion") String direccion,
            Pageable pageable);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND l.tipo = :tipo
            AND (l.activo IS NULL OR l.activo = true)
            """)
    List<LugarPublicoUsuario> findVisiblesByUsuarioAndTipo(
            @Param("usuario") Usuario usuario,
            @Param("tipo") TipoLugarPublico tipo);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND l.tipo = :tipo
            AND (l.activo IS NULL OR l.activo = true)
            """)
    Page<LugarPublicoUsuario> findVisiblesByUsuarioAndTipo(
            @Param("usuario") Usuario usuario,
            @Param("tipo") TipoLugarPublico tipo,
            Pageable pageable);

    @Query("""
            SELECT l FROM LugarPublicoUsuario l
            WHERE l.usuario = :usuario
            AND LOWER(l.nombre) = LOWER(:nombre)
            AND (l.activo IS NULL OR l.activo = true)
            """)
    Optional<LugarPublicoUsuario> findVisibleByUsuarioAndNombreIgnoreCase(
            @Param("usuario") Usuario usuario,
            @Param("nombre") String nombre);
}