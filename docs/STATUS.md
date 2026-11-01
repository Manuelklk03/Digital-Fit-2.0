# Estado actual — Digital-Fit

Última actualización: **2026-11-01** (Claude Code).

> **2026-11-01:** Manuel adelanta DevOps (fase 1B del roadmap) y autoriza el modo automático para ella y para las tareas de la fase 1 que la desbloquean (1.5–1.9). Decisiones D4 (PostgreSQL), D7 (SonarQube Cloud), D8 (Docker Hub) y D9 (Vercel/Netlify + backend en contenedor + PostgreSQL gestionado). Hechas: PR #23 (1.3, 1.4), configuración de GitHub (1.5) y limpieza del repositorio (1.6). Orden pendiente: 1.7 → 1.8 → 1.9 → 1B.1–1B.5.

## Resumen

- **Fase activa:** 1 — Auditoría, GitHub Flow, `v1.0.0`, limpieza y documentación ([roadmap](roadmap.md#fase-1--auditoría-github-flow-v100-limpieza-y-documentación)).
- **Rama de trabajo:** ninguna abierta tras la PR de `chore/repo-hygiene`. `main` está protegida: todo entra por PR.
- **SonarQube Cloud:** organización `manuelklk03`, proyecto `Manuelklk03_Digital-Fit-Proyecto`, método de análisis GitHub Actions (según Manuel), secreto `SONAR_TOKEN` guardado en el repositorio (verificado con `gh secret list`).
- **Versión publicada:** `v1.0.0` (tag anotado, ver abajo). `v2.0.0` no existe todavía.
- **Despliegue público:** ninguno.
- **Modo de trabajo:** guiado por defecto (decisión de Manuel, 2026-10-26; ver `AGENTS.md`). La preparación de esta entrega (tag, limpieza y documentación) se hizo en automático porque el encargo inicial lo autorizaba expresamente. Las tareas siguientes empiezan solo cuando Manuel lo indique y, salvo que pida otra cosa, de forma guiada.

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
- Contraseñas de los usuarios de ejemplo (`admin1`, `usuario1`) desconocidas: solo están sus hashes en `data.sql`.

## Siguiente paso

1. **1.10** (Spring Boot 4.1) y **1.11** (Angular 22), en automático.
2. Fase 1B (DevOps), en automático.
3. Rediseño: mapa tipo Google Maps, i18n y SEO registrados como tareas 3.6–3.9 (D10, D11), en modo mixto.

## Cómo actualizar este archivo

Al cerrar cada tarea: fecha, rama, qué cambió, comprobaciones con su resultado real, bloqueos y siguiente paso. Distingue «preparado», «aplicado por Manuel» y «verificado».
