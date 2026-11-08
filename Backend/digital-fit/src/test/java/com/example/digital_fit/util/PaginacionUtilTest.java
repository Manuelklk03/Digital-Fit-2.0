package com.example.digital_fit.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Pruebas unitarias de PaginacionUtil")
class PaginacionUtilTest {

    @Test
    @DisplayName("Normalizar pageable nulo devuelve página 0 y tamaño por defecto 20")
    void normalizarNulo() {
        Pageable resultado = PaginacionUtil.normalizar(null);
        assertNotNull(resultado);
        assertEquals(0, resultado.getPageNumber());
        assertEquals(PaginacionUtil.TAMANO_POR_DEFECTO, resultado.getPageSize());
    }

    @Test
    @DisplayName("Normalizar página negativa la ajusta a 0")
    void normalizarPaginaNegativa() {
        Pageable pageable = PageRequest.of(0, 15);
        Pageable resultado = PaginacionUtil.normalizar(pageable);
        assertEquals(0, resultado.getPageNumber());
        assertEquals(15, resultado.getPageSize());
    }

    @Test
    @DisplayName("Normalizar tamaño mayor a 100 lo acota al límite máximo de 100")
    void normalizarTamanoMayorAlMaximo() {
        Pageable pageable = PageRequest.of(0, 500);
        Pageable resultado = PaginacionUtil.normalizar(pageable);
        assertEquals(0, resultado.getPageNumber());
        assertEquals(PaginacionUtil.TAMANO_MAXIMO, resultado.getPageSize());
    }

    @Test
    @DisplayName("Normalizar preserva ordenación definida")
    void normalizarPreservaOrdenacion() {
        Sort sort = Sort.by(Sort.Direction.DESC, "nombre");
        Pageable pageable = PageRequest.of(2, 25, sort);
        Pageable resultado = PaginacionUtil.normalizar(pageable);
        assertEquals(2, resultado.getPageNumber());
        assertEquals(25, resultado.getPageSize());
        assertEquals(sort, resultado.getSort());
    }

    @Test
    @DisplayName("Normalizar con orden por defecto lo aplica si el pageable no tiene orden")
    void normalizarAplicaOrdenPorDefecto() {
        Sort ordenPorDefecto = Sort.by(Sort.Direction.DESC, "fecha");
        Pageable pageable = PageRequest.of(1, 10);
        Pageable resultado = PaginacionUtil.normalizar(pageable, ordenPorDefecto);
        assertEquals(1, resultado.getPageNumber());
        assertEquals(10, resultado.getPageSize());
        assertTrue(resultado.getSort().isSorted());
        assertEquals(ordenPorDefecto, resultado.getSort());
    }
}
