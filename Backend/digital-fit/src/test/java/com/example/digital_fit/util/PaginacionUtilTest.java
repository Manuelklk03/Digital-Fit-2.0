package com.example.digital_fit.util;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.example.digital_fit.dto.comun.PaginaResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Pruebas unitarias de PaginacionUtil y PaginaResponse")
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
    @DisplayName("Normalizar con pageable unpaged devuelve valores por defecto")
    void normalizarUnpaged() {
        Pageable resultado = PaginacionUtil.normalizar(Pageable.unpaged());
        assertNotNull(resultado);
        assertEquals(0, resultado.getPageNumber());
        assertEquals(PaginacionUtil.TAMANO_POR_DEFECTO, resultado.getPageSize());

        Sort ordenPorDefecto = Sort.by("nombre");
        Pageable conOrden = PaginacionUtil.normalizar(Pageable.unpaged(), ordenPorDefecto);
        assertEquals(ordenPorDefecto, conOrden.getSort());
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
    @DisplayName("Normalizar con orden por defecto lo aplica si el pageable no tiene orden y limita tamaño")
    void normalizarAplicaOrdenPorDefecto() {
        Sort ordenPorDefecto = Sort.by(Sort.Direction.DESC, "fecha");
        Pageable pageable = PageRequest.of(1, 10);
        Pageable resultado = PaginacionUtil.normalizar(pageable, ordenPorDefecto);
        assertEquals(1, resultado.getPageNumber());
        assertEquals(10, resultado.getPageSize());
        assertTrue(resultado.getSort().isSorted());
        assertEquals(ordenPorDefecto, resultado.getSort());

        Pageable grande = PageRequest.of(0, 500);
        Pageable resGrande = PaginacionUtil.normalizar(grande, ordenPorDefecto);
        assertEquals(PaginacionUtil.TAMANO_MAXIMO, resGrande.getPageSize());
    }

    @Test
    @DisplayName("PaginaResponse crea respuesta a partir de Page y mapeo de elementos")
    void paginaResponseDePageYMapper() {
        Page<Integer> springPage = new PageImpl<>(List.of(1, 2, 3), PageRequest.of(0, 10), 3);
        PaginaResponse<Integer> response = PaginaResponse.de(springPage);
        assertEquals(3, response.content().size());
        assertEquals(0, response.page());
        assertEquals(10, response.size());
        assertEquals(3L, response.totalElements());
        assertEquals(1, response.totalPages());

        PaginaResponse<String> mapped = PaginaResponse.de(springPage, String::valueOf);
        assertEquals(List.of("1", "2", "3"), mapped.content());
    }
}
