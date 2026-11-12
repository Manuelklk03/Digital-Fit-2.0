package com.example.digital_fit.config.security;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Servicio de limitación de tasa de intentos de inicio de sesión (Rate Limiting).
 * Controla intentos fallidos tanto por dirección IP como por nombre de usuario,
 * mitigando ataques de fuerza bruta y ataques distribuidos o con IP compartida.
 *
 * <p><strong>Estrategia ante proxies inversos e IP compartida (Hallazgo 2 Codex):</strong>
 * Si varios usuarios legítimos comparten una misma IP pública (NAT de oficina, red compartida
 * o proxy que no propague cabeceras), aplicar el mismo umbral restrictivo (5 intentos) bloquearía
 * a todos los usuarios. Para evitarlo, se diferencian dos umbrales:
 * <ul>
 *   <li>{@code maxAttemptsUser} (5 por defecto): bloquea la cuenta individual ante fuerza bruta dirigida.</li>
 *   <li>{@code maxAttemptsIp} (20 por defecto): umbral más amplio por IP para no penalizar a usuarios
 *       legítimos en entornos compartidos.</li>
 * </ul>
 *
 * <p><strong>Selección y validación de IP en X-Forwarded-For (Hallazgo 3 Codex):</strong>
 * En la arquitectura de producción (Netlify &rarr; Render), un cliente malicioso podría inyectar
 * una cabecera {@code X-Forwarded-For: ip-falsa}. Los proxies añaden la IP observada al final.
 * Por ello:
 * <ol>
 *   <li>Se valida sintácticamente que cada entrada sea una dirección IPv4 o IPv6 bien formada,
 *       descartando valores falsificados o maliciosos.</li>
 *   <li>Ante cadenas con múltiples proxies (&ge; 2 IPs válidas), se selecciona la penúltima IP
 *       (la que observó el proxy de entrada de confianza, Netlify), impidiendo que el atacante
 *       evada el límite manipulando el primer token a la izquierda. Si hay 1 sola IP válida, se toma esa.</li>
 * </ol>
 *
 * <p><strong>Estado en producción: sin verificar empíricamente.</strong>
 * El comportamiento exacto de Netlify al concatenar o reemplazar {@code X-Forwarded-For} hacia Render
 * no ha sido verificado en vivo. Se propone comprobarlo en producción mediante una petición GET
 * de prueba inspeccionando los logs de Render con una cabecera inocua antes de aplicar bloqueos agresivos.
 */
@Service
public class LoginRateLimiterService {

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");

    private final int maxAttemptsUser;
    private final int maxAttemptsIp;
    private final Duration lockoutDuration;

    private final Map<String, AttemptTracker> attemptsByIp = new ConcurrentHashMap<>();
    private final Map<String, AttemptTracker> attemptsByUser = new ConcurrentHashMap<>();

    public LoginRateLimiterService(
            @Value("${security.rate-limit.login.max-attempts-user:5}") int maxAttemptsUser,
            @Value("${security.rate-limit.login.max-attempts-ip:20}") int maxAttemptsIp,
            @Value("${security.rate-limit.login.lockout-seconds:60}") int lockoutSeconds) {
        this.maxAttemptsUser = maxAttemptsUser;
        this.maxAttemptsIp = maxAttemptsIp;
        this.lockoutDuration = Duration.ofSeconds(lockoutSeconds);
    }

    /**
     * Constructor para compatibilidad con pruebas unitarias que especifican un único umbral base.
     */
    public LoginRateLimiterService(int maxAttemptsUser, int lockoutSeconds) {
        this(maxAttemptsUser, maxAttemptsUser * 4, lockoutSeconds);
    }

    /**
     * Comprueba si una cadena representa una dirección IPv4 o IPv6 sintácticamente válida.
     */
    public static boolean isValidIp(String ip) {
        if (!StringUtils.hasText(ip)) {
            return false;
        }
        String trimmed = ip.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        if (IPV4_PATTERN.matcher(trimmed).matches()) {
            return true;
        }
        if (trimmed.contains(":") && trimmed.matches("^[0-9a-fA-F:]+$")) {
            try {
                java.net.InetAddress addr = java.net.InetAddress.getByName(trimmed);
                return addr instanceof java.net.Inet6Address;
            } catch (Exception ignored) {
                return false;
            }
        }
        return false;
    }

    /**
     * Resuelve la IP del cliente validando y seleccionando la IP de confianza
     * de la cabecera {@code X-Forwarded-For} en la cadena Netlify &rarr; Render,
     * o recurriendo a {@code request.getRemoteAddr()} si la cabecera está ausente o es inválida.
     */
    public String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            String[] tokens = xForwardedFor.split(",");
            List<String> validIps = new ArrayList<>();
            for (String token : tokens) {
                String candidate = token.trim();
                if (isValidIp(candidate)) {
                    validIps.add(candidate);
                }
            }
            if (!validIps.isEmpty()) {
                // En la cadena Netlify -> Render:
                // Si hay >= 2 IPs, la penúltima es la observada por el proxy de entrada (Netlify).
                // Si hay 1 IP, se toma esa única IP válida.
                if (validIps.size() >= 2) {
                    return validIps.get(validIps.size() - 2);
                } else {
                    return validIps.get(0);
                }
            }
        }
        String remoteAddr = request.getRemoteAddr();
        return isValidIp(remoteAddr) ? remoteAddr : (remoteAddr != null ? remoteAddr : "unknown-ip");
    }

    /**
     * Comprueba si la IP o el usuario superaron sus respectivos límites de intentos.
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
     * Registra un fallo de autenticación para la IP y para el usuario aplicando sus respectivos umbrales.
     */
    public void recordFailure(String ip, String username) {
        Instant now = Instant.now();
        recordFailureForKey(attemptsByIp, ip, maxAttemptsIp, now);
        if (StringUtils.hasText(username)) {
            recordFailureForKey(attemptsByUser, username.toLowerCase().trim(), maxAttemptsUser, now);
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

    private void recordFailureForKey(Map<String, AttemptTracker> map, String key, int maxAllowed, Instant now) {
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
            if (existing.attempts >= maxAllowed) {
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

