# Changelog

Cambios relevantes completados. Las tareas futuras están en el [roadmap](docs/roadmap.md).

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.

## Sin publicar

### Añadido

- Rediseño del recorrido de **Lugares** (fase 5): catálogos de centros privados y lugares públicos, mis centros, mis lugares y sus cuatro detalles con Neutral Sport / Industrial, OnPush y signals, modelos tipados sin `any` (`models/lugar.ts`), paginación real con filtro de un solo campo (nombre, dirección y precio máximo o tipo) y textos en los 4 idiomas. Las ocho pantallas son envoltorios de dos componentes comunes (`pages/lugares/listado-sitios` y `detalle-sitio`) configurados por pantalla. Formulario con mapa que autocompleta desde OpenStreetMap solo los campos vacíos o autocompletados antes, sin pisar lo escrito por el usuario. En el catálogo, las acciones esperan a conocer el rol para no mostrar un botón que después cambia.
- Selector de mapa (`mapa-selector`) con OnPush y signals: mueve el marcador cuando cambian las coordenadas (antes, al editar otro sitio el mapa no se movía), libera Leaflet y los temporizadores al destruirse, mensajes en una región viva y marcador fuera del orden de tabulación.
- Búsqueda por texto en el historial de entrenamientos con el parámetro `q` del backend.
- Parámetro opcional de búsqueda textual `q` en `GET /api/entrenamientos/mi-historial`, con filtrado `LIKE` insensible a mayúsculas sobre notas, rutinas y centros o espacios públicos, preservando la paginación y el orden descendente por fecha (parada G8).
- Rediseño del recorrido de **Entrenamientos** (fase 5): catálogo base, mis entrenamientos, comunidad, historial y sus cuatro detalles con el sistema Neutral Sport / Industrial, componentes OnPush con signals, modelos tipados sin `any` (`models/entrenamiento.ts`), estados reales de carga, vacío, error y recarga, y textos en los 4 idiomas. Paginación real en pantalla (12 por página) con filtro de un solo campo, como aplica el backend; errores `ProblemDetail` mostrados al usuario; confirmación antes de borrar; foco gestionado al abrir y cerrar formularios. Piezas compartidas en `pages/entrenamientos/compartido/` (estado paginado, filtro, tarjeta, formulario y paginador).
- Frontend adaptado a la API paginada: interfaz `PaginaResponse<T>` y los 9 servicios de listados (entrenamientos, centros, lugares y valoraciones) piden `size=100` y devuelven el contenido, sin cambiar las pantallas. Paginación visible en cada pantalla: recorridos 5.2–5.4.
- Paginación y ordenación en los listados de la API REST mediante Spring Data `Pageable` (`page`, `size` [por defecto 20, máximo 100], `sort`) y encapsulación en el DTO genérico `PaginaResponse<T>` (`content`, `page`, `size`, `totalElements`, `totalPages`), resolviendo la deuda técnica P6 y optimizando consultas N+1 con `@EntityGraph` en comunidad, historial y valoraciones (tarea 4.8).
- Orquestador de producción `docker-compose.prod.yml` que utiliza las imágenes inmutables de Docker Hub (`manuelklk03/digital-fit-backend` y `manuelklk03/digital-fit-frontend`) en lugar de compilación local, preservando sondas de salud (`/actuator/health`), sincronización con `service_healthy` y parametrización por entorno para cookies seguras, CORS y perfil `prod` (tarea 1B.6).
- Paso opcional de notificación de *deploy hook* a Render tras la publicación de la imagen del backend en Docker Hub en `.github/workflows/ci.yml`. Condicionado al secreto `RENDER_DEPLOY_HOOK`, omitiéndose limpiamente sin fallos mientras no esté configurado (tarea 1B.5, D9).
- Revisión y saneamiento **antislop** integral de la portada `/inicio`: sustitución de métricas y textos artificiales por datos verificables del sistema (catálogo de 10 rutinas, Overpass API, cronómetro en vivo y código libre), eliminación de emojis decorativos en favor de iconos técnicos SVG y unificación de tarjetas hacia las tres áreas nucleares de la plataforma.
- Componente de alerta reutilizable `AlertComponent` (`app-alert`) en `src/app/components/ui/alert` con soporte para variantes de éxito, error e información, accesibilidad WCAG AAA y atributos ARIA completos.
- Rediseño visual del recorrido de **Acceso (Login y Registro)** en la fase 5 bajo el sistema de diseño Neutral Sport / Industrial, integrando `CardComponent`, `BadgeComponent`, `InputDirective` y `ButtonComponent`.
- Panel accesible con credenciales de prueba en `/login` para evaluadores y pruebas de demostración (`usuario1` / `admin1`).
- Validaciones accesibles en `/register` (formato de correo electrónico, longitud mínima de contraseña de 6 caracteres y campos obligatorios) con avisos inline `role="alert"`.
- Soporte multilingüe completo para login y registro en los 4 idiomas soportados (`es`, `ca`, `en`, `fr`) mediante `I18nService`.
- Suites de pruebas unitarias actualizadas para `login.spec.ts` (6 tests) y `register.spec.ts` (6 tests), totalizando 118 tests pasando en el frontend.
- Migraciones versionadas de base de datos con Flyway (`V1__esquema_inicial.sql` con DDL completo de PostgreSQL 17, `V2__catalogos_base.sql` y `V3__usuarios_demo.sql`), retirando la inicialización legacy con `data.sql` y configurando `ddl-auto=validate` en producción, resolviendo la deuda técnica P4 y formalizando la decisión D3 (tarea 4.4).
- Documentación explícita de credenciales de los usuarios de demostración (`admin1` / `Admin123!` y `usuario1` / `Usuario123!`) en `docs/deployment.md`, eliminando el bloqueo histórico del repositorio (tarea 4.5).
- Segregación de perfiles de configuración de Spring Boot (`application-dev.properties` vs `application-prod.properties`) con `spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}`, desactivando `show-sql` y niveles DEBUG en producción y manteniendo trazabilidad en desarrollo local, resolviendo la deuda técnica P10 (tarea 4.7).
- Suites de pruebas de integración de seguridad y permisos en Spring Security: aislamiento estricto de recursos entre usuarios (`AislamientoRecursosUsuarioTest`, 12 tests) verificando denegación (`OperacionNoPermitida` / 403) ante intentos de acceso cruzado entre usuario A y B, y protección de las rutas `/api/admin/**` con `AdminRutasPermisosSecurityTest` (15 tests) verificando 401 para anónimos, 403 para rol `USER` y 200/201/204 para rol `ADMIN` (tarea 4.2).
- Estandarización de respuestas de error de la API REST mediante `ProblemDetail` (RFC 7807/RFC 9457) en `GlobalExceptionHandler`, con mapa de validaciones de campo en errores 400 y suite de pruebas unitarias `GlobalExceptionHandlerTest` (tarea 4.3, deuda técnica P5).
- Utilidad de seguridad `LogSanitizer` para neutralizar inyecciones de logs CRLF (Sonar `java:S5145`) aplicada en servicios de autenticación, geocodificación y gestión de centros y entrenamientos (tarea 4.1).
- Parámetros de seguridad de cookies de sesión (`server.servlet.session.cookie.http-only=true`, `same-site=lax` y `secure` configurable) y parametrización de CORS dinámico por entorno (`CORS_ALLOWED_ORIGINS`, P2 y P3).
- Retirado el endpoint duplicado `/api/auth/yo` en `AuthController`, eliminando la deuda técnica P13.
- Soporte multilingüe completo (español por defecto, valenciano, inglés y francés, decisión D11) mediante `I18nService` reactivo con Angular Signals, diccionarios tipados desacoplados y persistencia en `localStorage`.
- Selector desplegable de idioma accesible en la cabecera (`HeaderComponent`) con banderas, abreviaturas, navegación por teclado y atributos ARIA (`aria-expanded`, `aria-haspopup`, `role="listbox"`).
- Integración de traducciones en tiempo real en la navegación global y las secciones de la portada `/inicio` (Hero, Asistente en vivo, Radar OSM y Comunidad).
- Portada `/inicio` cinematográfica bajo la dirección Neutral Sport / Industrial con narrativa visual por scroll (GSAP ScrollTrigger dinámico y alternancia estática accesible con `prefers-reduced-motion: reduce`, decisión D15).
- Demostración interactiva en la portada del asistente de entrenamiento en tiempo real (series, peso táctil y cronómetro regresivo de descanso con tipografía tabular).
- Carga diferida (`loadComponent`) para `/inicio` y sus dependencias de animación en `app.routes.ts`, reduciendo el CSS a 1.4 kB y optimizando el bundle.
- Healthchecks en Docker Compose (`/actuator/health` público en el backend; el frontend espera a que el backend esté sano), que elimina el 502 de los primeros segundos. La prueba de humo de la CI usa `docker compose up --wait`.
- Entrega continua: en cada merge a `main` y en cada tag `v*` la CI publica las imágenes de backend y frontend en Docker Hub. Prueba de humo con Docker Compose en cada PR.
- Análisis de calidad con SonarQube Cloud en la CI, con cobertura de JaCoCo (backend) y Vitest (frontend); el Quality Gate *Sonar way* es un check obligatorio. Insignia en el README.
- ESLint con `angular-eslint` (`npm run lint`) y job de lint en la CI. Corregidos los errores del código existente (interfaces de ciclo de vida, accesibilidad del selector de estrellas, `inject()`); `any` y OnPush quedan como avisos hasta la fase 5.
- Integración continua con GitHub Actions (`ci.yml`): tests y build de backend (con PostgreSQL) y frontend en cada PR y en `main`; insignia de estado en el README.
- Documentación para la renovación 2.0: `AGENTS.md`, `CLAUDE.md` y `docs/` (estado, roadmap, arquitectura, sistema de diseño, despliegue, flujo con IA y flujo de Git).
- GitHub Flow como flujo de trabajo y plantilla de pull request.
- Modo de trabajo guiado para las IA: Manuel escribe el código y la IA explica paso a paso; la IA solo edita en tareas autorizadas.
- Configuración de Claude Code del proyecto (`.claude/settings.json`).
- Fase 1B (DevOps) en el roadmap: CI con GitHub Actions, ESLint, SonarQube Cloud y publicación de imágenes en Docker Hub.
- `.gitignore` en la raíz (logs, `.env`, estado local de herramientas).

