package com.example.digital_fit.repository.LugarPublico;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.Enums.TipoLugarPublico;
import com.example.digital_fit.model.LugarPublico.LugarPublicoBase;

@Repository
public interface LugarPublicoBaseRepository extends JpaRepository<LugarPublicoBase, Long> {

    List<LugarPublicoBase> findByNombreContainingIgnoreCase(String nombre);

    Page<LugarPublicoBase> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    List<LugarPublicoBase> findByDireccionContainingIgnoreCase(String direccion);

    Page<LugarPublicoBase> findByDireccionContainingIgnoreCase(String direccion, Pageable pageable);

    List<LugarPublicoBase> findByTipo(TipoLugarPublico tipoLugarPublico);

    Page<LugarPublicoBase> findByTipo(TipoLugarPublico tipoLugarPublico, Pageable pageable);

    Optional<LugarPublicoBase> findByNombreIgnoreCase(String nombre);
}