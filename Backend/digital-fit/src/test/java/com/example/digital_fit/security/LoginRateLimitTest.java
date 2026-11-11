package com.example.digital_fit.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import com.example.digital_fit.config.security.LoginRateLimiterService;

@DisplayName("Pruebas unitarias de LoginRateLimiterService (Rate Limiting de inicio de sesión)")
class LoginRateLimitTest {

    private LoginRateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new LoginRateLimiterService(5, 60);
    }

    @Test
    @DisplayName("Inicialmente la IP y el usuario no están bloqueados")
    void testInicialmenteNoBloqueado() {
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "usuario1")).isFalse();
    }

    @Test
    @DisplayName("Menos de 5 intentos fallidos no bloquean")
    void testMenosDeCincoIntentosNoBloquea() {
        for (int i = 0; i < 4; i++) {
            rateLimiterService.recordFailure("192.168.1.1", "usuario1");
        }
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "usuario1")).isFalse();
    }

    @Test
    @DisplayName("5 intentos fallidos bloquean la IP y el usuario")
    void testCincoIntentosFallidosBloquea() {
        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailure("192.168.1.1", "usuario1");
        }
        assertThat(rateLimiterService.isBlocked("192.168.1.1", "usuario1")).isTrue();
        assertThat(rateLimiterService.getRetryAfterSeconds("192.168.1.1", "usuario1")).isGreaterThan(0);
    }

    @Test
    @DisplayName("Un login exitoso reinicia el contador de intentos fallidos")
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
    @DisplayName("Bloqueo por IP aplica incluso con diferentes nombres de usuario")
    void testBloqueoPorIpAfectaCualquierUsuario() {
        for (int i = 0; i < 5; i++) {
            rateLimiterService.recordFailure("192.168.1.50", "usuario" + i);
        }
        assertThat(rateLimiterService.isBlocked("192.168.1.50", "otroUsuario")).isTrue();
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
    @DisplayName("Resolución de IP respeta proxy inverso con cabecera X-Forwarded-For de Netlify")
    void testResolucionIpConXForwardedFor() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.195, 70.41.3.18, 150.172.238.178");
        request.setRemoteAddr("10.0.0.1");

        String ip = rateLimiterService.resolveClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.195");
    }

    @Test
    @DisplayName("Resolución de IP usa getRemoteAddr si no hay cabecera X-Forwarded-For")
    void testResolucionIpDirectaSinProxy() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.1.100");

        String ip = rateLimiterService.resolveClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.100");
    }
}
