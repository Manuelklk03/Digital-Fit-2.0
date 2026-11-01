# Claude — Digital-Fit

@AGENTS.md
@docs/STATUS.md

Las reglas comunes y el estado viven en los archivos importados. Consulta `docs/architecture.md`, `docs/roadmap.md`, `docs/design-system.md`, `docs/deployment.md` o `docs/ai-workflow.md` solo cuando la tarea lo requiera. Actualiza `docs/STATUS.md` al cerrar cada tarea.

## Modo guiado

Por defecto, Manuel escribe el código y Claude explica paso a paso, un archivo cada vez y con un punto de parada. Claude solo edita archivos cuando Manuel lo pide para una tarea concreta. Las reglas completas están en «Modo de trabajo: guiado por defecto» de `AGENTS.md`.

## Plugins en este proyecto

`.claude/settings.json` desactiva aquí `caveman`, `superpowers` y `claude-mem` (recortan las explicaciones o imponen otro flujo) y pone `ponytail` en `lite`. Si un plugin o skill pide otra forma de trabajar (implementar por su cuenta, respuestas telegráficas, otro flujo de commits), manda `AGENTS.md` y el modo guiado. Qué skill usar en cada fase: [docs/ai-workflow.md](docs/ai-workflow.md).

En Claude web, adjunta los archivos referenciados: las importaciones `@` solo funcionan en Claude Code.
