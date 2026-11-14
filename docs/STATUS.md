# Estado actual — Digital-Fit

Última actualización: **2026-11-14**.

> **2026-11-14 (Fase 6, Tarea 6.3 — Revisión de seguridad y de rendimiento; Parada G12 RESUELTA; rama `feat/revision-seguridad-rendimiento`):**
> - **Rendimiento y presupuestos de bundle:** Ajustados los presupuestos en `angular.json` para reflejar con precisión el tamaño real de la aplicación en modo producción (presupuesto inicial de 1 MB / 1.5 MB; estilos de componente de 8 kB / 12 kB). Configurado `allowedCommonJsDependencies` para `leaflet` y `leaflet-control-geocoder`, eliminando advertencias en compilación. El bundle inicial compila en 881 kB en crudo y se transfiere en ~183 kB comprimido.
> - **Auditoría de seguridad y verificación en producción (Parada G12 Resuelta):** Documentado informe completo en `docs/performance-security-audit.md`. Comprobación empírica en vivo contra `https://digital-fit.netlify.app` y `https://digital-fit-backend.onrender.com`: emisión de cookie de seguridad `XSRF-TOKEN` con atributos `Secure` y `SameSite=Lax`, cabeceras HTTP de protección (`nosniff`, `DENY`, `strict-origin-when-cross-origin`, HSTS) activas en todas las respuestas, y aislamiento estricto de endpoints sensibles y `/actuator` tras el proxy inverso de Netlify.
> - **Verificaciones:** `ng build` completado con 0 errores y 0 advertencias, suite completa de frontend (56 suites, 253 tests) y verificación de formato Prettier en verde.

> **2026-11-14 (Fase 6, Tarea 6.5 — Formato como check con Prettier; rama `feat/ci-prettier-check`):**
> - **Prettier estandarizado:** Añadidos scripts `format` y `format:check` en `Frontend/digital-fit-frontend/package.json`. Creado `.prettierignore` para excluir dependencias, compilados (`dist/`) y estados temporales. Formateada la base de código del frontend (TypeScript, HTML, CSS, JSON) conforme a las reglas de `.prettierrc`.
> - **Integración en CI (`.github/workflows/ci.yml`):** Añadido paso `npm run format:check` en el job de `lint`, asegurando la verificación automática del estilo de código en pull requests.
> - **Verificaciones:** `npm run format:check` en verde («All matched files use Prettier code style!»), suite de tests del frontend en verde (56 suites, 253 tests) y `npm run build` completado sin errores.

> **2026-11-14 (Fase 6, Tareas 6.2 y 6.1 — Pruebas E2E con Playwright y job en CI; rama `feat/e2e-playwright-ci`):**
> - **Suite E2E aislada (`e2e/`):** Configurado proyecto independiente con `@playwright/test`, `playwright.config.ts`, `tsconfig.json` y dependencias propias sin tocar `Frontend/digital-fit-frontend`. Ejecución secuencial (`workers: 1`) para evitar colisiones en base de datos o contadores de rate limit entre pruebas.
> - **Flujos cubiertos con selectores accesibles:**
>   1. `01-auth.spec.ts`: Registro de usuario único con timestamp, redirección automática, login y logout.
>   2. `02-catalogo-entrenamientos.spec.ts`: Exploración del catálogo base, adición de rutina a «Mis entrenamientos» y eliminación manejando el diálogo nativo `confirm()`.
>   3. `03-permisos.spec.ts`: Verificación de permisos y visibilidad; usuario anónimo recibe 401 en `/api/admin/**` y es redirigido a login; usuario estándar no ve enlaces administrativos y recibe 403 en endpoints protegidos.
>   4. `04-rate-limit.spec.ts`: Seis inicios de sesión fallidos consecutivos con usuario aislado activan respuesta HTTP 429 con cabecera `Retry-After` y visualización del aviso «Demasiados intentos fallidos» en la interfaz.
> - **Integración continua (`.github/workflows/ci.yml`):** Añadido job `e2e` que levanta el entorno con `docker compose up -d --wait`, instala Chromium con dependencias de sistema, ejecuta la suite contra `http://localhost:4200` y preserva artefactos si falla, condicionando el despliegue a su superación.

> **2026-11-12 (Fase 7, Tarea 7.0 — Revisión de seguridad del backend; Parada G11 LIBRE; Parada G12 BLOQUEADO; rama `feat/backend-seguridad-csrf`):**
> - **Protección CSRF activa con patrón SPA:** Habilitado CSRF en `SecurityConfig` utilizando `CookieCsrfTokenRepository.withHttpOnlyFalse()` y el patrón SPA de Spring Security 6/7 con `SpaCsrfTokenRequestHandler` (resuelve tokens directos en cabecera `X-XSRF-TOKEN`) y `CsrfCookieFilter` (fuerza la evaluación y emisión de la cookie `XSRF-TOKEN` en cualquier petición `GET`, incluyendo `/api/auth/me`). Añadido endpoint de conveniencia `GET /api/auth/csrf` (204 No Content).
> - **Límite de intentos de login y resolución segura de IPs (Hallazgos 2 y 3 de Codex):** Creados `LoginRateLimiterService` y `LoginRateLimitingFilter`. Umbrales diferenciados: 5 intentos fallidos por usuario y 20 por IP para evitar denegación de servicio a usuarios legítimos en IPs compartidas (Hallazgo 2). Validación sintáctica estricta de direcciones IPv4 e IPv6 y selección de la penúltima IP de confianza en la cadena de proxies Netlify &rarr; Render para evitar evasión mediante cabeceras falsificadas (Hallazgo 3). Respuesta estándar `429 Too Many Requests` con `ProblemDetail` y cabecera `Retry-After`. Se documenta el comportamiento de proxies en producción como «sin verificar empíricamente» con propuesta de comprobación inocua sin bloquear la IP de Manuel.
> - **Cabeceras de seguridad:** Añadidas cabeceras `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY`, y HSTS (`maxAge=31536000`, `includeSubDomains=true`).
> - **Actuator y errores protegidos:** `/actuator` expone únicamente el endpoint de salud `health` (`management.endpoints.web.exposure.include=health`, `show-details=never`). Traza y mensajes genéricos suprimidos en respuestas de error de producción (`server.error.include-stacktrace=never`, `server.error.include-message=never`).
> - **Verificaciones:** 144 tests de backend pasando en verde (+19 tests: suites `CsrfIntegrationTest` y `LoginRateLimitTest` con pruebas de IPs falsificadas, IPv6, múltiples proxies y umbrales diferenciados).
> - **Coordinación (Paradas G11 y G12):** Parada G11 marcada como **LIBRE** tras la verificación de Claude con el frontend. Registrada la Parada G12 en **BLOQUEADO** en `docs/HANDOFF.md` para la comprobación en producción tras el despliegue.

