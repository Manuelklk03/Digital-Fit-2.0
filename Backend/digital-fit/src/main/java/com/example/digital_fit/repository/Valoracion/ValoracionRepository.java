package com.example.digital_fit.repository.Valoracion;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.Enums.TipoDeValoracion;
import com.example.digital_fit.model.Valoracion.Valoracion;
import com.example.digital_fit.model.Auth.Usuario;

@Repository
public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {

        boolean existsByUsuarioAndTipoDeValoracionAndIdRelacionado(Usuario usuario, TipoDeValoracion tipo,
                        Long idRelacionado);

        List<Valoracion> findByTipoDeValoracionAndIdRelacionado(TipoDeValoracion tipoDeValoracion, Long idRelacionado);

        @EntityGraph(attributePaths = {"usuario"})
        Page<Valoracion> findByTipoDeValoracionAndIdRelacionado(TipoDeValoracion tipoDeValoracion, Long idRelacionado,
                        Pageable pageable);

        List<Valoracion> findByUsuario(Usuario usuario);

        @EntityGraph(attributePaths = {"usuario"})
        Page<Valoracion> findByUsuario(Usuario usuario, Pageable pageable);

        @EntityGraph(attributePaths = {"usuario"})
        @Query("""
            SELECT v FROM Valoracion v
            WHERE v.usuario = :usuario
            AND LOWER(v.comentario) LIKE LOWER(CONCAT('%', :q, '%'))
        """)
        Page<Valoracion> buscarPorTexto(
                @Param("usuario") Usuario usuario,
                @Param("q") String q,
                Pageable pageable);

        Optional<Valoracion> findByUsuarioAndTipoDeValoracionAndIdRelacionado(
                        Usuario usuario,
                        TipoDeValoracion tipoDeValoracion,
                        Long idRelacionado);

        List<Valoracion> findByTipoDeValoracionInOrderByFechaDesc(List<TipoDeValoracion> tipos);

        @EntityGraph(attributePaths = {"usuario"})
        Page<Valoracion> findByTipoDeValoracionIn(List<TipoDeValoracion> tipos, Pageable pageable);
}
