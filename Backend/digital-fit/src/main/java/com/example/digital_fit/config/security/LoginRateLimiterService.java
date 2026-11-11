package com.example.digital_fit.config.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Servicio de limitación de tasa de intentos de inicio de sesión (Rate Limiting).
 * Controla intentos fallidos tanto por dirección IP (respetando proxies inversos como Netlify)
 * como por nombre de usuario.
 *
 * <p><strong>Nota sobre persistencia y escalabilidad:</strong>
 * Esta implementación almacena los intentos estrictamente en memoria (RAM) mediante
 * {@link ConcurrentHashMap}. Esto implica que:
 * <ul>
 *   <li>Los contadores se reinician ante cualquier reinicio del servidor o despliegue.</li>
 *   <li>No escala horizontalmente entre múltiples réplicas/instancias sin un almacén
 *       distribuido como Redis.</li>
 *   <li>El bloqueo es temporal (por defecto 60 segundos) y nunca permanente, garantizando
 *       que los usuarios de demostración no queden bloqueados definitivamente.</li>
 * </ul>
 */
@Service
public class LoginRateLimiterService {

    private final int maxAttempts;
    private final Duration lockoutDuration;

    private final Map<String, AttemptTracker> attemptsByIp = new ConcurrentHashMap<>();
    private final Map<String, AttemptTracker> attemptsByUser = new ConcurrentHashMap<>();

    public LoginRateLimiterService(
            @Value("${security.rate-limit.login.max-attempts:5}") int maxAttempts,
            @Value("${security.rate-limit.login.lockout-seconds:60}") int lockoutSeconds) {
        this.maxAttempts = maxAttempts;
        this.lockoutDuration = Duration.ofSeconds(lockoutSeconds);
    }

    /**
     * Resuelve la IP real del cliente, extrayéndola de la cabecera {@code X-Forwarded-For}
     * si la petición proviene de un proxy inverso (como Netlify o Render) o utilizando
     * la dirección remota directa como alternativa.
     */
    public String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown-ip";
    }

    /**
     * Comprueba si la IP o el usuario superaron el límite de intentos y continúan bloqueados.
     */
    public boolean isBlocked(String ip, String username) {
        Instant now = Instant.now();
        if (isKeyBlocked(attemptsByIp, ip, now)) {
            return true;
        }
        if (StringUtils.hasText(username) && isKeyBlocked(attemptsByUser, username.toLowerCase().trim(), now)) {
            return true;
        }
        return false;
    }

    /**
     * Retorna los segundos restantes de bloqueo para la cabecera {@code Retry-After}.
     */
    public long getRetryAfterSeconds(String ip, String username) {
        Instant now = Instant.now();
        long retryIp = getRemainingSeconds(attemptsByIp, ip, now);
        long retryUser = StringUtils.hasText(username) ? getRemainingSeconds(attemptsByUser, username.toLowerCase().trim(), now) : 0;
        long max = Math.max(retryIp, retryUser);
        return max > 0 ? max : 1;
    }

    /**
     * Registra un fallo de autenticación para la IP y para el usuario.
     */
    public void recordFailure(String ip, String username) {
        Instant now = Instant.now();
        recordFailureForKey(attemptsByIp, ip, now);
        if (StringUtils.hasText(username)) {
            recordFailureForKey(attemptsByUser, username.toLowerCase().trim(), now);
        }
    }

    /**
     * Registra un éxito de autenticación, limpiando los intentos acumulados para la IP y el usuario.
     */
    public void recordSuccess(String ip, String username) {
        if (StringUtils.hasText(ip)) {
            attemptsByIp.remove(ip);
        }
        if (StringUtils.hasText(username)) {
            attemptsByUser.remove(username.toLowerCase().trim());
        }
    }

    /**
     * Restablece todos los contadores en memoria (útil para pruebas unitarias y de integración).
     */
    public void resetAll() {
        attemptsByIp.clear();
        attemptsByUser.clear();
    }

    private boolean isKeyBlocked(Map<String, AttemptTracker> map, String key, Instant now) {
        if (!StringUtils.hasText(key)) {
            return false;
        }
        AttemptTracker tracker = map.get(key);
        if (tracker == null) {
            return false;
        }
        if (tracker.lockedUntil != null) {
            if (now.isBefore(tracker.lockedUntil)) {
                return true;
            } else {
                // El periodo de bloqueo ya venció, se restablece
                map.remove(key);
                return false;
            }
        }
        return false;
    }

    private long getRemainingSeconds(Map<String, AttemptTracker> map, String key, Instant now) {
        if (!StringUtils.hasText(key)) {
            return 0;
        }
        AttemptTracker tracker = map.get(key);
        if (tracker != null && tracker.lockedUntil != null && now.isBefore(tracker.lockedUntil)) {
            return Duration.between(now, tracker.lockedUntil).getSeconds() + 1;
        }
        return 0;
    }

    private void recordFailureForKey(Map<String, AttemptTracker> map, String key, Instant now) {
        if (!StringUtils.hasText(key)) {
            return;
        }
        map.compute(key, (k, existing) -> {
            if (existing == null || (existing.lockedUntil != null && now.isAfter(existing.lockedUntil))) {
                AttemptTracker tracker = new AttemptTracker();
                tracker.attempts = 1;
                tracker.firstAttemptAt = now;
                return tracker;
            }
            existing.attempts++;
            if (existing.attempts >= maxAttempts) {
                existing.lockedUntil = now.plus(lockoutDuration);
            }
            return existing;
        });
    }

    private static class AttemptTracker {
        int attempts;
        Instant firstAttemptAt;
        Instant lockedUntil;
    }
}
