package com.example.digital_fit.repository.CentroPrivado;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.digital_fit.model.CentroPrivado.CentroPrivadoBase;

@Repository
public interface CentroPrivadoBaseRepository extends JpaRepository<CentroPrivadoBase, Long> {

    List<CentroPrivadoBase> findByNombreContainingIgnoreCase(String nombre);

    Page<CentroPrivadoBase> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);

    List<CentroPrivadoBase> findByDireccionContainingIgnoreCase(String direccion);

    Page<CentroPrivadoBase> findByDireccionContainingIgnoreCase(String direccion, Pageable pageable);

    List<CentroPrivadoBase> findByPrecioMensualLessThanEqual(Double precioMensual);

    Page<CentroPrivadoBase> findByPrecioMensualLessThanEqual(Double precioMensual, Pageable pageable);

    Optional<CentroPrivadoBase> findByNombreIgnoreCase(String nombre);
} 
