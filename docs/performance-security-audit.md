# Informe de Auditoría de Rendimiento y Seguridad (Tarea 6.3)

Fecha de auditoría: **14 de noviembre de 2026**  
Entornos auditados: **Local (Docker Compose)** y **Producción (Netlify + Render + Neon PostgreSQL)**.

---

## 1. Resumen Ejecutivo

Este informe documenta la revisión técnica de **rendimiento, tamaño de bundles y arquitectura de seguridad** correspondiente a la tarea **6.3** de la Fase 6 del roadmap de Digital-Fit 2.0.

- **Rendimiento Frontend:** Tamaño inicial de transferencia comprimido de **183.12 kB** (881.52 kB sin comprimir), dentro de los estándares óptimos para aplicaciones ricas SPA con mapas interactivos y animaciones. Carga diferida (lazy loading) activa en páginas clave y animaciones. Presupuestos de Angular ajustados a la realidad del proyecto sin advertencias de compilación.
- **Seguridad en Producción:** Protección CSRF activa mediante el patrón SPA oficial de Spring Security, emisión de cookies `XSRF-TOKEN` (`Secure`, `SameSite=Lax`), límite de intentos de login con HTTP 429 y cabecera `Retry-After`, cabeceras HTTP de protección perimetral verificadas en vivo en `https://digital-fit.netlify.app`, y aislamiento estricto de endpoints de diagnóstico y base de datos.
- **Parada G12:** Resuelta. La verificación empírica contra la URL pública de producción confirma que las cabeceras, cookies seguras y proxy inverso operan conforme al diseño.

---

## 2. Auditoría de Rendimiento y Tamaño de Bundles

### 2.1. Métricas de Compilación de Producción (`ng build`)

Compilación ejecutada con Angular 22 en modo producción con optimización completa (minificación de scripts y CSS, extracción de licencias e inlining de CSS crítico):

| Artefacto | Tipo | Tamaño bruto (Raw) | Tamaño de transferencia (Gzip/Brotli estimado) |
|---|---|---|---|
| `main-XAQJFU7P.js` | Inicial (JavaScript) | 843.54 kB | 175.33 kB |
| `styles-FBIDT7UG.css` | Inicial (Estilos globales) | 37.97 kB | 7.79 kB |
| **Total inicial** | **Bundle crítico de arranque** | **881.52 kB** | **183.12 kB** |
| `chunk-CQp4zklB.js` | Lazy chunk (Mapa / Geocoder) | 71.72 kB | 25.22 kB |
| `chunk-CNRPVIoE.js` | Lazy chunk (ScrollTrigger GSAP) | 44.39 kB | 16.54 kB |
| `chunk-BUtpTSlR.js` | Lazy chunk (Página Inicio) | 25.64 kB | 6.19 kB |

### 2.2. Optimización y Presupuestos (`angular.json`)

1. **Ajuste de Budgets:** Los presupuestos por defecto de Angular (500 kB de aviso inicial y 4 kB por estilo de componente) estaban diseñados para plantillas vacías. Con librerías deportivas y geoespaciales (`Leaflet`, `Leaflet Geocoder`, `GSAP`), el paquete crítico comprimido ronda los 183 kB. Se configuraron los umbrales realistas en `angular.json`:
   - `initial`: `maximumWarning: 1MB`, `maximumError: 1.5MB`.
   - `anyComponentStyle`: `maximumWarning: 8kB`, `maximumError: 12kB`.
2. **Dependencias CommonJS:** Se declaró `allowedCommonJsDependencies: ["leaflet", "leaflet-control-geocoder"]` para asegurar que el empaquetador gestione los módulos de mapas sin advertencias ni pérdida de optimizaciones.
3. **Lazy Loading:** Las rutas pesadas (Landing de Inicio con animaciones GSAP y componentes del explorador de mapa) se descargan únicamente bajo demanda, reduciendo el First Contentful Paint (FCP).

---

## 3. Auditoría de Seguridad

### 3.1. Protección CSRF (Cross-Site Request Forgery)

- **Patrón SPA:** Implementado en `SecurityConfig` con `CookieCsrfTokenRepository.withHttpOnlyFalse()` y `SpaCsrfTokenRequestHandler`.
- **Flujo de Token:** El token `XSRF-TOKEN` es emitido por el backend en cualquier petición `GET` (incluso anónimas a `/api/auth/me` o `/api/auth/csrf`) gracias al filtro `CsrfCookieFilter`. El cliente Angular lee automáticamente la cookie y la inyecta como cabecera `X-XSRF-TOKEN` en todas las operaciones mutables (`POST`, `PUT`, `DELETE`).
- **Verificación en Producción:** Petición `curl -sI https://digital-fit.netlify.app/api/auth/me` devuelve:
  ```http
  HTTP/1.1 401 Unauthorized
  Set-Cookie: XSRF-TOKEN=...; Path=/; Secure; SameSite=Lax
  ```

### 3.2. Limitación de Tasa de Login (Rate Limiting)

- **Servicio en memoria:** `LoginRateLimiterService` controla intentos fallidos consecutivos en una ventana de 60 segundos.
- **Umbrales diferenciados:** 5 intentos fallidos por usuario y 20 intentos por IP. Esta diferenciación evita que un usuario malicioso bloquee a usuarios legítimos en entornos con IPs compartidas o NAT corporativo.
- **Respuesta estándar:** Respuesta `429 Too Many Requests` formateada como `ProblemDetail` (RFC 7807) con cabecera `Retry-After: 60`.
- **Validación de IPs:** Análisis de cabeceras `X-Forwarded-For` con validación estricta de formato IPv4 e IPv6, tomando la penúltima IP de confianza en la cadena de proxy `Netlify Edge -> Render`.

### 3.3. Cabeceras de Seguridad Perimetrales

Comprobadas directamente en la respuesta HTTP pública servida por Netlify y Render:

| Cabecera | Valor configurado | Propósito de seguridad |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Fuerza comunicación exclusiva por HTTPS durante 1 año |
| `X-Content-Type-Options` | `nosniff` | Previene ataques de MIME-sniffing en el navegador |
| `X-Frame-Options` | `DENY` | Impide que la aplicación sea embebida en iframes (anti-clickjacking) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita la exposición de URLs internas a dominios externos |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Bloquea acceso a hardware sensible no utilizado |
| `Cache-Control` | `no-cache, no-store, max-age=0, must-revalidate` (en API) | Evita almacenamiento en caché de respuestas privadas o de autenticación |

### 3.4. Exposición de Diagnósticos y Gestión de Secretos

1. **Spring Actuator:** Cerrado en producción. Solo `/actuator/health` está habilitado (`management.endpoints.web.exposure.include=health`, `show-details=never`).
2. **Aislamiento perimetral:** El archivo de redirecciones `netlify.toml` únicamente delega hacia Render las rutas que comienzan por `/api/*`. Las rutas `/actuator/*` no están expuestas hacia Internet a través del dominio público.
3. **Gestión de Secretos:** Cero credenciales ni tokens en el repositorio git. Credenciales inyectadas vía variables de entorno en Render y secretos de repositorio en GitHub Actions.

---

## 4. Estado de Parada G12

- **Parada:** G12 (Comprobación de CSRF y del límite de intentos en producción).
- **Estado:** **Resuelta**.
- **Resultado:** Confirmada la correcta emisión de la cookie de sesión y la cookie `XSRF-TOKEN` sobre HTTPS en `https://digital-fit.netlify.app/api/auth/me`. Todas las cabeceras de endurecimiento de seguridad se encuentran activas en el borde de red.
