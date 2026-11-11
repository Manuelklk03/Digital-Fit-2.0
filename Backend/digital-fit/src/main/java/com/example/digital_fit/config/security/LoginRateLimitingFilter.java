package com.example.digital_fit.config.security;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

/**
 * Filtro de seguridad que intercepta peticiones a POST /api/auth/login
 * antes de la autenticación de Spring Security para verificar si la IP
 * o el usuario han superado el límite de intentos fallidos.
 * En caso de bloqueo, responde inmediatamente con código 429 Too Many Requests,
 * cuerpo ProblemDetail (RFC 7807) y cabecera HTTP Retry-After.
 */
public class LoginRateLimitingFilter extends OncePerRequestFilter {

    private final LoginRateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    public LoginRateLimitingFilter(LoginRateLimiterService rateLimiterService, ObjectMapper objectMapper) {
        this.rateLimiterService = rateLimiterService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("POST".equalsIgnoreCase(request.getMethod()) && isLoginPath(request)) {
            String ip = rateLimiterService.resolveClientIp(request);
            String username = request.getParameter("username");

            if (rateLimiterService.isBlocked(ip, username)) {
                long retryAfter = rateLimiterService.getRetryAfterSeconds(ip, username);

                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.setHeader("Retry-After", String.valueOf(retryAfter));

                ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Demasiados intentos fallidos de inicio de sesión. Por favor, espera antes de volver a intentarlo."
                );
                problem.setTitle("Demasiadas peticiones");
                problem.setType(URI.create("urn:problem-type:demasiadas-peticiones"));
                problem.setProperty("retryAfterSeconds", retryAfter);
                problem.setProperty("timestamp", Instant.now());

                response.getWriter().write(objectMapper.writeValueAsString(problem));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isLoginPath(HttpServletRequest request) {
        String path = request.getServletPath();
        if (path == null || path.isEmpty()) {
            path = request.getRequestURI();
        }
        return path.endsWith("/api/auth/login");
    }
}
