# Flujo de trabajo con IA — Digital-Fit

Cómo colaboran Claude Code y Codex en este proyecto, qué herramientas hay disponibles y cómo se evita gastar tokens sin perder calidad.

## Herramientas comprobadas (2026-10-26, PC de Manuel)

| Herramienta | Estado | Cómo se usa |
|---|---|---|
| Claude Code (extensión de VS Code) | Disponible | Guía paso a paso y comprueba; edita solo en tareas autorizadas |
| Plugin `codex@openai-codex` (v1.0.6) | **Listo**: Codex CLI 0.164.0, sesión ChatGPT activa, runtime avanzado | `/codex:review`, `/codex:rescue`, agente `codex:codex-rescue`. Puerta de revisión al cerrar desactivada (`/codex:setup --enable-review-gate` para activarla) |
| Codex CLI (`codex`) | Disponible en `~/.local/bin` | Uso directo desde terminal |
| Claudex (BeamoTech v1.6.4, reparada) | **No funciona**: `claudex --doctor` → «The Codex Windows installation is incomplete: codex.ps1 is missing beside the selected batch shim» | Lanzador aparte de Claude Code; no se usa hasta repararlo |
| Skill `token-efficient-workflow` (Codex) | Instalada en `~/.agents/skills/token-efficient-workflow` | El nombre real es `token-efficient-workflow`, no `token-efficiency-workflow` |
| Java / Maven | No están en el PATH | El backend se compila con Docker (ver [git-workflow.md](git-workflow.md#checklist-de-pr)) |
| Docker | 29.9.2 instalado | Docker Desktop debe estar arrancado |
| GitHub CLI | 2.102.0, autenticado como `Manuelklk03` | PR, merges, configuración del repositorio |

Para volver a comprobar: `node "<ruta del plugin>/scripts/codex-companion.mjs" setup --json` (o `/codex:setup`), `claudex --doctor`, `gh auth status`.

## Plugins de Claude Code

Activos globalmente (`~/.claude/settings.json`): frontend-stack (con frontend-design, impeccable, ui-ux-pro-max, taste, emil-design-eng), imagegen-skills, ponytail, andrej-karpathy-skills, grill-me, antislop, caveman, claude-mem, claude-code-setup, superpowers, headroom y codex.

Configuración del proyecto (`.claude/settings.json`), igual que ValveDex:

- **Desactivados aquí**: `caveman` (respuestas telegráficas que recortan las explicaciones), `superpowers` (impone su propio flujo de planes y ramas) y `claude-mem` (memoria fuera del repositorio; la continuidad vive en `docs/STATUS.md`).
- **`ponytail` en `lite`** (`PONYTAIL_DEFAULT_MODE=lite`): construye lo pedido y menciona en una línea la alternativa más simple, sin recortar explicaciones.

Los cambios de `.claude/settings.json` se aplican al abrir una sesión nueva de Claude Code.

## Qué skill usar en cada momento

| Momento | Skill |
|---|---|
| Decisiones de producto o datos que cambian el diseño | `grill-me` (preguntas que cambien el resultado, no de rutina) |
| Dirección visual y componentes | `frontend-stack` como director; apoyan `impeccable`, `frontend-design`, `taste`, `ui-ux-pro-max`, `emil-design-eng` (movimiento) e `imagegen-skills` (referencias) |
| Textos visibles y páginas nuevas | `antislop` (y `antislop-copywriting`, `antislop-forms`, `antislop-nav` según el caso) |
| Revisión de UI | agente `frontend-stack:ui-reviewer` |
| Cambios mínimos | `ponytail` (lite), `andrej-karpathy-skills` |
| Configuración de Claude Code | `claude-code-setup` |

No se activan todos los plugins por sistema: cada skill se carga cuando su tarea lo pide.

## Modo de trabajo

El modo por defecto es **guiado** (ver «Modo de trabajo: guiado por defecto» en [AGENTS.md](../AGENTS.md)): Manuel escribe el código y la IA explica paso a paso, un archivo cada vez y con un punto de parada. La IA solo edita archivos en las tareas que Manuel autoriza expresamente en automático, y esa autorización se limita a la tarea pedida. Las skills y plugins no cambian este modo.

## Ciclo Claude → Codex

1. **Se escribe el cambio** en su rama: lo escribe Manuel guiado por Claude (modo guiado) o lo escribe Claude (tarea autorizada en automático).
2. **Se comprueba**: build, tests y lo que aplique ([git-workflow.md](git-workflow.md#checklist-de-pr)).
3. **Codex revisa** con un encargo compacto (ver plantilla). Siempre en solo lectura.
4. **Claude analiza** cada hallazgo: lo reproduce o lo contrasta con el código y descarta los falsos explicando el motivo.
   - **Modo guiado:** Claude explica a Manuel cada corrección válida (archivo, lugar exacto, causa y cambio) para que la aplique él.
   - **Tarea en automático:** Claude aplica las correcciones y después explica qué cambió.
5. **Se vuelve a comprobar.** Si la corrección fue grande, segunda revisión de Codex solo sobre ese diff.

Una revisión por tarea o bloque coherente, no por cada edición. Revisión obligatoria antes de cerrar una fase y en cambios de autenticación, permisos, datos o despliegue. No se cierra una tarea con hallazgos válidos sin resolver ni registrar.

Usos de Codex: revisar cambios y decisiones técnicas, depurar errores, investigar fallos de integración, detectar regresiones, revisar backend/API/autenticación/permisos y ayudar con pruebas, rendimiento y accesibilidad.

### Plantilla de encargo

```text
Objetivo: <qué hace el cambio y por qué>
Rama / diff: <rama>, commits <sha..sha> o `git diff main...HEAD`
Archivos relevantes: <lista corta>
Comprobaciones hechas: <comando → resultado real>
Revisa: <correctness, seguridad/permisos, regresiones, accesibilidad…>
Fuera de alcance: <lo que no hay que revisar>
Formato: hallazgos con archivo:línea, gravedad y escenario que falla. Solo lectura.
```

### Edición en paralelo

Nunca dos herramientas editando los mismos archivos del mismo checkout. Si se delega implementación, cada agente trabaja en su rama o en un worktree (`git worktree add ../df-<tarea> -b <rama>`) con archivos asignados.

## Ahorro de tokens (`token-efficient-workflow`)

Aplicación en este repositorio:

- Empezar por `AGENTS.md`, `docs/STATUS.md` y `git status`/`git diff`; leer solo los archivos de la tarea y sus llamadores.
- No volcar en el contexto `package-lock.json`, `data.sql` completo, `logs/`, `dist/`, `node_modules/` ni salidas largas de build: filtrar con `tail`/`grep` y conservar el texto exacto de los errores.
- A Codex, el diff y la plantilla, no la conversación entera.
- Reutilizar lo ya comprobado (está en STATUS) salvo que hayan cambiado archivos o dependencias.
- El ahorro nunca justifica saltarse comprobaciones ni recortar las explicaciones que Manuel necesita.

## Si una herramienta no está disponible

Prepara un traspaso breve (plantilla de arriba más el estado de STATUS), anota la limitación en `docs/STATUS.md` y **no marques la revisión como hecha**.