### Cambiado

- Retirada del sistema de tickets de soporte en el frontend (decisión de la tarea 3.1): pantallas, rutas, servicios, enlaces y textos en los 4 idiomas. El backend de tickets se retira aparte.

- Imágenes Docker sin root (usuario `app` en el backend, `nginx-unprivileged` en el puerto 8080 en el frontend) y `npm ci --ignore-scripts`.
- `main` exige los checks de la CI en verde (cinco desde 1B.5) y la rama al día para fusionar.
- Spring Boot 4.0.6 → 4.1.2.
- Angular 21 → 22.2.4 y TypeScript 5.9 → 6.0.3, con las migraciones de `ng update` que mantienen el comportamiento anterior.
- Base de datos: PostgreSQL 17 en lugar de MySQL 8 (driver, URL, Compose en el puerto 5433 y `data.sql` con `ON CONFLICT DO NOTHING`). Credenciales por `.env` (plantilla en `.env.example`).

### Eliminado

- Backend completo de tickets de soporte: eliminados controladores (`SoporteRestController`, `SoporteAdminRestController`), servicio `SoporteService`, entidades `Soporte` y `MensajeSoporte`, enum `EstadoSoporte`, repositorios y DTOs asociados. Incorporada migración Flyway `V4__eliminar_soporte.sql` para eliminar las tablas `mensajes_soporte` y `soporte` de la base de datos (decisión D13).
- Dependencias no utilizadas `spring-boot-starter-thymeleaf` y `spring-boot-starter-thymeleaf-test` en `Backend/digital-fit/pom.xml`, preservando `spring-boot-starter-actuator` para las sondas de salud `/actuator/health` en Docker Compose (tarea 4.9).
- Tests del frontend: 51/51 en verde (los specs usaban nombres de clase inexistentes y no daban router ni `HttpClient`).
- Roadmap: actualización de Spring Boot y Angular (1.10, 1.11) y rediseño con mapa tipo Google Maps, i18n y SEO (3.6–3.9).
- `docker-compose.yml`: rutas de `context` con `/`, válidas fuera de Windows.
- `mvnw` versionado como ejecutable.
- Decisiones de arquitectura: PostgreSQL en lugar de MySQL (pendiente de aplicar, tarea 1.9) y despliegue en Vercel/Netlify + backend en contenedor + PostgreSQL gestionado.
- README reescrito: presenta Digital-Fit como proyecto en evolución hacia 2.0 y documenta la ejecución real.

