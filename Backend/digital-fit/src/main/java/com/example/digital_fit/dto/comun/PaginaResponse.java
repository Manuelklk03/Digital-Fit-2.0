package com.example.digital_fit.dto.comun;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({
        "content",
        "page",
        "size",
        "totalElements",
        "totalPages"
})
public record PaginaResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages) {

    public static <T> PaginaResponse<T> de(Page<T> pagina) {
        return new PaginaResponse<>(
                pagina.getContent(),
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages());
    }

    public static <T, R> PaginaResponse<R> de(Page<T> pagina, Function<T, R> mapper) {
        List<R> items = pagina.getContent().stream().map(mapper).toList();
        return new PaginaResponse<>(
                items,
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages());
    }
}
