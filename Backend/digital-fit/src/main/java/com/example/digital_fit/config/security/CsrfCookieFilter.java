package com.example.digital_fit.config.security;

import java.io.IOException;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro que fuerza la evaluación y carga del CsrfToken en cada petición HTTP,
 * garantizando que CookieCsrfTokenRepository emita la cookie XSRF-TOKEN
 * tanto en peticiones anónimas (p. ej. GET /api/auth/me) como autenticadas.
 */
public final class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken == null) {
            csrfToken = (CsrfToken) request.getAttribute("_csrf");
        }
        if (csrfToken != null) {
            // Fuerza la evaluación del DeferredCsrfToken para que se escriba la cookie XSRF-TOKEN en la respuesta
            csrfToken.getToken();
        }
        filterChain.doFilter(request, response);
    }
}
