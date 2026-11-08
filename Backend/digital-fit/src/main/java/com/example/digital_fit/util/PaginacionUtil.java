package com.example.digital_fit.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PaginacionUtil {

    public static final int TAMANO_POR_DEFECTO = 20;
    public static final int TAMANO_MAXIMO = 100;

    private PaginacionUtil() {
    }

    public static Pageable normalizar(Pageable pageable) {
        if (pageable == null || pageable.isUnpaged()) {
            return PageRequest.of(0, TAMANO_POR_DEFECTO);
        }
        int page = Math.max(0, pageable.getPageNumber());
        int size = pageable.getPageSize() <= 0 ? TAMANO_POR_DEFECTO : pageable.getPageSize();
        if (size > TAMANO_MAXIMO) {
            size = TAMANO_MAXIMO;
        }
        return PageRequest.of(page, size, pageable.getSort());
    }

    public static Pageable normalizar(Pageable pageable, Sort ordenPorDefecto) {
        Sort fallback = ordenPorDefecto != null ? ordenPorDefecto : Sort.unsorted();
        if (pageable == null || pageable.isUnpaged()) {
            return PageRequest.of(0, TAMANO_POR_DEFECTO, fallback);
        }
        int page = Math.max(0, pageable.getPageNumber());
        int size = pageable.getPageSize() <= 0 ? TAMANO_POR_DEFECTO : pageable.getPageSize();
        if (size > TAMANO_MAXIMO) {
            size = TAMANO_MAXIMO;
        }
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : fallback;
        return PageRequest.of(page, size, sort);
    }
}
