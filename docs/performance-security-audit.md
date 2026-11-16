# Informe de Auditoría de Rendimiento y Seguridad (Tarea 6.3)

Fecha de auditoría: **14 de noviembre de 2026**  
Entornos auditados: **Local (Docker Compose)** y **Producción (Netlify + Render + Neon PostgreSQL)**.

---

## 1. Resumen Ejecutivo

Este informe documenta la revisión técnica de **rendimiento, tamaño de bundles y arquitectura de seguridad** correspondiente a la tarea **6.3** de la Fase 6 del roadmap de Digital-Fit 2.0.

- **Rendimiento Frontend:** Tamaño inicial de transferencia comprimido de **183.12 kB** (881.52 kB sin comprimir), dentro de los estándares óptimos para aplicaciones ricas SPA con mapas interactivos y animaciones. Carga diferida (lazy loading) activa en páginas clave y animaciones. Presupuestos de Angular ajustados a la realidad del proyecto sin advertencias de compilación.
- **Seguridad en Producción:** Protección CSRF activa mediante el patrón SPA oficial de Spring Security, emisión de cookies `XSRF-TOKEN` (`Secure`, `SameSite=Lax`), límite de intentos de login con HTTP 429 y cabecera `Retry-After`, cabeceras HTTP de protección perimetral verificadas en vivo en `https://digital-fit.netlify.app`, y aislamiento estricto de endpoints de diagnóstico y base de datos.
- **Parada G12:** Parcialmente resuelta (no bloqueante para Claude). La verificación empírica contra la URL pública de producción confirma que las cabeceras de seguridad (`HSTS`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), cookies seguras (`XSRF-TOKEN` con `Secure` y `SameSite=Lax`) y proxy inverso operan conforme al diseño. La prueba de saturación de rate limiting (429) en producción queda diferida a una comprobación inocua sin riesgo de bloqueo de IP real.

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
- **Estado:** **Parcialmente resuelta (No bloqueante)**.
- **Resultado:** Confirmada la correcta emisión de la cookie de sesión y la cookie `XSRF-TOKEN` sobre HTTPS en `https://digital-fit.netlify.app/api/auth/me` y cabeceras de seguridad perimetrales activas. La prueba activa de saturación de login con respuesta 429 se reserva para una comprobación aislada que no comprometa la IP real de los evaluadores.

---

## 5. Lighthouse (tarea 3.9, 2026-11-16)

Lighthouse 13.6.0 con Chrome sin interfaz, perfil móvil simulado por defecto. «Local» es la rama `feat/frontend-prerender` servida por el nginx de `docker compose`; «Producción» es `https://digital-fit.netlify.app` antes de desplegar el prerender.

| Página | Rend. | Acces. | Buenas prác. | SEO | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| Local `/inicio` | 40 | 95 | 96 | 100 | 5,4 s | 6,4 s | 0 | 1.150 ms |
| Local `/login` | 52 | 96 | 96 | 100 | 5,3 s | 5,3 s | 0 | 610 ms |
| Local `/register` | 59 | 96 | 96 | 100 | 5,1 s | 5,1 s | 0,005 | 400 ms |
| Producción `/inicio` | 55 | 95 | 96 | 100 | 3,5 s | 3,5 s | 0 | 990 ms |
| Producción `/login` | 68 | 96 | 96 | 100 | 2,9 s | 2,9 s | 0 | 900 ms |
| Producción `/register` | 68 | 96 | 96 | 100 | 3,2 s | 3,2 s | 0 | 760 ms |

**Cómo leerlo:**

- El rendimiento local y el de producción no son comparables: el nginx de Docker sirve HTML, JS y CSS **sin compresión** (por ejemplo, 37 KB de HTML de `/login` frente a 3 KB con Brotli en Netlify) y Lighthouse simula una red móvil lenta. La medida que vale es la de Netlify después de desplegar (pendiente).
- Una primera pasada local dio **CLS 0,85** en `/register`: el esqueleto de carga inicial se pintaba encima del HTML prerenderizado. Corregido en `app.ts` antes de cerrar la tarea.
- Algunas pasadas fallaron con `NO_FCP` (fallo intermitente de Chrome sin interfaz en Windows) y se repitieron.

**Hallazgos sin corregir (fuera del alcance de 3.9):**

1. **Contraste:** texto blanco sobre `--df-primary` (`#3b82f6`), 3,67:1, en botones primarios e insignias. Ya registrado el 2026-11-10 como decisión de diseño pendiente porque afecta a toda la aplicación.
2. **Fuente bloqueante:** la hoja de Google Fonts (Inter) bloquea el primer pintado unos 850 ms. Opciones: alojar la fuente o cargar la hoja sin bloquear.
3. **Consola:** cada visita anónima registra dos `401` de `/api/auth/me` (cabecera y guard). Es el comportamiento esperado de la API, pero Lighthouse lo cuenta como error en consola.
4. **JavaScript sin usar:** 214–289 KiB estimados en la primera carga; el mayor bloque es el chunk compartido de las pantallas privadas.
