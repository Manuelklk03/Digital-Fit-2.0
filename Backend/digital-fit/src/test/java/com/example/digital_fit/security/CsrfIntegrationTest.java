package com.example.digital_fit.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.digital_fit.config.SecurityConfig;
import com.example.digital_fit.controller.Auth.AuthController;
import com.example.digital_fit.handler.GlobalExceptionHandler;
import com.example.digital_fit.service.Auth.AuthService;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
@DisplayName("Pruebas de integración de protección CSRF y cabeceras de seguridad")
class CsrfIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    @DisplayName("Petición POST mutante sin token CSRF devuelve 403 Forbidden")
    void testPostSinTokenCsrf_Devuelve403Forbidden() throws Exception {
        mockMvc.perform(post("/api/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"test\",\"password\":\"Pass123!\",\"email\":\"test@test.com\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Petición POST con token CSRF inválido devuelve 403 Forbidden")
    void testPostConTokenCsrfInvalido_Devuelve403Forbidden() throws Exception {
        mockMvc.perform(post("/api/auth/registro")
                .header("X-XSRF-TOKEN", "token-falso")
                .cookie(new Cookie("XSRF-TOKEN", "otro-token"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"test\",\"password\":\"Pass123!\",\"email\":\"test@test.com\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Petición GET /api/auth/csrf devuelve 204 y genera cookie XSRF-TOKEN")
    void testGetCsrf_Devuelve204YEstableceCookie() throws Exception {
        mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().exists("XSRF-TOKEN"));
    }

    @Test
    @DisplayName("Petición GET /api/auth/me genera cookie XSRF-TOKEN mediante CsrfCookieFilter")
    void testGetMe_GeneraCookieXsrfToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(cookie().exists("XSRF-TOKEN"));
    }

    @Test
    @DisplayName("Petición POST con token CSRF válido supera la validación de CSRF")
    void testPostConTokenCsrfValido_SuperaCsrf() throws Exception {
        mockMvc.perform(post("/api/auth/registro")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"test\",\"password\":\"Pass123!\",\"email\":\"test@test.com\"}"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(403));
    }

    @Test
    @DisplayName("Respuestas HTTP incluyen cabeceras de seguridad requeridas")
    void testCabecerasDeSeguridadPresentes() throws Exception {
        mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().string("Permissions-Policy", "camera=(), microphone=(), geolocation=()"))
                .andExpect(header().string("X-Frame-Options", "DENY"));
    }
}
