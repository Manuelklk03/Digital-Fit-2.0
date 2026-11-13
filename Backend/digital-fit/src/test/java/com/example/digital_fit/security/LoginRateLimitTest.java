package com.example.digital_fit.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import jakarta.servlet.FilterChain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.example.digital_fit.config.security.LoginRateLimiterService;
import com.example.digital_fit.config.security.LoginRateLimitingFilter;

import tools.jackson.databind.ObjectMapper;

@DisplayName("Pruebas unitarias de LoginRateLimiterService (Rate Limiting de inicio de sesión)")
class LoginRateLimitTest {

    private LoginRateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        // 5 intentos por usuario, 20 intentos por IP, 60 segundos de bloqueo
        rateLimiterService = new LoginRateLimiterService(5, 20, 60);
    }

    @Test
    @DisplayName("Inicialmente la IP y el usuario no están bloqueados")
    void testInicialmenteNoBloqueado() {
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "usuario1")).isFalse();
    }

    @Test
    @DisplayName("Menos de 5 intentos fallidos no bloquean al usuario")
    void testMenosDeCincoIntentosNoBloquea() {
        for (int i = 0; i < 4; i++) {
            rateLimiterService.recordFailure("192.168.1.1", "usuario1");
        }
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "usuario1")).isFalse();
    }

    @Test
    @DisplayName("5 intentos fallidos bloquean al usuario pero no a la IP si el umbral de IP es 20")
    void testCincoIntentosFallidosBloqueaUsuario() {
        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailure("192.168.1.1", "usuario1");
        }
        // El usuario específico está bloqueado
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "usuario1")).isTrue();
        // Pero otro usuario desde la misma IP NO está bloqueado (evita DoS en IP compartida)
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "otroUsuario")).isFalse();
        assertThat(rateLimiterService.getRetryAfterSeconds("192.168.1.1", "usuario1")).isGreaterThan(0);
    }

    @Test
    @DisplayName("20 intentos fallidos en una misma IP bloquean la IP completa")
    void testVeinteIntentosFallidosBloqueaIpCompleta() {
        for (int i = 0; i < 20; i++) {
            rateLimiterService.recordFailure("192.168.1.50", "usuarioAleatorio" + i);
        }
        // Ahora cualquier usuario desde esa IP está bloqueado
        assertThat(rateLimiterService.isBlocked("192.168.1.50", "cualquierUsuario")).isTrue();
        assertThat(rateLimiterService.getRetryAfterSeconds("192.168.1.50", "cualquierUsuario")).isGreaterThan(0);
    }

    @Test
    @DisplayName("Un login exitoso reinicia el contador de intentos fallidos del usuario y de la IP")
    void testLoginExitosoReiniciaContador() {
        for (int i = 0; i < 4; i++) {
            rateLimiterService.recordFailure("192.168.1.1", "usuario1");
        }
        rateLimiterService.recordSuccess("192.168.1.1", "usuario1");

        for (int i = 0; i < 4; i++) {
            rateLimiterService.recordFailure("192.168.1.1", "usuario1");
        }
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "usuario1")).isFalse();
    }

    @Test
    @DisplayName("Bloqueo por usuario aplica incluso desde diferentes IPs")
    void testBloqueoPorUsuarioAfectaCualquierIp() {
        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailure("10.0.0." + i, "victimaAtaque");
        }
        assertThat(rateLimiterService.isBlocked("172.16.0.1", "victimaAtaque")).isTrue();
    }

    @Test
    @DisplayName("Resolución de IP respeta proxy inverso con varias IPs tomando la penúltima (cadena Netlify -> Render)")
    void testResolucionIpConXForwardedForVariasIps() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        // Cadena: [IP spoofed o salto previo, IP vista por Netlify, IP de Netlify añadida por Render]
        request.addHeader("X-Forwarded-For", "1.2.3.4, 203.0.113.195, 70.41.3.18");
        request.setRemoteAddr("10.0.0.1");

        String ip = rateLimiterService.resolveClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.195");
    }

    @Test
    @DisplayName("Resolución de IP con una sola IP válida en X-Forwarded-For toma esa IP")
    void testResolucionIpConUnaSolaIp() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "198.51.100.42");
        request.setRemoteAddr("10.0.0.1");

        String ip = rateLimiterService.resolveClientIp(request);
        assertThat(ip).isEqualTo("198.51.100.42");
    }

    @Test
    @DisplayName("Resolución de IP con cabecera falsificada descarta entradas no numéricas o maliciosas")
    void testResolucionIpConCabeceraFalsificadaDescartaValoresInvalidos() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "bad<script>, fake_ip, 203.0.113.50, 198.51.100.2");
        request.setRemoteAddr("10.0.0.1");

        // Solo 203.0.113.50 y 198.51.100.2 son válidas -> toma la penúltima (203.0.113.50)
        String ip = rateLimiterService.resolveClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.50");
    }

    @Test
    @DisplayName("Resolución de IP con cabecera completamente inválida recurre a getRemoteAddr")
    void testResolucionIpCabeceraInvalidaRecurreAGetRemoteAddr() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "malicious-domain.com, <inject>");
        request.setRemoteAddr("192.168.1.100");

        String ip = rateLimiterService.resolveClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.100");
    }

    @Test
    @DisplayName("Resolución de IP usa getRemoteAddr si no hay cabecera X-Forwarded-For")
    void testResolucionIpDirectaSinProxy() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.100");

        String ip = rateLimiterService.resolveClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.100");
    }

    @Test
    @DisplayName("Validación sintáctica de direcciones IPv4 e IPv6")
    void testValidacionSintacticaIps() {
        assertThat(LoginRateLimiterService.isValidIp("192.168.1.1")).isTrue();
        assertThat(LoginRateLimiterService.isValidIp("255.255.255.255")).isTrue();
        assertThat(LoginRateLimiterService.isValidIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).isTrue();
        assertThat(LoginRateLimiterService.isValidIp("2001:db8::1")).isTrue();
        assertThat(LoginRateLimiterService.isValidIp("::1")).isTrue();

        assertThat(LoginRateLimiterService.isValidIp("256.1.1.1")).isFalse();
        assertThat(LoginRateLimiterService.isValidIp("not-an-ip")).isFalse();
        assertThat(LoginRateLimiterService.isValidIp("192.168.1")).isFalse();
        assertThat(LoginRateLimiterService.isValidIp("")).isFalse();
        assertThat(LoginRateLimiterService.isValidIp(null)).isFalse();
    }

    @Test
    @DisplayName("LoginRateLimitingFilter permite peticiones que no son POST login")
    void testFilterPasaPeticionesNoLogin() throws Exception {
        LoginRateLimitingFilter filter = new LoginRateLimitingFilter(rateLimiterService, new ObjectMapper());
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/login");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);
        verify(chain).doFilter(request, response);
    }

    @Test
    @DisplayName("LoginRateLimitingFilter permite POST login cuando no está bloqueado")
    void testFilterPasaLoginNoBloqueado() throws Exception {
        LoginRateLimitingFilter filter = new LoginRateLimitingFilter(rateLimiterService, new ObjectMapper());
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("10.0.0.1");
        request.setParameter("username", "usuarioValido");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);
        verify(chain).doFilter(request, response);
    }

    @Test
    @DisplayName("LoginRateLimitingFilter devuelve 429 cuando el usuario o IP está bloqueado")
    void testFilterDevuelve429CuandoBloqueado() throws Exception {
        LoginRateLimitingFilter filter = new LoginRateLimitingFilter(rateLimiterService, new ObjectMapper());
        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailure("10.0.0.1", "usuarioBloqueado");
        }

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("10.0.0.1");
        request.setParameter("username", "usuarioBloqueado");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);
        verify(chain, never()).doFilter(request, response);
        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isNotNull();
        assertThat(response.getContentAsString()).contains("urn:problem-type:demasiadas-peticiones");
    }

    @Test
    @DisplayName("resetAll reinicia contadores de IP y usuarios")
    void testResetAll() {
        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailure("10.0.0.1", "usuario1");
        }
        assertThat(rateLimiterService.isBlocked("10.0.0.1", "usuario1")).isTrue();
        rateLimiterService.resetAll();
        assertThat(rateLimiterService.isBlocked("10.0.0.1", "usuario1")).isFalse();
    }
}
