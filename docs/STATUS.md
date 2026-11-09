# Estado actual — Digital-Fit

Última actualización: **2026-11-09**.

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

- **Fase activa:** 5 — Renovación del frontend por recorridos (Recorrido 1 completado en PR #49; Recorrido 2: Entrenamientos en curso por Claude). Fase 4 (Backend, API y datos) completada al 100% (tareas 4.1 a 4.10 cerradas).
- **CI:** `.github/workflows/ci.yml`. **Checks obligatorios en `main`** desde 1B.3, más `SonarQube` desde 1B.4 (Quality Gate *Sonar way*) y `Docker (compose)` desde 1B.5; publicación de imágenes en Docker Hub en cada merge (`latest`, SHA corto y tag de versión) con deploy hook condicional para Render. Backend con 108 tests unitarios/integración en verde; frontend con 134 tests unitarios en verde.
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

1. **Frontend (Claude):** Continuar con la Fase 5 (Recorrido 2: Entrenamientos — catálogo base, mis entrenamientos, comunidad e historial con estética Neutral Sport y paginación `PaginaResponse`).
2. **Backend y DevOps (Antigravity):** En espera por parada G5 hasta que Claude finalice las pantallas de la Fase 5, para implementar las pruebas E2E con Playwright (6.2) y CI (6.1).
3. **Despliegue (Fases 2.3/2.4 y 7.1):** Pendiente de que Manuel provisione las cuentas/secretos (parada G4) antes de la release final `v2.0.0`.

## Cómo actualizar este archivo

Al cerrar cada tarea: fecha, rama, qué cambió, comprobaciones con su resultado real, bloqueos y siguiente paso. Distingue «preparado», «aplicado por Manuel» y «verificado».
