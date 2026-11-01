# Changelog

Cambios relevantes completados. Las tareas futuras están en el [roadmap](docs/roadmap.md).

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.

## Sin publicar

### Añadido

- Integración continua con GitHub Actions (`ci.yml`): tests y build de backend (con PostgreSQL) y frontend en cada PR y en `main`; insignia de estado en el README.
- Documentación para la renovación 2.0: `AGENTS.md`, `CLAUDE.md` y `docs/` (estado, roadmap, arquitectura, sistema de diseño, despliegue, flujo con IA y flujo de Git).
- GitHub Flow como flujo de trabajo y plantilla de pull request.
- Modo de trabajo guiado para las IA: Manuel escribe el código y la IA explica paso a paso; la IA solo edita en tareas autorizadas.
- Configuración de Claude Code del proyecto (`.claude/settings.json`).
- Fase 1B (DevOps) en el roadmap: CI con GitHub Actions, ESLint, SonarQube Cloud y publicación de imágenes en Docker Hub.
- `.gitignore` en la raíz (logs, `.env`, estado local de herramientas).

### Cambiado

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
