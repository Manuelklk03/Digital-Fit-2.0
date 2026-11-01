# Changelog

Cambios relevantes completados. Las tareas futuras están en el [roadmap](docs/roadmap.md).

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.

## Sin publicar

### Añadido

- Documentación para la renovación 2.0: `AGENTS.md`, `CLAUDE.md` y `docs/` (estado, roadmap, arquitectura, sistema de diseño, despliegue, flujo con IA y flujo de Git).
- GitHub Flow como flujo de trabajo y plantilla de pull request.
- Modo de trabajo guiado para las IA: Manuel escribe el código y la IA explica paso a paso; la IA solo edita en tareas autorizadas.
- Configuración de Claude Code del proyecto (`.claude/settings.json`).
- Fase 1B (DevOps) en el roadmap: CI con GitHub Actions, SonarQube Cloud y publicación de imágenes en Docker Hub.

### Cambiado

- README reescrito: presenta Digital-Fit como proyecto en evolución hacia 2.0 y documenta la ejecución real.

### Eliminado

- Materiales de la entrega académica: memoria, guía del centro, manuales de uso y despliegue, presentación de defensa y guías de preparación. Se conservan en el tag `v1.0.0`; la información técnica vigente del manual de despliegue pasa a `docs/deployment.md`.

## [1.0.0] — 2026-10-26

Versión original entregada como proyecto final de 2º de DAW (commit `218f26d`), etiquetada al comenzar la renovación. Historial reconstruido con GitHub Flow en las PR #1–#22, con mensajes en Conventional Commits. Angular 21 + Spring Boot 4 + MySQL 8 con Docker Compose, para ejecución local. No validada para producción.