### Eliminado

- Tres archivos `.log` que estaban versionados.
- Materiales de la entrega académica: memoria, guía del centro, manuales de uso y despliegue, presentación de defensa y guías de preparación. Se conservan en el tag `v1.0.0`; la información técnica vigente del manual de despliegue pasa a `docs/deployment.md`.

### Corregido

- `explorar.ts` leía un campo `equipamiento` que el DTO de lugares públicos no tiene y situaba en el mapa sitios sin coordenadas; ahora los omite.
- Hashes bcrypt de usuarios demo en migración Flyway `V5__actualizar_hashes_demo.sql` para `admin1` (`Admin123!`) y `usuario1` (`Usuario123!`), solventando el fallo 401 en el panel de login demo (parada G8).
- Manejo de `NoResourceFoundException` en `GlobalExceptionHandler`, respondiendo con código 404 ProblemDetail en lugar de error interno 500 ante rutas no mapeadas de la API (parada G8).
- Los guards `authGuard` y `publicGuard` llamaban a `/api/auth/yo`, retirado en la tarea 4.1, y redirigían siempre a `/login` (afectaba a `/entrenamientos`). Ahora usan `/api/auth/me`.
- Contraste AA en los chips sutiles `primary` y `danger` de `BadgeComponent`.

## [1.0.0] — 2026-10-26

Versión original entregada como proyecto final de 2º de DAW (commit `218f26d`), etiquetada al comenzar la renovación. Historial reconstruido con GitHub Flow en las PR #1–#22, con mensajes en Conventional Commits. Angular 21 + Spring Boot 4 + MySQL 8 con Docker Compose, para ejecución local. No validada para producción.
