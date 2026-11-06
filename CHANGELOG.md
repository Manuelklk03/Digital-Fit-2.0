# Changelog

Cambios relevantes completados. Las tareas futuras están en el [roadmap](docs/roadmap.md).

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.

## Sin publicar

### Añadido

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

- Imágenes Docker sin root (usuario `app` en el backend, `nginx-unprivileged` en el puerto 8080 en el frontend) y `npm ci --ignore-scripts`.
- `main` exige los checks de la CI en verde (cinco desde 1B.5) y la rama al día para fusionar.
- Spring Boot 4.0.6 → 4.1.2.
- Angular 21 → 22.2.4 y TypeScript 5.9 → 6.0.3, con las migraciones de `ng update` que mantienen el comportamiento anterior.
- Base de datos: PostgreSQL 17 en lugar de MySQL 8 (driver, URL, Compose en el puerto 5433 y `data.sql` con `ON CONFLICT DO NOTHING`). Credenciales por `.env` (plantilla en `.env.example`).
- Tests del frontend: 51/51 en verde (los specs usaban nombres de clase inexistentes y no daban router ni `HttpClient`).
- Roadmap: actualización de Spring Boot y Angular (1.10, 1.11) y rediseño con mapa tipo Google Maps, i18n y SEO (3.6–3.9).
- `docker-compose.yml`: rutas de `context` con `/`, válidas fuera de Windows.
- `mvnw` versionado como ejecutable.
- Decisiones de arquitectura: PostgreSQL en lugar de MySQL (pendiente de aplicar, tarea 1.9) y despliegue en Vercel/Netlify + backend en contenedor + PostgreSQL gestionado.
- README reescrito: presenta Digital-Fit como proyecto en evolución hacia 2.0 y documenta la ejecución real.

### Eliminado

- Tres archivos `.log` que estaban versionados.
- Materiales de la entrega académica: memoria, guía del centro, manuales de uso y despliegue, presentación de defensa y guías de preparación. Se conservan en el tag `v1.0.0`; la información técnica vigente del manual de despliegue pasa a `docs/deployment.md`.

## [1.0.0] — 2026-10-26

Versión original entregada como proyecto final de 2º de DAW (commit `218f26d`), etiquetada al comenzar la renovación. Historial reconstruido con GitHub Flow en las PR #1–#22, con mensajes en Conventional Commits. Angular 21 + Spring Boot 4 + MySQL 8 con Docker Compose, para ejecución local. No validada para producción.