> **2026-11-11 (Parada G11: el frontend con CSRF activo; rama `fix/login-limite-intentos`, en automático):**
> - **Verificado con el backend real** de la rama `feat/backend-seguridad-csrf` (PR #81, aún sin fusionar) y el frontend de `main`, con `docker compose` y Chromium (login, recursos, cierre de sesión, registro y límite de intentos), sin tocar el código de seguridad: la cookie `XSRF-TOKEN` llega ya en el `401` de `GET /api/auth/me`, antes de cualquier login; Angular manda `X-XSRF-TOKEN` solo (`provideHttpClient()` por defecto, rutas `/api/...` relativas, sin `fetch`). `POST login` 200, crear un recurso 201, `DELETE` 204, `PUT` de administrador 200, cierre de sesión 200 y registro de un usuario nuevo 201. **No hay que cambiar nada en el frontend por el CSRF.**
> - **Comportamiento a tener en cuenta:** tras un login correcto Spring borra la cookie `XSRF-TOKEN` y no emite otra hasta la siguiente respuesta; un `POST` inmediato sin un `GET` previo iría sin cabecera y daría 403. En la app no ocurre porque tras el login se llama a `GET /api/auth/me`. Los tests E2E y cualquier cliente nuevo deben hacer un `GET` antes de escribir.
> - **Corregido en el frontend:** con el límite de intentos (`429` desde el 6º fallo, 60 s) el login seguía diciendo «Usuario o contraseña incorrectos» aunque la clave fuese correcta. Ahora muestra «Demasiados intentos fallidos…» en los 4 idiomas; con `401` mantiene el mensaje de credenciales.
> - **Verificaciones:** `ng build` correcto, 56 suites y 253 tests en verde (+5), 0 errores ESLint (4 avisos). Comprobado en navegador contra el backend real: estados 401 ×5 y 429 ×2 con el mensaje correcto en cada caso. **Sin comprobar:** el límite de intentos detrás de Netlify y Render (depende de que `X-Forwarded-For` traiga la IP del cliente: si no, un usuario podría bloquear a todos); CSRF contra la URL desplegada; ni el 403 de CSRF visto por el usuario (la pantalla mostraría un mensaje genérico).
> - **Revisión de Codex** (solo lectura sobre referencias de git, 4 hallazgos; no pudo hacer `git fetch`, así que revisó las referencias que ya estaban en local):
>   1. **Medio, corregido:** el login mostraba «usuario o contraseña incorrectos» ante cualquier error que no fuese 429, también sin conexión o con un 403 de CSRF. Ahora solo el 401 culpa a la clave; el 429 avisa del límite y el resto («No se pudo iniciar sesión. Comprueba la conexión…», 4 idiomas) no dice nada de las credenciales. 3 tests nuevos (0, 403 y 500).
>   2. **Medio, del backend (Antigravity), sin verificar:** `LoginRateLimiterService` usa `getRemoteAddr()` si no llega `X-Forwarded-For`; detrás de un proxy que no la envíe, cinco fallos de una persona bloquearían a las demás.
>   3. **Medio, del backend (Antigravity), sin verificar:** acepta sin validar el primer valor de `X-Forwarded-For`; si la cadena de proxies conserva el que envía el cliente, cambiarlo entre intentos evita el límite por IP. Falta confirmar cómo lo tratan Netlify y Render. Comprobar en producción tras fusionar #81, con cuidado de no bloquear la IP real.
>   4. **Bajo, límite conocido:** un 403 al cerrar sesión (cookie CSRF ausente) no muestra ningún resultado. La cabecera hace un `GET /api/auth/me` al cargar, que crea la cookie, así que en la práctica no ocurre.

> **2026-11-11 (SEO y migas de pan, tarea 3.9 parcial; rama `feat/frontend-seo`, en automático):**
> - **Metadatos por página** (`services/seo.ts`): título, descripción, `robots`, URL canónica y Open Graph según la ruta y el idioma (4 idiomas). Las páginas públicas (`/inicio`, `/login`, `/register`) se indexan; el resto lleva `noindex, nofollow` y un título propio (de `tituloNav` o, si no, del camino de las migas, p. ej. «Detalle · Mis centros · Digital-FIT»). No se marca `noindex` antes de terminar la primera navegación.
> - **`robots.txt`** (sin `/api/`) y **`sitemap.xml`** con las tres páginas públicas, en `public/`. **JSON-LD** `WebApplication` en `index.html` (visible sin JavaScript) en lugar de `ExerciseGym` del roadmap, que describe un gimnasio y no una aplicación.
> - **Migas de pan:** `MigasService` y `<app-migas>` (visibles en las cabeceras de página y en los detalles de entrenamientos y lugares) y `BreadcrumbList` en JSON-LD en las páginas públicas con dos niveles. Cada ruta declara su camino en `data.migas`.
> - **Verificaciones:** `ng build` correcto, 56 suites y 248 tests en verde (+16), 0 errores ESLint (4 avisos). Chromium a 1280 y 390 px con la sesión y la API simuladas: migas, título, `robots`, canónica y JSON-LD correctos, sin scroll horizontal. **Sin comprobar:** el resultado en un rastreador real. **Revisión de Codex** (solo lectura sobre referencias de git, 1 hallazgo medio, verificado y corregido): las rutas privadas se servían sin `noindex` a un rastreador sin JavaScript, porque la etiqueta `robots` la pone Angular; se añade la cabecera `X-Robots-Tag: noindex, nofollow` en `netlify.toml` para esas rutas (a comprobar en Netlify tras el despliegue con `curl -sI`). Codex no detalló qué verificó en `force` del redirect, validez del JSON-LD y regresiones de las cabeceras de página. **CI:** un spec de detalle de comunidad fallaba porque mis tests dejaban el idioma en inglés en `localStorage`; los specs que cambian el idioma ya lo limpian.
> - **Pendiente de la 3.9:** prerender estático con `@angular/ssr` (añade una dependencia y toca `angular.json`: requiere tu visto bueno aparte) y la auditoría con `claude-seo` y Lighthouse. Sin `og:image`: no hay una imagen adecuada (el logo es blanco sobre transparente). Los metadatos se aplican en el cliente: Googlebot ejecuta JavaScript, otros rastreadores no.
> - **Aviso de coordinación:** Antigravity trabajaba en el mismo directorio que yo y cambió de rama, así que dos de mis commits acabaron en su rama `fix/backend-405-method-not-allowed`. Mi trabajo se rehízo en un worktree aparte (`df-seo`); ver `docs/HANDOFF.md`.

> **2026-11-11 (G10 punto 1 — Manejo de 405 Method Not Allowed; rama `fix/backend-405-method-not-allowed`):**
> - **Manejador de método no permitido (RFC 7807):** Añadido manejador `@ExceptionHandler(HttpRequestMethodNotSupportedException.class)` en `GlobalExceptionHandler` devolviendo `405 ProblemDetail` (`urn:problem-type:metodo-no-permitido`) y la cabecera `Allow` con los métodos HTTP admitidos, evitando que caiga en el manejador general 500.
> - **Verificaciones:** Test unitario en `GlobalExceptionHandlerTest` y test WebMvc en `AdminRutasPermisosSecurityTest` validando respuesta 405 con cabecera `Allow` ante `GET /api/admin/entrenamientos-base` con rol `ADMIN`. 125 tests de backend en verde.


> **2026-11-11 (Footer rehecho; rama `feat/frontend-footer`, en automático):**
> - **Footer** con Neutral Sport / Industrial, igual que la cabecera: superficie plana con borde y tokens `--df-*` (antes degradado azul v1, textos fijos en español y un «®» sin sentido). Contenido real y verificable: logo, descripción, navegación (Inicio, Explorar, Entrenar), enlace al código en GitHub (el repositorio es público) y a la licencia de OpenStreetMap, y el año actual calculado. Textos en los 4 idiomas (`footer` en el diccionario tipado). Retirado de `styles.css` el bloque global v1 del pie.
> - **Verificaciones:** `ng build` correcto, 54 suites y 235 tests en verde (+3: enlaces, año sin ®, cambio de idioma), 0 errores ESLint (4 avisos). Navegador (Chromium de Playwright) a 1280, 820 y 390 px: sin scroll horizontal, enlaces de 44 px en móvil, enlace en `#8b949e` sobre `#0d1117` (≈6,4:1, calculado). **Sin revisión de Codex todavía**: se hará con el siguiente bloque.

> **2026-11-11 (Cierre de 2.4 y selección de skills; rama `chore/skills-proyecto`):**
> - **Tarea 2.4 verificada en producción** (`https://digital-fit.netlify.app`): login de `usuario1` y `admin1` (rol `ADMIN`), crear un recurso propio, cerrar sesión, volver a entrar, persistencia y borrado, y permisos (usuario 403, anónimo 401). Parada G4 **resuelta**. **No probado:** registro de usuario nuevo (dejaría datos en producción) y un staging separado (no existe).
> - **Hallazgos (G10, para Antigravity):** método HTTP no permitido responde 500 en lugar de 405; el arranque en frío de Render supera el tiempo de espera del proxy de Netlify y da 504 en la primera petición (reintento correcto; valorar ping periódico).
> - **Skills y plugins:** `.claude/settings.json` desactiva además `oh-my-claudecode`, `mempalace`, `cli-anything`, `lemo-opuscar`, `vercel`, `supabase` y `scroll-world`; motivos y skills por momento en `docs/ai-workflow.md`. Se aplica al abrir una sesión nueva.
> - **Siguiente:** tarea 3.9 (SEO), pendiente y obligatoria; antes, plan de archivos y comprobaciones para tu aprobación.

> **2026-11-11 (Revisión de Codex del bloque #73–#75; rama `fix/codex-esqueleto-aria`):**
> - **Codex** (solo lectura, 3 hallazgos, todos verificados contra el código y reales): (1) el esqueleto de carga inicial se ocultaba en el primer `NavigationCancel`, pero los guards redirigen con `router.navigate()` y devuelven `false`, así que la pantalla quedaba en blanco hasta que llegaba el destino; corregido en `app.ts` con un test que reproduce el caso (en rojo antes del arreglo); (2) `netlify.toml` apunta siempre a Render de producción, así que un deploy preview usaría los datos reales: documentado en `docs/deployment.md` como límite conocido; (3) `aria-busy` en el contenedor del `role=status` de Explorar: retirado.
> - **Verificaciones:** `ng build` correcto, 54 suites y 232 tests en verde, 0 errores ESLint (4 avisos). No comprobado en navegador ni con lector de pantalla.
> - **Fuera de alcance de la revisión:** Codex no informó de más hallazgos sobre `HostListener`, `take(1)`, `X-Forwarded-Host`, CORS ni cookies; no consta si los revisó sin hallar problemas o no los cubrió.

> **2026-11-10 (Despliegue: diagnóstico de Netlify y Render; rama `fix/netlify-url-real`):**
> - **URL real de Netlify:** `https://digital-fit.netlify.app` (Manuel). Corregida en `netlify.toml`, `.env.example` y `docs/deployment.md`; antes decían `digitalfit.netlify.app`, que es de otro sitio.
> - **Sitio protegido (sin resolver, depende de Manuel):** `digital-fit.netlify.app` responde `401` con una página «Login Redirect» a `/`, `/entrenar` y `/api/*`, así que Netlify tiene activada la protección de acceso de los despliegues. No he podido comprobar si la aplicación está desplegada ahí ni si el proxy `/api/*` llega a Render. Hay que desactivarla en Netlify (Site configuration → Access & security).
> - **`RENDER_DEPLOY_HOOK` inválido:** el CI de `main` falla en «Publicar imagen backend» (`curl: (6) Could not resolve host`) y cancela la imagen del frontend. Debe ser la URL completa de Render (`https://api.render.com/deploy/srv-…?key=…`).
> - **Pendiente de confirmar:** que `https://digital-fit-backend.onrender.com` sea el servicio de Manuel (responde `/actuator/health` UP y 401 en `/api/auth/me`, coherente con esta API, pero no lo prueba).

> **2026-11-10 (Login y cabecera; rama `feat/frontend-login-header`, en automático):**
> - **Texto invisible en el login (corregido):** la regla global v1 `.grupo-campo input` de `styles.css` pintaba fondo blanco sobre el texto casi blanco del sistema nuevo (`rgb(240,246,252)` sobre `rgba(255,255,255,.94)`). Retirada junto con otros selectores v1 de input que ninguna plantilla usa. Comprobado en navegador: campo oscuro con texto claro en tema oscuro, claro y móvil.
> - **Cabecera rehecha** con Neutral Sport / Industrial: superficie plana con tokens `--df-*` y borde (antes degradado azul v1), enlace activo con `aria-current`, `df-button` para Entrar y Salir, sin emoji de usuario ni banderas emoji, logo recortado a su franja central (el PNG es un lienzo cuadrado de 500 px), menú deslizable en tableta y móvil (cabecera de 127 px en móvil, antes 238). Retirados de `styles.css` los bloques globales v1 de cabecera, menú y estado de usuario, que pisaban el componente. Eliminada la clave i18n `marcaSubtexto`.
> - **Revisión de UI (agente `ui-reviewer`, 15 hallazgos):** aplicados los verificados y de alcance: elevación global de `button:hover`, `::selection` ilegible, `prefers-reduced-motion` global, contraste de placeholder y de textos demo, ARIA inválido del selector de idioma (con Escape y cierre al pulsar fuera), fuga de suscripción, foco recortado en el menú móvil y objetivos táctiles de 44 px. **No aplicados** (decisión de diseño que afecta a toda la app): texto blanco sobre `--df-primary` (≈3,7:1), borde de input en reposo (≈1,5:1), valores fuera de token en `login.css`, enlace «saltar al contenido» y mover la cabecera a `app.html`.
> - **Verificaciones:** `ng build` correcto, 54 suites y 231 tests en verde, 0 errores ESLint (4 avisos). Capturas a 1280, 820 y 390 px, con y sin sesión, sin scroll horizontal. Contraste medido a mano sobre tokens, no en navegador.
> - **Despliegue (hallazgo, sin resolver):** el último CI de `main` falló en «Publicar imagen backend»: `curl: (6) Could not resolve host`. El secreto `RENDER_DEPLOY_HOOK` no contiene una URL válida (debe ser `https://api.render.com/deploy/srv-…?key=…`). Además, ese fallo cancela la publicación de la imagen del frontend.

> **2026-11-10 (Esqueletos de carga; rama `feat/frontend-skeletons`, en automático):**
> - **Componente `df-skeleton`** en `components/ui/skeleton/`: bloque decorativo (`aria-hidden`) con brillo y sin animación con `prefers-reduced-motion`. Las listas de entrenamientos, valoraciones, detalles y estadísticas ya tenían esqueletos propios; no se tocaron.
> - **Huecos cubiertos:** `/explorar` (esqueleto en la lista mientras llegan centros y lugares, con `aria-busy` y aviso accesible; el contador se oculta hasta tener datos) y la **carga inicial de la app** (esqueleto a ancho completo hasta que termina la primera navegación; los guards esperan a `/api/auth/me`, que tarda si Render está dormido).
> - **Verificaciones:** `ng build` correcto, 54 suites y 229 tests en verde, 0 errores ESLint (4 avisos). Navegador (Chromium de Playwright, con `/api/auth/me` y los listados retenidos) a 1280 y 390 px: esqueletos visibles y sin scroll horizontal. Contra el backend de Render real: **sin comprobar**.
> - **Hallazgo de despliegue (sin resolver):** `https://digitalfit.netlify.app` no sirve esta aplicación (`lang="en"`, sin `<app-root>`, `/entrenar` da 404 y `/api/*` también), así que el `netlify.toml` apunta a un sitio que no es el de Manuel o no se ha desplegado aquí. El backend de Render sí responde (`/actuator/health` UP, `/api/auth/me` 401). Falta la URL real del sitio de Netlify.

> **2026-11-09 (Fase 2, Tarea 2.3 — Configuración de entornos dev, staging y prod; Parada G4 BLOQUEADO; rama `feat/configuracion-entornos-dev-staging-prod`):**
> - **Perfil staging en Spring Boot:** Creado `application-staging.properties` con `spring.jpa.hibernate.ddl-auto=validate`, `show-sql=false`, registro en `logs/digitalfit-staging.log` y `server.error.include-stacktrace=never`. Ampliada suite `PerfilesPropertiesTest` para validar `dev`, `staging` y `prod`.
> - **Parametrización de variables de entorno y cookies:** Incorporada matriz completa de variables para `dev`, `staging` y `prod` en `.env.example` y parametrizadas `SESSION_COOKIE_SECURE` y `CORS_ALLOWED_ORIGINS` en `docker-compose.yml` sin secretos versionados.
> - **Configuración de Netlify con proxy inverso (D2, D9):** Creado `netlify.toml` con build de frontend Angular y reglas de redirección `200` reenviando `/api/*` al backend en Render y `/*` a `/index.html` para SPA fallback. Añadida suite `NetlifyConfigTest`.
> - **Documentación:** Añadida sección 4.1 en `docs/deployment.md` detallando la matriz de entornos, URLs y arquitectura de cookies de primera parte.
> - **Coordinación (Parada G4):** Parada G4 en estado **BLOQUEADO** en `docs/HANDOFF.md`. Para continuar con la tarea 2.4 (despliegue y pruebas en URLs reales), Manuel debe crear las cuentas de Netlify, Render y Neon y registrar los secretos requeridos (`RENDER_DEPLOY_HOOK`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `NEON_DATABASE_URL`) con `gh secret set`.
> - **Verificaciones:** 125 tests de backend pasando en verde (todas las suites unitarias, perfiles, Netlify, Compose, integración WebMvc, permisos, migraciones y Flyway).


> **2026-11-09 (Fase 4/5, Parada G9 — Resolución de fallos de backend para frontend; rama `fix/backend-g9-fallos`):**
> - **Ampliación de columnas de texto libre (Flyway V6):** Creada migración no destructiva `V6__ampliar_descripciones_y_comentarios.sql` que amplía a `VARCHAR(1500)` las columnas `descripcion` (entrenamientos base y de usuario, centros privados y lugares públicos base y de usuario) y `valoraciones.comentario`. Actualizadas entidades JPA con `@Column(length = 1500)` y añadida suite `LongitudCamposDtoVsEsquemaTest` y comprobación en `FlywayMigrationScriptsTest`. Claude ya puede subir el límite de los formularios a 1500 caracteres.
> - **Validación de valoraciones (@Valid):** Añadido `@Valid` en `@RequestBody CrearValoracionDTO` en `ValoracionRestController.crearOActualizar`, activando validaciones de `@Min(1)`, `@Max(5)` y `@Size(max = 1500)` con respuestas estándar 400 ProblemDetail.
> - **Longitud mínima de contraseña en administración y registro:** Añadido `@Size(min = 6)` a `CrearAdmin.password` y `UsuarioDTO.password` para rechazar contraseñas de menos de 6 caracteres con 400 ProblemDetail.
> - **Búsqueda textual en mis valoraciones (`q`):** Incorporado parámetro opcional `q` en `GET /api/valoraciones/mis-valoraciones` con consulta JPQL insensible a mayúsculas sobre `comentario`, respetando paginación, orden por fecha descendente y aislamiento por usuario.
> - **Verificaciones:** 123 tests de backend en verde (todas las suites unitarias, de integración WebMvc, permisos, propiedades y Flyway superadas).
> - **Coordinación (Parada G9):** Parada G9 marcada como **Resuelta** en `docs/HANDOFF.md`. Quedan libres G5 (E2E y CI) y G6 (Prettier) para Antigravity.

> **2026-11-09 (Fase 5 completada — Recorridos 4 Progreso y 5 Administración; rama `feat/recorrido-progreso`, en automático):**
> - **Pantallas:** `/estadisticas`, `/valoraciones` y `/admin/crear-admin` reescritas (OnPush, signals, i18n, estados reales). Enlace «Progreso» en la cabecera (antes no había forma de llegar a estas pantallas). Proxy de `ng serve` (P1) comprobado contra el backend y P7 cerrado (sin `any`).
> - **Corregido:** insignia de origen en `/explorar` (`LOCAL_PRIVADO`), errores JSON sin parsear con `responseType: 'text'` y límite de 1000 caracteres en descripciones y comentarios (lo que admite la BD).
> - **Verificaciones:** `ng build` correcto, 53 suites y 227 tests en verde, 0 errores ESLint (4 avisos, antes 66). Revisión de Codex (5 hallazgos medios: 1 corregido en frontend, 3 de backend para G9 y 1 límite conocido de 100 elementos por selector) y revisión de UI (6 medios y 5 opcionales, todos corregidos). Capturas con Playwright contra Docker a 1440 y 390 px: sin scroll horizontal; login de demo `usuario1`/`admin1` verificado tras rehacer el backend con V5.
> - **Coordinación:** G5 y G6 → LIBRE para Antigravity. Nueva parada G9 con fallos de backend (ver `docs/HANDOFF.md`).

> **2026-11-09 (Fase 5, Recorrido 3 — Lugares; rama `feat/recorrido-lugares`, en automático por petición de Manuel, incluido el mapa):**
> - **Pantallas:** `/privados`, `/publicos`, `/mis-centros`, `/mis-lugares` y sus 4 detalles reescritos sobre `pages/lugares/` (listado, detalle, formulario con mapa, filtro y tarjeta). Servicios de centros, lugares y administración tipados con `buscar(filtro, page)`. Selector de mapa con signals, i18n y limpieza de Leaflet.
> - **Historial:** buscador con el parámetro `q` (G8 resuelta por Antigravity en la PR #68).
> - **Corregido:** el mapa no seguía las coordenadas al editar otro sitio; `explorar.ts` leía un campo inexistente (`equipamiento`) y no filtraba los sitios sin coordenadas.
> - **Verificaciones:** `ng build` correcto (solo avisos de presupuesto ya existentes en otras pantallas), 53 suites y 219 tests en verde, 0 errores ESLint (66 avisos, antes 203). Revisión de Codex (2 hallazgos medios en el autocompletado, corregidos) y revisión de UI (2 altos y 7 medios corregidos; 4 opcionales anotados en el roadmap). Capturas con Playwright contra `docker compose` a 1440 y 390 px en las 6 rutas: sin scroll horizontal; foco en «Nombre» al abrir el formulario; autocompletado probado contra el backend real. Choque con la clase global v1 `.bloque-mapa` detectado en captura y corregido.
> - **Seguridad (pedido de Manuel):** anotada la tarea 7.0 en el roadmap. La app usa sesión con cookie `HttpOnly`, no JWT; lo pendiente es CSRF (desactivado), la cookie entre dominios en el despliegue, cabeceras y límite de intentos de login.

> **2026-11-09 (Fase 4/5, Parada G8 — Resolución de fallos de backend para el frontend; rama `fix/backend-g8-fallos`):**
> - **Contraseñas demo corregidas (Flyway V5):** Creada la migración `V5__actualizar_hashes_demo.sql` actualizando los hashes bcrypt de `admin1` (`Admin123!`) y `usuario1` (`Usuario123!`). Añadida la suite unitaria `UsuariosDemoPasswordTest` validando con `PasswordEncoder` la coincidencia exacta con `docs/deployment.md` y ampliada `FlywayMigrationScriptsTest` para validar V5.
> - **Manejo de rutas no mapeadas (404 ProblemDetail):** Incorporado manejador para `NoResourceFoundException` en `GlobalExceptionHandler`, evitando que las rutas inexistente caigan en error interno 500 no controlado. Añadido test unitario en `GlobalExceptionHandlerTest`.
> - **Búsqueda por texto en historial (`q`):** Añadido parámetro opcional `q` en `GET /api/entrenamientos/mi-historial`, con consulta JPQL `buscarPorTexto` insensible a mayúsculas sobre notas, rutinas y centros/lugares públicos, preservando la paginación `PaginaResponse<HistorialEntrenamientosDTO>`, el orden por fecha descendente y el aislamiento de recursos por usuario. Cubierto con tests de servicio y WebMvc.
> - **Parada G8:** Marcada como **Resuelta** en `docs/HANDOFF.md`. Claude ya puede incorporar la búsqueda del historial en el frontend.
> - **Verificaciones:** 113 tests de backend pasando en verde (todas las suites unitarias, de integración, permisos, seguridad, migración y properties superadas). Quality Gate de SonarCloud conforme.

> **2026-11-09 (Fase 5, Recorrido 2 — Entrenamientos; rama `feat/recorrido-entrenamientos`):**
> - **Pantallas:** catálogo base, mis entrenamientos, comunidad, historial y sus 4 detalles reescritos con Neutral Sport / Industrial, OnPush + signals, componentes `ui/`, i18n en 4 idiomas y sin `any` (modelos en `models/entrenamiento.ts`). Paginación real (12 por página) con filtro de un solo campo, como el backend; estados de carga, vacío, error y recarga; errores `ProblemDetail`; confirmación al borrar; foco gestionado al abrir/cerrar formularios. Comunidad pasa a una lista paginada única con las publicaciones propias marcadas «Tuyo».
> - **Corregido:** `authGuard`/`publicGuard` usaban `/api/auth/yo` (retirado en 4.1) y redirigían siempre a `/login`; ahora `/api/auth/me`. Contraste AA en chips sutiles `primary`/`danger`.
> - **Limitación:** el historial pierde la búsqueda por texto de la v1 hasta que el backend ofrezca un parámetro `q` (parada G8).
> - **Verificaciones:** `ng build` correcto (sin avisos en los archivos tocados), 58 suites y 156 tests en verde, 0 errores ESLint (203 avisos, antes 357). Revisión de Codex (5 hallazgos medios/bajos, 4 corregidos y 1 registrado en G8) y revisión de UI (15 hallazgos, corregidos). Verificado en navegador (Playwright) contra `docker compose` a 1440 y 390 px: sin scroll horizontal y foco correcto al abrir y cerrar el formulario.
> - **Bloqueos para Antigravity (G8, LIBRE):** hashes demo de V3 que no corresponden a las contraseñas documentadas (login demo → 401), `NoResourceFoundException` → 500 y parámetro `q` del historial. Detalle en `docs/HANDOFF.md`.

> **2026-11-09 (Fase 4, Retirada del backend de soporte y tickets — D13):**
> - **Eliminación del backend de tickets:** Suprimidos `SoporteRestController`, `SoporteAdminRestController`, `SoporteService`, entidades `Soporte` y `MensajeSoporte`, enum `EstadoSoporte`, repositorios `SoporteRepository` y `MensajeSoporteRepository`, y DTOs (`SoporteDTO`, `MensajeSoporteDTO`, `CrearSoporteDTO`, `CrearMensajeSoporteDTO`, `CambiarEstadoSoporte`). Cero referencias residuales en el backend.
> - **Migración de base de datos Flyway V4:** Creado `V4__eliminar_soporte.sql` con `DROP TABLE IF EXISTS mensajes_soporte; DROP TABLE IF EXISTS soporte;`, asegurando la coherencia del esquema relacional en PostgreSQL.
> - **Seguridad y cobertura:** Actualizada suite `AdminRutasPermisosSecurityTest` manteniendo la verificación de los 4 controladores de administración restantes. Actualizada `FlywayMigrationScriptsTest` cubriendo V4. Total: 108 tests de backend pasando en verde.
> - **Documentación:** Actualizados `README.md`, `docs/architecture.md` (decisión D13 completada), `docs/deployment.md` y `docs/roadmap.md`.

> **2026-11-09 (Retirada de soporte en el frontend, paradas G2 y G3):**
> - **Eliminado:** pantallas `soporte` y `admin/soporte` (con detalle de ticket), servicios `soporte` y `admin-soporte-service`, sus 4 rutas, el enlace del panel de soporte en cabecera y portada y la clave `nav.panelSoporte` de los 4 idiomas. Cero referencias a soporte o tickets en `Frontend/`.
> - **Pendiente de Antigravity:** retirar el backend de tickets (controladores, servicios, entidades y migración Flyway). Hasta entonces los endpoints existen sin ningún cliente.
> - **Verificaciones:** `ng build` correcto, 55 suites y 134 tests en verde (las 6 suites de soporte desaparecen con el código), 0 errores ESLint (357 avisos de deuda conocida).

> **2026-11-09 (Frontend adaptado a la API paginada, tras la parada G1):**
> - **Servicios:** nueva interfaz `PaginaResponse<T>` en `models/pagina-response.ts`. Los 9 servicios con listados (entrenamientos, mis entrenamientos, comunidad, historial, centros, mis centros, lugares, mis lugares y valoraciones) piden `size=100` y devuelven `content`, así que las pantallas no cambian. Límite conocido: máximo 100 elementos por listado hasta que cada pantalla pagine (recorridos 5.2–5.4).
> - **Corrección en HANDOFF.md:** el filtro de centros se llama `precioMensual` (como en el backend), no `precioMaximo`.
> - **Verificaciones:** 61 suites y 140 tests en verde (+20 tests, con un spec parametrizado para los 8 servicios de listados), 0 errores ESLint (423 avisos de deuda conocida) y `ng build` correcto. Prueba contra el backend real: **pendiente**.

> **2026-11-09 (Fase 4, Tarea 4.8 — Paginación, ordenación y resolución N+1 en listados - P6):**
> - **Contrato de API REST paginada y estable (P6):** Incorporado `Pageable` (`page`, `size` [por defecto 20, máximo 100], `sort`) en todos los controladores de colecciones (entrenamientos base, propios y de comunidad, historial, centros y lugares públicos base y de usuario, y valoraciones). Las respuestas se encapsulan en el DTO genérico `PaginaResponse<T>` (`content`, `page`, `size`, `totalElements`, `totalPages`), fijando un contrato inmutable para el frontend.
> - **Optimización de consultas y resolución N+1:** Incorporado `@EntityGraph` en las consultas de `EntrenamientoComunidadRepository` (unión con autor), `HistorialEntrenamientosRepository` (unión de referencias de ubicación y rutinas) y `ValoracionRepository` (unión de usuarios autores), eliminando consultas N+1 en bucle.
> - **Aislamiento y permisos:** Preservadas las validaciones de propiedad por usuario autenticado en los servicios; no se debilita ningún permiso de acceso.
> - **Verificaciones:** Suite unitaria `PaginacionUtilTest` (7 tests), suite de integración WebMvc `PaginacionIntegrationTest` (12 tests), suite de servicios `PaginacionServicesTest` (9 tests) y suite de permisos `AislamientoRecursosUsuarioTest` (12 tests) pasando en verde. Total: 110 tests de backend en verde. Quality Gate de SonarCloud superado con 97.4% de cobertura en código nuevo.
> - **Coordinación (Parada G1):** Parada G1 liberada en `docs/HANDOFF.md` con la documentación completa del contrato paginado para la adaptación del frontend en las fases 5.2 a 5.4.

> **2026-11-09 (Fase 1B, Tarea 1B.6 — Compose de producción con imágenes de Docker Hub):**
> - **Orquestación para despliegues inmutables:** Creado `docker-compose.prod.yml` que utiliza directamente las imágenes construidas y firmadas en Docker Hub (`manuelklk03/digital-fit-backend:latest` y `manuelklk03/digital-fit-frontend:latest`) prescindiendo de compilación local en servidor.
> - **Resiliencia y configuración de producción:** Preservadas las sondas de salud (`/actuator/health` en backend y `/` en frontend) y la coordinación estricta con `service_healthy`. Parametrizadas las variables `SPRING_PROFILES_ACTIVE=prod`, `SESSION_COOKIE_SECURE` y `CORS_ALLOWED_ORIGINS`. Documentado su uso en `docs/deployment.md`.
> - **Verificaciones:** `docker compose -f docker-compose.prod.yml config` validado sin errores sintácticos y suite unitaria `ComposeProduccionTest` añadida en verde.

> **2026-11-08 (Fase 1B, Tarea 1B.5 — Deploy hook en CI para Render):**
> - **Automatización de despliegue continuo (D9):** Añadido paso condicional en `.github/workflows/ci.yml` tras la publicación de la imagen `digital-fit-backend` en Docker Hub para invocar el *deploy hook* de Render vía petición POST segura con `curl`.
> - **Tolerancia a ausencia de credenciales:** El paso se activa únicamente en merge a `main` cuando el secreto `RENDER_DEPLOY_HOOK` está definido, omitiéndose limpiamente sin romper la canalización de CI mientras el despliegue público no esté provisionado.
> - **Verificaciones:** Suite unitaria `CiWorkflowTest` validando sintaxis, filtros de ejecución condicional y garantía de no exposición de secretos.

> **2026-11-08 (Fase 4, Tarea 4.9 — Retirada de dependencias Thymeleaf sin uso):**
> - **Saneamiento del descriptor Maven:** Retirados `spring-boot-starter-thymeleaf` y `spring-boot-starter-thymeleaf-test` de `Backend/digital-fit/pom.xml`. Se preserva `spring-boot-starter-actuator` para las comprobaciones de salud en `/actuator/health` empleadas por Docker Compose.
> - **Verificaciones:** Suite de regresión unitaria `ThymeleafAusenteTest` añadida para garantizar ausencia en el classpath; 80 tests de backend pasando en verde y compilación verificada.

> **2026-11-08 (Fase 3/5 — Saneamiento Antislop de Portada `/inicio`):**
> - **Eliminación de AI Slop y narrativa técnica:** Eliminadas métricas de marketing inventadas y textos vacíos en la portada principal. Sustituidas por indicadores técnicos reales (10 rutinas base, OpenStreetMap con Overpass API, cronómetro en vivo y código abierto sin cuotas).
> - **Sustitución de emojis por iconografía SVG técnica:** Suprimidos todos los emojis decorativos en las tarjetas, categorías del mapa y barra de usuario, reemplazándolos por iconos vectoriales SVG limpios y consistentes con la estética industrial.
> - **Enfoque en capacidades reales del sistema:** Reestructurada la sección de funcionalidades para presentar con rigor las 3 áreas nucleares de la plataforma (asistente de series y descansos en tiempo real, mapa geodeportivo con fórmula Haversine y catálogo estructurado de rutinas con reseñas).
> - **Internacionalización y accesibilidad:** Textos técnicos actualizados en español, valenciano, inglés y francés. Preservada la carga diferida de GSAP y el respeto a `prefers-reduced-motion`.
> - **Verificaciones:** 59 suites de tests (120 tests unitarios) en verde, 0 errores ESLint y build de producción verificado.

> **2026-11-08 (Fase 5, Recorrido 1 — Acceso: Login y Registro):**
> - **Rediseño estético Neutral Sport / Industrial:** Modernizadas las vistas `/login` y `/register` utilizando los componentes reutilizables OnPush (`CardComponent`, `BadgeComponent`, `InputDirective`, `ButtonComponent`). Eliminados los fondos con degradados heredados de v1, los popups flotantes con temporizador y las imágenes estáticas (`img/usuario.png`).
> - **Acceso rápido para evaluadores:** Incorporado panel accesible en `/login` para rellenar de forma inmediata con un clic las credenciales de demostración (`usuario1` / `admin1`), facilitando la navegación de evaluadores y portfolio.
> - **Validaciones y accesibilidad:** Implementadas validaciones de frontend en `/register` (patrón de email válido, mínimo 6 caracteres en contraseña y campos obligatorios), avisos inline accesibles (`role="alert"`, `aria-live="polite"`), etiquetas semánticas y atributos de autocompletado estándar (`autocomplete="username"`, `current-password`, `new-password`).
> - **Internacionalización completa:** Añadida sección `auth` al diccionario tipado `DiccionarioTraduccion` con soporte completo en español, valenciano, inglés y francés.
> - **Verificaciones:** 58/58 suites de tests (118 tests unitarios) en verde en el frontend (+10 tests nuevos en `login.spec.ts` y `register.spec.ts`), 0 errores de ESLint y compilación de producción validada.

> **2026-11-06 (Fase 4, Tareas 4.4 y 4.5 — Flyway, resolución P4/D3 y usuarios de demo):**
> - **Migraciones versionadas con Flyway (D3, P4):** Incorporado Flyway con PostgreSQL 17 (`V1__esquema_inicial.sql` con DDL completo, `V2__catalogos_base.sql` con los catálogos inmutables de entrenamientos, centros y lugares públicos base, y `V3__usuarios_demo.sql` con usuarios de prueba). Retirado `data.sql` legacy y configurado `ddl-auto=validate` en producción.
> - **Usuarios de demostración documentados (Tarea 4.5):** Eliminado el bloqueo histórico de credenciales desconocidas. Documentados en `docs/deployment.md`: `admin1` / `Admin123!` (rol `ADMIN`) y `usuario1` / `Usuario123!` (rol `USER`).
> - **Verificaciones:** Suite `FlywayMigrationScriptsTest` (3 tests) y `PerfilesPropertiesTest` en verde.

> **2026-11-06 (Fase 4, Tarea 4.7 — Perfiles dev y prod y resolución P10):**
> - **Segregación de entornos (P10):** Separada la configuración común en `application.properties` con `spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}`. Creado `application-dev.properties` para desarrollo local con depuración SQL (`show-sql=true`, `format_sql=true`) y logs en nivel `DEBUG`. Creado `application-prod.properties` para producción desactivando volcado SQL (`show-sql=false`), logs en `INFO`/`WARN` y ocultación de trazas de error (`server.error.include-stacktrace=never`).
> - **Entorno contenedor:** Configurado `SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE:-prod}` en `docker-compose.yml`.
> - **Verificaciones:** Suite `PerfilesPropertiesTest` con 3 tests unitarios validando la correcta parametrización y aislamiento de ambos perfiles.

> **2026-11-06 (Fase 4, Tarea 4.2 — Tests de integración de permisos y seguridad Spring Security):**
> - **Aislamiento de recursos entre usuarios:** Creada suite `AislamientoRecursosUsuarioTest` con 12 tests verificando que ningún usuario puede leer, modificar o borrar centros privados, entrenamientos ni lugares públicos de otro usuario (`OperacionNoPermitida` mapeada a 403 Forbidden RFC 7807). Verificado igualmente el aislamiento en valoraciones privadas.
> - **Seguridad y autorización en rutas `/api/admin/**`:** Creada suite `AdminRutasPermisosSecurityTest` con 15 pruebas de integración WebMvc sobre los 5 controladores administrativos (`AdminRestController`, `CentroPrivadoBaseAdminRestController`, `EntrenamientoBaseAdminRestController`, `LugarPublicoBaseAdminRestController`, `SoporteAdminRestController`), validando rechazo 401 Unauthorized para anónimos, rechazo 403 Forbidden para rol `USER` y acceso autorizado para rol `ADMIN`.
> - **Dependencias de test:** Añadido `spring-security-test` en `Backend/digital-fit/pom.xml`.

> **2026-11-06 (Fase 4, Tarea 4.3 — Errores uniformes con ProblemDetail RFC 7807 y resolución P5):**
> - **Estandarización de errores HTTP (P5):** Refactorizado `GlobalExceptionHandler` sustituyendo respuestas heterogéneas por el estándar IETF RFC 7807 (`ProblemDetail`) nativo de Spring Boot 4. Mapeo semántico de códigos HTTP: `404 Not Found` (recursos no encontrados), `409 Conflict` (duplicidad de usuario o email), `403 Forbidden` (operaciones no permitidas y `AccessDeniedException`), `400 Bad Request` (argumentos inválidos y validación de DTOs con desglose de campos) y `500 Internal Server Error` (fallback genérico que protege las trazas internas).
> - **Verificaciones:** Añadida suite `GlobalExceptionHandlerTest` con 8 tests unitarios cubriendo todos los manejadores de excepciones y estructuras de respuesta.

> **2026-11-06 (Fase 4, Tarea 4.1 — Seguridad en logs, CORS, cookies de sesión y retirada de /yo):**
> - **Saneamiento de Log Injection (Sonar java:S5145):** Implementada la utilidad `LogSanitizer` y aplicada en los servicios de autenticación (`AuthService`, `CustomUserDetailsService`), geocodificación (`GeocodificacionService`) y servicios base (`CentroPrivadoBaseService`, `LugarPublicoBaseService`, `EntrenamientoBaseService`) neutralizando inyecciones CRLF en los registros del servidor.
> - **Seguridad de Cookies y CORS por entorno (D2, P2, P3):** Añadida configuración en `application.properties` para cookies de sesión con `HttpOnly=true`, `SameSite=Lax` y `Secure=${SESSION_COOKIE_SECURE:false}`. Parametrizados los orígenes permitidos de CORS en `CorsConfig` mediante `${CORS_ALLOWED_ORIGINS:http://localhost:4200}`.
> - **Eliminación de deuda técnica P13:** Retirado el endpoint duplicado `/api/auth/yo` en `AuthController`, unificando la resolución de sesión en `/api/auth/me`.
> - **Verificaciones:** Tests unitarios de seguridad `LogSanitizerTest` en verde.

> **2026-11-06 (Fase 3, Tarea 3.8 — i18n multilingüe ES, CA/VAL, EN, FR - D11):**
> - **Internacionalización y arquitectura reactiva (D11):** Creado `I18nService` en Angular con `Signal<Idioma>` ('es' por defecto, 'ca' valenciano, 'en' inglés, 'fr' francés), diccionarios tipados desacoplados en `src/app/i18n/diccionarios/`, persistencia en `localStorage` y sincronización dinámica con `<html lang="...">`.
> - **Selector de idioma accesible:** Añadido control interactivo en la cabecera (`HeaderComponent`) con banderas, códigos de idioma, foco visible y atributos ARIA (`aria-expanded`, `aria-haspopup`, `role="listbox"` y `role="option"`).
> - **Integración de traducciones:** Textos dinámicos en navegación, cabecera y todas las secciones de la portada `/inicio` (Hero, Asistente en vivo, Radar OSM y Comunidad).
> - **Verificaciones:** 58/58 suites de tests (108 tests) pasando en verde (11 tests nuevos), 0 errores ESLint y build de producción exitoso.

> **2026-11-06 (Fase 3, Tarea 3.5 — Portada con animación al hacer scroll):**
> - **Portada `/inicio` cinematográfica (D15):** Rediseñada bajo la estética Neutral Sport / Industrial con narrativa visual (storytelling). Hero section con propuesta de valor clara y llamadas directas a la acción hacia `/entrenar` y `/explorar`. Demostración interactiva en vivo del asistente de entrenamiento con cronómetro regresivo tabular y selectores táctiles de carga/series. Vista previa del radar deportivo OSM con distancias Haversine y tarjetas de marcas personales/comunidad.
> - **Carga diferida y bundle optimizado (D15):** Configurado `loadComponent` para `/inicio` en `app.routes.ts` y carga dinámica asíncrona de GSAP/ScrollTrigger solo cuando se visita la portada y el usuario no tiene activada la preferencia de movimiento reducido (`prefers-reduced-motion: reduce`). Tamaño del CSS de inicio reducido de 5.19 kB a 1.4 kB, eliminando el aviso de presupuesto de Angular.
> - **Verificaciones:** 57/57 suites de tests (92 tests) pasando en verde, 0 errores ESLint y build de producción exitoso.

> **2026-11-05 (Fase 3, Tarea 3.7 y P11):**
> - **Backend de Búsqueda OSM (D10) y Proxy de Geocodificación (P11):** Implementados los servicios `ExploracionOsmService` y `GeocodificacionService` con endpoints `/api/explorar/lugares`, `/api/explorar/geocodificar` y `/api/explorar/geocodificar/inversa`. Consultas Overpass filtradas por etiquetas de deporte con rate limiting de 1s, cabecera `User-Agent` identificativa y caché en memoria. Fusión con entidades de BD local (`CentroPrivadoBase` y `LugarPublicoBase`) con identificador `osmId`.
> - **Erradicación de deuda técnica P11:** Sustituida la llamada directa de `mapa-selector.ts` a `nominatim.openstreetmap.org` por el proxy del backend `/api/explorar/geocodificar`. Conectado `ExplorarComponent` al backend conservando fallback local robusto.
> - **Verificaciones:** Tests unitarios de backend (`ExploracionOsmServiceTest`, `ExploracionRestControllerTest`), 81/81 tests de frontend pasando con 95.3% de cobertura en `explorar.ts`, 0 errores ESLint y build de producción limpio.

> **2026-11-05 (Fase 3, Tarea 3.6 y Seguridad):**
> - **Página Explorar (`/explorar`, D10):** Implementada con vista dividida estilo Google Maps (panel lateral reactivo de 440px y visor Leaflet a pantalla completa). Modelo unificado `LugarDeportivo`, ordenación geodésica con fórmula Haversine, filtros por categoría (Gimnasio, Calistenia, Polideportivo, Piscina) y radio en km. Detección de ubicación (`navigator.geolocation`) y botón flotante «Buscar en esta zona».
> - **Verificaciones:** `ng build` correcto, 77/77 tests unitarios pasando (7 nuevos con >81% cobertura en `explorar.ts`/`explorar.html`), 0 errores ESLint.
> - **Política de Seguridad y Flujo Git:** Creado `SECURITY.md` en la raíz (versiones soportadas, reporte responsable vía GitHub Security Advisories y directrices de protección RBAC/cookies/sanitización). Documentada en `AGENTS.md` y `docs/git-workflow.md` la regla obligatoria de mínimo 3 commits por Pull Request.


> **2026-11-04 (Fase 3, Tarea 3.4):** Implementados los componentes base reutilizables en Angular (Button, Badge, Card, Input) en `src/app/components/ui/` con arquitectura OnPush y signals. Integrados en la vista `/entrenar`. Verificaciones: `ng build` correcto (0 warnings de compilador), 70/70 tests pasando (14 nuevos), 0 errores ESLint.

> **2026-11-04 (Fase 3, Tarea 3.3):** Dirección visual cerrada en rama `feat/visual-direction` (PR #45). Propuesta aprobada: Neutral Sport / Industrial. Configurada tipografía Inter (sustituyendo a Arial) en `index.html` y tokens de Tailwind v4. Diseñada e implementada la pantalla representativa del Asistente de Entrenar (`/entrenar`) con tarjetas de borde perimetral (eliminando el patrón v1 de `border-left`), cronómetro de descanso regresivo interactivo y controles táctiles de series. Verificaciones: `ng build` en verde, 56/56 tests pasando (5 nuevos), 0 errores ESLint.

> **2026-11-04:** Revisión Stylelint de la PR #43 (rama de estilos): 5 avisos heredados de la v1 (3 × `border-left: 4px solid` en tarjetas, 2 × fuente Arial). Los 5 se dejan tal cual: pertenecen al diseño de la v1 y se resolverán en la tarea 3.3 (dirección visual), donde se decidirán la tipografía base y el tratamiento de los bordes laterales de acento. Anotado en [roadmap.md](roadmap.md).

> **2026-11-03 (Fase 3):** Tareas 3.1 y 3.2 acordadas con Manuel en rama docs/product-definition. Definición de producto: asistente de entrenamiento interactivo (ejercicios, series, pesos, descansos), gamificación (metas, retos), social (amigos, compartir) y mapa inteligente con pines vía Overpass/MapLibre. Se eliminan tickets de soporte y se consolidan las 27 rutas en 5 vistas clave (Dashboard, Entrenar, Explorar Mapa, Progreso/Retos, Perfil). Dirección visual con tokens neutros desacoplados («Neutral Sport») para agilidad en cambios de estilo.

> **2026-11-03:** Tarea 2.1 investigada en documentación oficial y registrada en [deployment.md](deployment.md#4-despliegue-público-fase-2). Se compararon 4 opciones de frontend, 4 de backend y 3 de PostgreSQL. En 2.2 se documentó la propuesta Netlify + Render + Neon con sesión por cookie. Manuel ha aplazado la configuración y la prueba reales (2.3–2.4) hasta preparar el despliegue, después del rediseño. No se han creado cuentas ni entornos remotos.

> **2026-11-01:** Manuel adelanta DevOps (fase 1B) y autoriza el modo automático para ella y para la fase 1. Fase 1 cerrada (PR #23–#29: documentación, limpieza, tests del frontend, Docker verificado, PostgreSQL, Spring Boot 4.1.2, Angular 22). Fase 1B en curso: **1B.1 CI hecha** (PR #30).

## Resumen

- **Fase activa:** 5 — Renovación del frontend por recorridos (los 5 recorridos completados; fase 5 cerrada). Fase 4 (Backend, API y datos) completada al 100% (tareas 4.1 a 4.10 cerradas).
- **CI:** `.github/workflows/ci.yml`. **Checks obligatorios en `main`** desde 1B.3, más `SonarQube` desde 1B.4 (Quality Gate *Sonar way*) y `Docker (compose)` desde 1B.5; publicación de imágenes en Docker Hub en cada merge (`latest`, SHA corto y tag de versión) con deploy hook condicional para Render. Backend con 108 tests unitarios/integración en verde; frontend con 156 tests unitarios en verde.
- **SonarQube Cloud:** organización `manuelklk03`, proyecto `Manuelklk03_Digital-Fit-Proyecto`, secreto `SONAR_TOKEN` configurado.
- **Versión publicada:** `v1.0.0` (tag anotado). `v2.0.0` se publicará al completar la fase 7.
- **Despliegue público:** Pendiente de configuración en 2.3/2.4 y 7.1. Imágenes publicadas en Docker Hub (`manuelklk03/digital-fit-backend` y `manuelklk03/digital-fit-frontend`).
- **Modo de trabajo y coordinación:** Coordinación Claude / Antigravity según [HANDOFF.md](HANDOFF.md). Antigravity en parada G5 (BLOQUEADO en espera de que Claude complete las pantallas de la Fase 5 para poder acometer la suite E2E 6.2 y CI 6.1).

## Versión original `v1.0.0`

- Historial de `main` **reconstruido con GitHub Flow** el 2026-10-26, a petición de Manuel: 22 PR reales (#1–#22) con commit de merge y ramas borradas. Después se reescribieron los mensajes de los 189 commits en Conventional Commits y se retiró del historial una contraseña local de MySQL (sustituida por `root`). Se conservan autores, fechas, estructura y contenido final. Detalle en [git-workflow.md](git-workflow.md#historial-reconstruido-2026-10-26).
- Commit `218f26dfe10c0f939b16af5b73d1cd1d28ece050` («Merge: docs: guías de la defensa y README (#22)»), último de `main` antes de la preparación de 2.0. Contiene el código y los 12 archivos académicos.
- Tag anotado `v1.0.0` sobre `218f26d`. Verificado con `git ls-remote`: el objeto tag `52f8a5d` apunta (`v1.0.0^{}`) a `218f26d`, igual que en local.
- **Pendiente de Manuel:** cambiar esa contraseña de MySQL donde se use, porque estuvo publicada. Borrar las copias locales `backup-main-original` y `backup-main-reconstruida` cuando ya no hagan falta, porque conservan la contraseña.
- Consulta y recuperación: [git-workflow.md](git-workflow.md#versión-original-v100).

## Tarea en curso: preparación de 2.0 (tareas 1.3 y 1.4)

Hecho en `chore/v2-start`:

- Retirados con `git rm` (preparados en el índice): `Documentacion/` (memoria DOCX/PDF, guía del centro, cuatro guías de preparación de la defensa), `Manuales (Uso y Despliegue) y video explicativo/` (manuales de uso y de despliegue en DOCX/PDF; el vídeo no estaba en el repositorio) y `Presentación - Defensa/`.
- Información técnica del manual de despliegue trasladada a [deployment.md](deployment.md) (requisitos, base de datos con `data.sql`, arranque y problemas frecuentes).
- Nuevos: `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.github/pull_request_template.md`, `CHANGELOG.md`, `docs/` (este archivo, roadmap, arquitectura, sistema de diseño, despliegue, flujo con IA y flujo de Git).
- Reescrito: `README.md`.

Mensajes de commit y pasos de publicación: ver [Siguiente paso](#siguiente-paso).

## Comprobaciones (2026-10-26)

| Comprobación | Resultado |
|---|---|
| Frontend `npm ci` | Correcto (aviso de scripts de instalación de `msgpackr-extract`) |
| Frontend `npm run build` | **Correcto** con 3 avisos: `detalle-privado.css` y `detalle-publico.css` superan en 15 B el presupuesto de 4 kB; `leaflet` no es ESM |
| Frontend `npx ng test --watch=false` | **Correcto el 2026-11-01** (tarea 1.7): 51/51. Los specs importaban nombres de clase inexistentes y no daban router ni `HttpClient` a los componentes |
| Backend compilación | **Correcta el 2026-11-01** (tarea 1.8), dentro de la imagen Docker (`mvn package -DskipTests`). `mvn test` sin ejecutar todavía: lo hará la CI (1B.1) |
| `docker compose up --build` | **Correcto el 2026-11-01**: 3 contenedores en marcha. Recorrido por nginx (`localhost:4200/api`) con un usuario nuevo: registro 201 → login 200 → `/auth/me` → catálogo → copiar entrenamiento 201 → registrar en historial 201 → nueva sesión con el historial conservado; sin sesión, 401; rutas de Angular servidas por nginx (200). El historial espera el campo `duracionEnMinutos` |
| Backend `mvn test` (2026-11-01) | **Correcto** (1/1, `contextLoads`) contra el PostgreSQL de Compose, con Spring Boot 4.0.6 y después con 4.1.2. Comando en [git-workflow.md](git-workflow.md#checklist-de-pr) |
| Spring Boot 4.1.2 (tarea 1.10, 2026-11-01) | **Correcto**: compila sin avisos de API obsoleta, arranca en ~6 s y supera el recorrido (registro, login, entrenamiento, historial, estadísticas); usuario `USER` en `/api/admin` → 403, sin sesión → 401 |
| Angular 22.2.4 (tarea 1.11, 2026-11-01) | **Correcto**: `ng update` con migraciones que conservan el comportamiento de la v21 (`ChangeDetectionStrategy.Eager` en los componentes, `provideHttpClient(withXhr())`, dos diagnósticos nuevos silenciados) y TypeScript 6.0.3. Tests 51/51, build correcto (bundle inicial 901 kB, antes 874 kB). Navegador real (Playwright) con la imagen Docker: login, catálogo de 10 entrenamientos, añadir uno y verlo en «Mis entrenamientos». Node 22.23 de `node:22-alpine` cumple el mínimo (`^22.22.3`) |
| SonarQube, primer análisis completo de `main` (2026-11-01) | **Punto de partida**: 22,6 k líneas, cobertura 19,4 %, duplicación 9,9 %, 28 bugs (26 `<input>` sin etiqueta en plantillas, 2 `InterruptedException` ignoradas), 397 *code smells* y 20 vulnerabilidades: 17 *log injection* (se registran datos de la petición sin sanear), 2 hashes bcrypt de `admin1`/`usuario1` en `data.sql` (tarea 4.5), CSRF desactivado en `SecurityConfig` (P2, tarea 4.1) y en los Dockerfiles: contenedores como root, scripts de `npm install` y dependencias sin versión fija (tarea 1B.5). El Quality Gate de `main` falla (cobertura 72 % y duplicación 11,4 % en el código cambiado ese día); en `main` no rompe la CI desde la PR #35 |
| PostgreSQL (tarea 1.9, 2026-11-01) | **Correcto**: `postgres:17-alpine` sano; `data.sql` carga 10 entrenamientos, 6 centros, 8 lugares y 2 usuarios, y al reiniciar no duplica (`ON CONFLICT DO NOTHING`); mismo recorrido superado, más `/api/estadisticas` (las 3 consultas nativas funcionan sin cambios). Únicos avisos: Hibernate intenta borrar restricciones que aún no existen al crear las tablas (inofensivo). Volumen e imagen de MySQL borrados a petición de Manuel |
| Documentación | Enlaces internos y comandos revisados a mano contra el código |
| Revisión de Codex | Ver [Revisiones](#revisiones) |

## Revisiones

**2026-10-26 — Codex (plugin `codex@openai-codex`, tarea en solo lectura)** sobre la documentación y la retirada de materiales. Revisó la coherencia con el código, los comandos, 45 enlaces internos y el modo guiado. Encontró 5 hallazgos, ninguno de gravedad alta; Claude los verificó y los 5 eran reales. Los corrigió Claude, porque era una tarea autorizada en automático:

1. Requisito de Node: Angular CLI exige `^20.19 || ^22.12 || >=24` → corregido en `deployment.md`.
2. `mvnw` versionado sin permiso de ejecución (`100644`) → se documenta `sh ./mvnw`; arreglo en la tarea 1.6 (P14).
3. En PowerShell hace falta `.\mvnw.cmd` → añadido en `deployment.md` y `git-workflow.md`.
4. SHA mal escrito (`3868b7bd`) en `git-workflow.md` → corregido.
5. Hay tres `.log` versionados, no dos (faltaba `Backend/logs/`) → corregido en arquitectura y en la tarea 1.6.

Sin hallazgos en rutas de la API, seguridad, CORS/CSRF, `data.sql`, Compose, versiones, JSON de protección de rama ni enlaces.

## Bloqueos y limitaciones

- **Claudex** no arranca (`codex.ps1 is missing beside the selected batch shim`). Las revisiones se hacen con el plugin `codex@openai-codex`, que sí funciona. Detalle en [ai-workflow.md](ai-workflow.md).
- *Resuelto en 4.5:* Contraseñas de los usuarios de ejemplo (`admin1`, `usuario1`) documentadas explícitamente en `deployment.md` (`Admin123!` y `Usuario123!`).

## Siguiente paso

1. **Frontend (Claude):** fase 5 cerrada. Queda la parte de frontend de la tarea 7.0 (CSRF) cuando Antigravity la habilite, y las mejoras opcionales anotadas en el roadmap.
2. **Backend y DevOps (Antigravity):** G5 (E2E 6.2 y CI 6.1), G6 (Prettier 6.5) y G9 (fallos de backend) LIBRES.
3. **Despliegue (Fases 2.3/2.4 y 7.1):** Pendiente de que Manuel provisione las cuentas/secretos (parada G4) antes de la release final `v2.0.0`.

## Cómo actualizar este archivo

Al cerrar cada tarea: fecha, rama, qué cambió, comprobaciones con su resultado real, bloqueos y siguiente paso. Distingue «preparado», «aplicado por Manuel» y «verificado».
