# Instrucciones para agentes — Digital-Fit

## Contexto

Digital-Fit es una aplicación web para organizar el entrenamiento: centros privados y lugares públicos con mapa, entrenamientos base, propios y de la comunidad, historial, estadísticas, valoraciones y soporte con panel de administración. Nació como proyecto final de DAW (conservado en el tag `v1.0.0`) y se está renovando como **Digital-Fit 2.0**: una aplicación profesional, publicada en una URL pública gratuita y presentada como proyecto de portfolio.

Stack: Angular 21 + TypeScript 5.9 (frontend), Spring Boot 4 + Java 25 (backend), PostgreSQL 17, Docker Compose. Detalle en [docs/architecture.md](docs/architecture.md).

El avance real está en [docs/STATUS.md](docs/STATUS.md). Léelo en cada sesión y contrástalo con el repositorio. No supongas que existen rutas, scripts, tests o un despliegue porque aparezcan en la documentación: mandan los archivos actuales y las instrucciones vigentes de Manuel.

## Modo de trabajo: guiado por defecto

Decisión de Manuel (2026-10-26). Prevalece sobre cualquier skill, plugin o instrucción anterior que sugiera implementar por iniciativa propia.

**Manuel marca cuándo avanzar.** El roadmap no es una orden de ejecutar tareas. «Vamos con el siguiente paso» significa empezar su **explicación guiada**, no implementarlo.

**Por defecto, Manuel escribe el código** y el agente explica. El agente solo modifica archivos cuando Manuel lo pide expresamente para una tarea concreta. Eso incluye documentación, configuración, datos, seeds, contenido repetitivo y correcciones: ninguno está autorizado en automático por defecto.

### Cómo guiar un paso

Divide cada tarea en pasos pequeños y ordenados, con **un archivo (o un cambio pequeño) por paso**. Nunca una funcionalidad completa con muchos archivos en una sola respuesta.

Antes de trabajar en un archivo, explica:

- Su ruta y si se crea o se modifica.
- Para qué sirve y qué responsabilidad tiene.
- Por qué se necesita en este paso.
- Dónde se usa y cómo se relaciona con otros archivos.

Después, explica el código **por bloques**: qué hace cada parte, por qué está ahí y para qué se usa, incluidos los imports, funciones, clases, tipos, anotaciones o configuración que lo necesiten. No hace falta comentar lo evidente, pero no des por entendida la lógica importante.

Al modificar un archivo, señala el lugar exacto (archivo y bloque o líneas) y qué hay que añadir, sustituir o eliminar. Si es más claro dar el archivo completo, explica igualmente qué cambia.

Cada paso deja claro: 1) qué se consigue, 2) qué archivo se trabaja, 3) qué código escribir y por qué, 4) cómo comprobarlo y 5) qué resultado esperar. Termina con un **punto de parada**: Manuel lo aplica, lo prueba y pregunta antes de continuar.

Si aparece un error durante el modo guiado, explica su causa y la corrección para que Manuel la aplique. No lo arregles en silencio.

### Tareas en automático (solo cuando Manuel lo pide)

- La autorización cubre **solo la tarea solicitada**. Resuelve los detalles rutinarios dentro de ella, pero no amplíes el alcance ni empieces otras tareas o fases.
- Al terminar, explica qué archivos cambiaste, para qué sirven y cómo lo comprobaste. Después vuelve al modo guiado.
- Autorización permanente (Manuel, 2026-11-01): las tareas de la **fase 1B (DevOps)** y las de la fase 1 que la desbloquean se hacen en automático, incluidos rama, commits, PR y merge. Los tokens los guarda Manuel como secretos de GitHub (`gh secret set`); nunca se piden en el chat.
- Rediseño (Manuel, 2026-11-01): **modo mixto**. Lo visual y repetitivo (estilos, componentes de interfaz, traducciones, SEO) en automático con revisión de Codex; la lógica del mapa y del backend, guiada.

### Reglas generales

- Explica en español, de forma clara, para un estudiante de DAW.
- Antes de un cambio grande (varias capas, dependencias nuevas, cambio de stack o de modelo de datos), presenta plan, archivos afectados y criterios de comprobación. Un cambio de stack se plantea con motivos y consecuencias y espera aprobación.
- Pide aprobación antes de borrar datos, sustituir configuración, cambiar credenciales o servicios externos, o ejecutar operaciones irreversibles.
- Conserva los cambios ajenos a la tarea. No hagas refactorizaciones no pedidas: anótalas en el roadmap.

## Antes de cambiar código

