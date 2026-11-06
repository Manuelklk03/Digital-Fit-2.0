# Roadmap de Digital-Fit 2.0

Fases de la renovación. Cada tarea se hace en su propia rama y PR ([git-workflow.md](git-workflow.md)). **[P]** = imprescindible para publicar 2.0; **[+]** = mejora posterior, que no bloquea la versión.

El roadmap no es una orden de implementar nada. Manuel decide cuándo empieza cada paso y, por defecto, lo escribe él con explicación guiada (ver «Modo de trabajo: guiado por defecto» en [AGENTS.md](../AGENTS.md)). La fase activa está en [STATUS.md](STATUS.md).

## Fase 1 — Auditoría, GitHub Flow, `v1.0.0`, limpieza y documentación

Dependencias: ninguna.

| ID | Tarea | Estado |
|---|---|---|
| 1.1 [P] | Auditoría inicial de repositorio, código, herramientas y documentación | Hecha (2026-10-26) |
| 1.2 [P] | Historial de `main` reconstruido con GitHub Flow (PR #1–#22) , mensajes reescritos, contraseña retirada del historial y tag anotado `v1.0.0` sobre `218f26d`, publicado y verificado | Hecha (2026-10-26) |
| 1.3 [P] | Retirar materiales académicos (rama `chore/v2-start`) | Hecha (PR #23, 2026-11-01) |
| 1.4 [P] | Documentación base: AGENTS, CLAUDE, STATUS, roadmap, arquitectura, diseño, despliegue, IA, Git, CHANGELOG, README, plantilla de PR | Hecha (PR #23, 2026-11-01) |
| 1.5 [P] | Configurar GitHub: proteger `main`, borrar ramas al fusionar (ver [git-workflow.md](git-workflow.md#configuración-del-repositorio)) | Hecha (2026-11-01) |
| 1.6 [P] | `chore/repo-hygiene`: `.gitignore` en la raíz, dejar de versionar los tres `.log` (P8), `mvnw` ejecutable (P14), rutas de Compose con `/` (P9) | Hecha (2026-11-01) |
| 1.7 [P] | `test/fix-frontend-specs`: que `ng test` compile y pase (23 errores en 22 specs) | Hecha (2026-11-01): 51/51 tests en verde |
| 1.8 [P] | Comprobar el backend: compilar y arrancar con Docker; ejecutar `docker compose up --build` y el recorrido login → crear entrenamiento → historial | Hecha (2026-11-01) |
| 1.9 [P] | `refactor/postgresql`: migrar de MySQL a PostgreSQL (D4): driver, URL, imagen `postgres` en Compose, `data.sql` con `ON CONFLICT DO NOTHING`, `.env.example` para las credenciales; repetir el recorrido de 1.8 | Hecha (2026-11-01) |
| 1.10 [P] | `chore/upgrade-spring-boot`: Spring Boot 4.0.6 → 4.1.x (última estable; 4.1.2 el 2026-11-01) | Hecha (2026-11-01): 4.1.2 |
| 1.11 [P] | `chore/upgrade-angular`: Angular 21 → 22 con `ng update` (22.2.4 el 2026-11-01); tests y build en verde | Hecha (2026-11-01): 22.2.4, TypeScript 6.0.3 |

Aceptación: `v1.0.0` publicado y verificado; `main` sin materiales académicos; documentación coherente con el código; `ng test` y la compilación del backend en verde y registrados en STATUS.

## Fase 1B — DevOps: CI/CD, Docker y calidad

Dependencias: 1.5–1.11. Adelantada el 2026-11-01 (decisión de Manuel, práctica del bootcamp): con el pipeline montado primero, todas las PR de las fases siguientes pasan por la CI. Tareas en **modo automático**: las hace el agente (rama, commits, PR y merge) y después las explica.

| ID | Tarea |
|---|---|
| 1B.1 [P] | **Hecha (2026-11-01, PR #30).** `ci/github-actions`: workflow `ci.yml` en cada PR y push a `main`: backend `mvn verify` con PostgreSQL como *service container*; frontend `npm ci`, `build` y `test` |
| 1B.2 [P] | **Hecha (2026-11-01).** `ci/eslint`: `angular-eslint` en el frontend, `npm run lint` y job `lint` en la CI. Lo corregible con `--fix` se corrige; las reglas que exigen reescribir (p. ej. `no-explicit-any`, P7) quedan en `warn` hasta la fase 5. En el backend, Sonar (D7) hace de linter |
| 1B.3 [P] | **Hecha (2026-11-01).** Protección de `main` con los checks de CI obligatorios |
| 1B.4 [P] | **Hecha (2026-11-01, opción A: *Sonar way*).** `ci/sonarqube`: cobertura (JaCoCo en backend, vitest en frontend) y análisis en SonarQube Cloud con Quality Gate obligatorio (D7). Organización `manuelklk03`, proyecto `Manuelklk03_Digital-Fit-Proyecto`, secreto `SONAR_TOKEN` (guardado) |
| 1B.5 [P] | **Hecha (2026-11-01), salvo el *deploy hook*, que se añade en la fase 2 al elegir el proveedor del backend.** `ci/docker-publish`: endurecer los Dockerfiles con lo que marca Sonar (usuario sin privilegios, `npm ci --ignore-scripts` si el build lo permite, versiones fijas); en cada merge a `main` y tag `v*`, construir y publicar las imágenes en Docker Hub (`latest`, SHA corto y versión) (D8) y avisar al backend desplegado con su *deploy hook* (D9). Secretos `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` y `RENDER_DEPLOY_HOOK` (o el del proveedor elegido) |
| 1B.6 [+] | Compose de producción que use las imágenes de Docker Hub en lugar de `build:` |
| 1B.7 [P] | **Hecha (2026-11-02).** *Healthcheck* del backend (Actuator `/actuator/health`) en Compose y `depends_on: service_healthy` en el frontend: hoy nginx puede recibir peticiones antes de que Spring arranque y devuelve 502 unos segundos |

Aceptación: una PR de prueba muestra los checks de CI y Sonar en verde; tras el merge, las imágenes aparecen en Docker Hub con sus tags.

## Fase 2 — Viabilidad del despliegue gratuito

Dependencias: 1.8. La investigación y la elección documental (2.1–2.2) se hacen antes del rediseño. La configuración y la prueba en servicios reales (2.3–2.4) se aplazan hasta preparar el despliegue.

| ID | Tarea |
|---|---|
| 2.1 [P] | **Investigación hecha (2026-11-03).** Comparativa de frontend estático (Cloudflare Pages, Netlify, Vercel, GitHub Pages), backend en contenedor (Render, Koyeb, Fly.io, Google Cloud Run) y PostgreSQL gestionado (Neon, Supabase, Render Postgres) en [deployment.md](deployment.md). Proveedor final y prueba real pendientes |
| 2.2 [P] | **Propuesta documental hecha (2026-11-03).** Netlify, Render y Neon; sesión por cookie mediante proxy `/api`. Decisiones D2 y D9 en [architecture.md](architecture.md#4-registro-de-decisiones), pendientes de validar en 2.4 |
| 2.3 [P] | **Aplazada hasta preparar el despliegue.** Configurar `dev`, `staging` y `prod` con bases de datos, variables y secretos separados; preparar CORS y cookies por entorno |
| 2.4 [P] | **Aplazada hasta preparar el despliegue.** Probar en URLs reales registro, login, creación de un recurso propio, cierre de sesión y persistencia al volver a entrar; validar primero en staging |

Aceptación ahora: proveedores y modelo de sesión documentados como propuesta. Antes del despliegue final: configuración 2.3 y recorrido real 2.4 verificados, con límites y costes comprobados. Si no es viable, registrar una decisión alternativa.

## Fase 3 — Producto, navegación y sistema visual

Dependencias: 2.2 documentada; no requiere que 2.3 ni 2.4 estén ejecutadas.

| ID | Tarea |
|---|---|
| 3.1 [P] | Definir producto: asistente de entreno en vivo (series, repeticiones, peso, descansos con cronómetro), gamificación (metas, retos), social (amigos y compartir) y mapa inteligente con pines; retirada de tickets | **Hecha (2026-11-03)** |
| 3.2 [P] | Mapa de navegación y pantallas: consolidar las 27 rutas en 5 vistas clave (Dashboard, Entrenar, Explorar Mapa, Progreso/Retos, Perfil) | **Hecha (2026-11-03)** |
| 3.3 [P] | Dirección visual: Neutral Sport / Industrial aprobada, tipografía Inter y pantalla representativa Asistente de Entrenar (`/entrenar`) implementada ([design-system.md](design-system.md)) | **Hecha (2026-11-04)** |
| 3.4 [P] | Tokens (color, tipografía, espaciado, radios, movimiento) y componentes base en Angular (Button, Badge, Card, Input) en `src/app/components/ui/` | **Hecha (2026-11-04)** |
| 3.5 [+] | Evaluar librerías (GSAP, Lenis, Angular CDK/Spartan…) con los criterios de [design-system.md](design-system.md#dependencias-de-interfaz). **Decidido (D15, 2026-11-04):** portada `/inicio` con animación al hacer scroll (skill `cinematic-scroll-storytelling`), solo cuando 3.3 y 3.4 estén cerradas y con las condiciones de D15. Las skills de Three.js y de vídeo/secuencias por scroll quedan descartadas | **Hecha (2026-11-06)** |
| 3.6 [P] | Página **Explorar** al estilo de Google Maps (D10): buscar dirección con «usar mi ubicación», y ver a la vez gimnasios, centros deportivos, piscinas y zonas de calistenia cercanos en mapa y lista ordenada por distancia; filtros por tipo y radio; «buscar en esta zona» al mover el mapa; ficha detallada de lugar | **Hecha (2026-11-05)** |
| 3.7 [P] | Backend de búsqueda (D10): endpoint por zona que consulta Overpass por etiquetas de OSM (`leisure=fitness_centre`, `sports_centre`, `fitness_station`, `swimming_pool`…), con caché y límite de peticiones; geocodificación por el backend (fin de las llamadas a Nominatim desde el navegador, P11); identificador OSM en los lugares guardados | **Hecha (2026-11-05)** |
| 3.8 [P] | i18n español (por defecto) + valenciano, inglés y francés (D11), con selector accesible y sincronización lang | **Hecha (2026-11-06)** |
| 3.9 [P] | SEO: páginas públicas pregeneradas (`@angular/ssr` en modo estático), `title` y `description` por página, `sitemap.xml`, `robots.txt`, JSON-LD (`ExerciseGym`) y `noindex` en las páginas privadas |

Aceptación: pantalla representativa aprobada, revisada en móvil, escritorio, teclado, contraste y movimiento reducido; antislop sin hallazgos graves.

## Fase 4 — Backend, API y datos

Dependencias: 2.2 (autenticación y base de datos decididas). Puede solaparse con la fase 3.

| ID | Tarea |
|---|---|
| 4.1 [P] | Seguridad: sanear los datos que se registran en los logs (LogSanitizer, Sonar java:S5145); cookies `HttpOnly`/`SameSite`/`Secure` (D2, P2), CORS por entorno (P3) y retirada de `/api/auth/yo` (P13) | **Hecha (2026-11-06)** |
| 4.2 [P] | Tests de integración de permisos: usuario A no lee ni modifica recursos de B; `/api/admin/**` solo ADMIN | **Hecha (2026-11-06)** |
| 4.3 [P] | Errores uniformes con `ProblemDetail` (RFC 7807) (P5) y validación completa de DTOs | **Hecha (2026-11-06)** |
| 4.4 [P] | Flyway con migración inicial y datos de demostración separados; `ddl-auto=validate` en producción (P4, D3) |
| 4.5 [P] | Usuarios de demostración con credenciales documentadas fuera del código (variables o datos de demo) |
| 4.6 [P] | Nominatim y teselas: cumplir políticas de uso (atribución, ≤1 petición/s, caché o proxy en el backend) (P11) | **Hecha (2026-11-05; tarea 3.7)** |
| 4.7 [P] | Logs y SQL de depuración solo en `dev` (P10); eliminar `/api/auth/yo` si nada lo usa (P13) |
| 4.8 [+] | Paginación y ordenación en listados (P6); revisar consultas N+1 y transacciones |
| 4.9 [+] | Retirar dependencias sin uso (Thymeleaf, Actuator si no se usa para `health`) |

Aceptación: tests de backend en verde (con PostgreSQL o Testcontainers), permisos cubiertos, sin secretos en el repositorio.

## Fase 5 — Renovación del frontend por recorridos

Dependencias: 3.4 y los endpoints de la fase 4 que use cada recorrido.

Recorridos, en este orden: **acceso** (login, registro, sesión) → **entrenamientos** (catálogo, mis entrenamientos, comunidad, historial) → **lugares** (centros privados, lugares públicos, mapa) → **progreso** (estadísticas, valoraciones) → **soporte y administración**.

Para cada recorrido [P]: modelos tipados sin `any` (P7), interceptor HTTP común, estados de carga/error/vacío/éxito, accesibilidad, revisión antislop y de UI, tests de lo que tenga lógica.

Además: proxy de desarrollo para `ng serve` (P1) [P], `lang="es"` [P], carga diferida de rutas [+], limpieza de `public/img` (P12) [+].

## Fase 6 — Integración, depuración y pruebas

Dependencias: fases 4 y 5.

| ID | Tarea |
|---|---|
| 6.1 [P] | Añadir a la CI de la fase 1B los tests nuevos (integración, E2E) |
| 6.2 [P] | Pruebas E2E de los recorridos principales (Playwright) |
| 6.3 [P] | Revisión de seguridad y de rendimiento (Lighthouse, tamaño del bundle) |
| 6.4 [P] | Revisión completa con Codex y corrección de hallazgos |
| 6.5 [+] | Formato como check (Prettier); ESLint ya está desde 1B.2 |

## Fase 7 — Publicación y versión estable 2.0

Dependencias: fase 6.

| ID | Tarea |
|---|---|
| 7.1 [P] | Despliegue final con la configuración de la fase 2 y verificación en producción |
| 7.2 [P] | README de portfolio con URL, capturas reales y credenciales de demostración |
| 7.3 [P] | CHANGELOG `[2.0.0]`, tag `v2.0.0` y GitHub Release (con indicación de Manuel) |

## Después de 2.0 [+]

Funciones nuevas que surjan en la fase 3 y no sean imprescindibles; PWA; internacionalización.