1. Lee este archivo y [docs/STATUS.md](docs/STATUS.md); según la tarea, [docs/architecture.md](docs/architecture.md), la fase activa de [docs/roadmap.md](docs/roadmap.md), [docs/design-system.md](docs/design-system.md) o [docs/deployment.md](docs/deployment.md).
2. Comprueba `git status`, la rama activa y que no estás en `main` ([docs/git-workflow.md](docs/git-workflow.md)).
3. Lee solo los archivos que vayas a tocar y sus llamadores; no releas el repositorio entero.

## Reglas de arquitectura

- **Backend** (`Backend/digital-fit`): capas `controller → service → repository`, con DTOs en la frontera HTTP. Las entidades JPA no salen por la API. La lógica y los permisos viven en los servicios.
- **Seguridad en el backend**: los guards de Angular solo mejoran la navegación. Toda operación sobre un recurso propio comprueba en el servicio que pertenece al usuario autenticado. Las rutas `/api/admin/**` exigen rol `ADMIN`.
- **Frontend** (`Frontend/digital-fit-frontend`): componentes standalone, servicios HTTP por dominio en `src/app/services`, guards en `src/app/guards`. Tipa las respuestas con interfaces; no uses `any` nuevo.
- Validación en la frontera: Bean Validation en los DTOs de entrada; nunca confíes en la validación del cliente.
- Configuración por variables de entorno. **Ningún secreto en el repositorio**; documenta solo nombres y valores ficticios.
- Servicios externos (OpenStreetMap, Nominatim): respeta sus políticas de uso (ver [docs/architecture.md](docs/architecture.md#mapas-y-geocodificación)).
- Añade una dependencia solo cuando se use, explicando para qué. Comprueba compatibilidad con Angular, mantenimiento, licencia, peso y accesibilidad. No introduzcas React para usar una librería.

## Código y contenido

- Respeta el estilo de cada parte: el código existente usa nombres en español (`EntrenamientoUsuarioService`, `mis-centros`); continúa así dentro de cada módulo.
- Interfaz, documentación y mensajes de commit en español.
- Estados reales de carga, error, vacío y éxito. Etiquetas, foco visible, teclado y movimiento reducido.
- Textos de interfaz concretos y verificables: sin relleno ni promesas de funciones que no existen (revisión `antislop`).

## Comprobaciones

Comandos actuales en [docs/git-workflow.md](docs/git-workflow.md#checklist-de-pr). Ejecuta los que afecten a la parte modificada; build al cerrar una tarea o tocar configuración. Para cambios visuales, revisa móvil, escritorio, teclado, contraste y movimiento reducido. Para documentación, revisa enlaces, comandos y coherencia con el código.

Nunca presentes una comprobación pendiente como superada. Distingue «preparado», «aplicado por Manuel» y «verificado».

## Revisión con Codex

Ciclo: **implementar → comprobar → Codex revisa → analizar y corregir hallazgos reales → volver a comprobar**. Una revisión por tarea o bloque coherente, no por cada edición. Los hallazgos de Codex se verifican antes de actuar. **En modo guiado**, el agente explica a Manuel cada corrección para que la aplique él; **en una tarea autorizada en automático**, el agente la aplica. No se cierra una tarea con errores conocidos sin resolver ni registrar. Detalle en [docs/ai-workflow.md](docs/ai-workflow.md).

## Git

GitHub Flow: rama por cambio desde `main`, Conventional Commits en español, PR, merge y borrado de rama. El agente redacta el mensaje de commit completo (título, línea en blanco, lista con `- `); **Manuel hace los commits, push, PR y merge** salvo petición expresa. Excepción acordada (2026-10-26): las tareas de **preparación** que Manuel encargue en automático (configuración del repositorio, documentación de arranque) las cierra el agente con commits y PR. El desarrollo del proyecto sigue el modo guiado. Tags solo con indicación de Manuel. Detalle en [docs/git-workflow.md](docs/git-workflow.md).

## Continuidad entre Claude, Codex y otras IA

- `AGENTS.md` contiene las reglas comunes; `CLAUDE.md` lo importa. No mantengas copias divergentes.
- `docs/STATUS.md` es el punto de continuación: actualízalo al cerrar cada tarea con fecha, cambios, comprobaciones reales, bloqueos y siguiente paso.
- Evita que dos herramientas editen a la vez los mismos archivos del mismo checkout: usa ramas o worktrees separados.
- Al terminar, deja explícitos los cambios sin commit y los bloqueos.

## Documentación y cierre

- CHANGELOG: cambios completados en «Sin publicar». Funciones futuras, en el roadmap.
- Arquitectura: cuando cambien responsabilidades o decisiones (registro de decisiones con motivo, consecuencias y estado).
- README: cuando cambie cómo se ejecuta o qué ofrece realmente la aplicación. No anuncies funciones ni despliegues que no existen.
- Comunica qué cambió, cómo se comprobó, qué falta y el siguiente paso. No inventes comandos, resultados, revisiones ni publicaciones.
