# Relevo entre Claude y Antigravity

Cómo se coordinan las dos herramientas. Manuel hace de enlace: ninguna avisa a la otra directamente.

## Reparto

- **Claude:** SEO (3.9) y todo el frontend (fase 5, vistas nuevas, P1, P7, interceptor, auditoría de interfaz).
- **Antigravity:** todo lo demás (backend, DevOps, despliegue, tests E2E y de CI, revisión de backend, README, release).

Reglas comunes: cada herramienta trabaja en su rama, nunca en los mismos archivos a la vez, y **cada una en su propio directorio** (`git worktree add ../<nombre> -b <rama> main`): si dos agentes comparten el directorio, cada `git switch` cambia la rama del otro. Mínimo 3 commits por PR. Sin atribución a IA en commits ni PR. Textos en español. Detalle en [AGENTS.md](../AGENTS.md).

## Cómo se usa este archivo

Al llegar a una parada, quien espera **no sigue**: escribe una línea `BLOQUEADO` en la tabla de abajo y se lo dice a Manuel. Quien debe resolverlo la cambia a `LIBRE` al terminar.

Formato de cada línea: `Parada | Estado | Espera a | Qué se necesita | Fecha`.

## Paradas

| Parada | Estado | Espera a | Qué se necesita |
|---|---|---|---|
| G1 | Resuelta | Antigravity → Claude | Tarea 4.8 completada (PR #62) y adaptada por Claude en frontend (PR #64) |
| G2 | Resuelta | Claude → Antigravity | Pantallas y servicios de soporte retirados en frontend (PR #65) y backend purgado con Flyway V4 (PR #66) |
| G3 | Resuelta | Claude → Antigravity | Confirmado: cero referencias residuales a soporte o tickets en frontend y backend |
| G4 | Resuelta | Manuel → Antigravity | Cuentas y secretos de Netlify, Render y Neon creados por Manuel; recorrido real de la 2.4 verificado por Claude el 2026-11-11 (ver registro) |
| G5 | LIBRE | Claude → Antigravity | Fase 5 cerrada: Antigravity puede hacer 6.2 (E2E) y 6.1 (CI) |
| G6 | LIBRE | Claude → Antigravity | Claude no tiene ramas abiertas tras fusionar `feat/recorrido-progreso`: Antigravity puede hacer 6.5 (Prettier) |
| G7 | Pendiente | Manuel → Antigravity | 7.3 (tag `v2.0.0`) solo con orden expresa de Manuel |
| G9 | Resuelta | Antigravity | Resueltos los fallos de backend (V6 longitud 1500, @Valid en valoraciones, @Size(min=6) en passwords admin/registro, y búsqueda q en mis-valoraciones) |
| G8 | Resuelta | Antigravity | Resueltos los 3 fallos de backend (migración Flyway V5 para usuarios demo, 404 NoResourceFoundException y parámetro q en historial) |

## Registro de avisos

Añade aquí cada `BLOQUEADO` y `LIBRE` con fecha.

| Fecha | Parada | Estado | Nota |
|---|---|---|---|
| 2026-11-09 | G1 | LIBRE | Tarea 4.8 completada y fusionada (PR #62). Contrato de API paginada publicado para que Claude adapte el frontend |
| 2026-11-09 | G1 | Resuelta | Frontend adaptado a la API paginada (PR #64). Límite: 100 elementos por listado hasta que cada pantalla pagine |
| 2026-11-09 | G2 y G3 | LIBRE | Soporte retirado del frontend (rama `feat/frontend-retirar-soporte`). Antigravity puede retirar tickets en el backend |
| 2026-11-09 | G2 y G3 | Resuelta | Backend de tickets y soporte eliminado por completo con migración Flyway V4 (PR #66) |
| 2026-11-09 | G5 | BLOQUEADO | Antigravity espera a que Claude complete la renovación de las pantallas del frontend (Fase 5) para iniciar las suites E2E (6.2) y CI (6.1) |
| 2026-11-09 | G8 | LIBRE | Recorrido 2 (entrenamientos) cerrado en `feat/recorrido-entrenamientos`. Al probarlo contra Docker aparecen 3 fallos de backend para Antigravity (ver «Fallos de backend para Antigravity») |
| 2026-11-09 | G5, G6 y G9 | LIBRE | Claude cierra la fase 5 (recorridos 3, 4 y 5). Antigravity puede empezar E2E, CI y Prettier, y corregir los fallos de backend de G9 |
| 2026-11-10 | G4 | BLOQUEADO | Sigue pendiente de Manuel, con tres hallazgos de Claude: (1) la URL real de Netlify es `https://digital-fit.netlify.app` (no `digitalfit`), ya corregida en `netlify.toml`, `.env.example` y `docs/deployment.md`; (2) ese sitio responde `401 Login Redirect` a todo, incluido `/api/*`: tiene activada la protección de acceso de Netlify y hay que desactivarla; (3) `RENDER_DEPLOY_HOOK` no es una URL válida (`curl: (6) Could not resolve host`) y rompe el paso «Publicar imagen backend». Antigravity: tras corregirlo Manuel, volver a comprobar `/api/auth/me` a través de Netlify y valorar que el deploy hook no cancele la imagen del frontend |
| 2026-11-11 | Aviso | Coordinación | Antigravity trabajó en el directorio de Claude y cambió a `fix/backend-405-method-not-allowed` (creada desde la rama de SEO): los commits de Claude `b350f18` y `68cd46e` quedaron en esa rama. Claude rehízo su trabajo en el worktree `df-seo` (rama `feat/frontend-seo`). **Antigravity:** antes de abrir la PR, commitea tus cambios y recrea la rama desde `main` con solo tus commits (`git switch -c fix/backend-405 main && git cherry-pick 8aceeaf <tus otros commits>`); no incluyas `b350f18` ni `68cd46e`. A partir de ahora, trabaja en tu propio worktree |
| 2026-11-11 | G4 | Resuelta | Netlify público (`https://digital-fit.netlify.app`), proxy `/api/*` a Render, `RENDER_DEPLOY_HOOK` válido (CI en verde) y Neon con los datos de demo. Verificado en producción: login de `usuario1` y `admin1` (rol `ADMIN`), crear un recurso propio (201), cerrar sesión (`/me` da 401), volver a entrar, el recurso persiste y se borra (204); permisos: usuario 403 y anónimo 401 en `/api/admin/**`. **No probado:** el registro de un usuario nuevo (dejaría un usuario en la base de producción) |
| 2026-11-11 | G10 punto 1 | Resuelta | Antigravity resolvió el punto 1 de G10: manejador para HttpRequestMethodNotSupportedException con 405 ProblemDetail y cabecera Allow, cubierto con test unitario y WebMvc |
| 2026-11-09 | G8 | Resuelta | Antigravity resolvió los 3 fallos de backend (V5 hashes demo, 404 NoResourceFoundException, y parámetro q en historial). Claude ya puede añadir la búsqueda del historial en frontend |
| 2026-11-09 | G9 | Resuelta | Antigravity resolvió los fallos de G9 (V6 amplía columnas a VARCHAR(1500), @Valid en valoraciones, contraseñas mínimo 6 caracteres en admin y registro, y parámetro opcional q en mis-valoraciones). Claude ya puede subir el límite de los formularios a 1500 e integrar la búsqueda textual en mis valoraciones cuando lo requiera |
| 2026-11-09 | G4 | BLOQUEADO | Tarea 2.3 completada. Antigravity queda a la espera de que Manuel cree las 3 cuentas gratuitas (Netlify, Render, Neon) y configure los 4 secretos en GitHub Actions (ver detalle abajo) para abordar la tarea 2.4 |

## Fallos de backend para Antigravity (G10, 2026-11-11)

1. **405 como 500 (Resuelto):** Añadido manejador para `HttpRequestMethodNotSupportedException` en `GlobalExceptionHandler` que responde `405 Method Not Allowed` con `ProblemDetail` (RFC 7807, `urn:problem-type:metodo-no-permitido`) y la cabecera HTTP `Allow` con los métodos admitidos. Cubierto con tests unitarios en `GlobalExceptionHandlerTest` y test WebMvc en `AdminRutasPermisosSecurityTest` verificando que `GET /api/admin/entrenamientos-base` con rol `ADMIN` responde 405 con cabecera `Allow`.
2. **Arranque en frío y proxy de Netlify (Pendiente de decisión):** Con Render dormido (se duerme a los 15 min), la primera petición tarda más que el tiempo de espera del proxy de Netlify y responde `504`; un reintento a los segundos funciona (login en 5,6 s). Valorar un ping periódico (p. ej. un workflow programado de GitHub Actions a `/actuator/health` cada 10 min) o documentar el límite. Es de infraestructura: lo decide Manuel.

## Requisitos para desbloquear la Parada G4 (Manuel)

Para que Antigravity pueda proceder con la tarea **2.4 (Despliegue y pruebas en URLs reales)**, se requiere que Manuel cree las cuentas gratuitas y registre los siguientes secretos en el repositorio con `gh secret set`:

### 1. Cuentas requeridas (planes gratuitos, sin tarjeta requerida según documentación):
- **Netlify** (Free tier): para el alojamiento del frontend estático Angular y proxy inverso `/api/*` configurado en `netlify.toml`.
- **Render** (Free tier): para el Web Service en contenedor Docker de Spring Boot (`manuelklk03/digital-fit-backend:latest`).
- **Neon** (Free tier): base de datos PostgreSQL Serverless 17 con ramas `staging` y `main`.

### 2. Secretos de GitHub Actions a registrar (`gh secret set <NOMBRE>`):
- `RENDER_DEPLOY_HOOK`: URL del Deploy Hook del servicio web de Render (backend) para disparar el despliegue automático tras publicar la imagen en Docker Hub.
- `NETLIFY_AUTH_TOKEN`: Personal Access Token de Netlify para despliegues automáticos desde CI.
- `NETLIFY_SITE_ID`: ID del sitio creado en Netlify para vincular el repositorio.
- `NEON_DATABASE_URL`: Cadena de conexión JDBC PostgreSQL proporcionada por Neon para la base de datos de producción/staging (o `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`).


## Fallos de backend para Antigravity (G9, 2026-11-09) — Resueltos

1. **Longitud de textos DTO ≠ BD (Resuelto):** Creada la migración no destructiva `V6__ampliar_descripciones_y_comentarios.sql` que amplía a `VARCHAR(1500)` las columnas `descripcion` (entrenamientos base y de usuario, centros y lugares base y de usuario) y `valoraciones.comentario`. Actualizadas las anotaciones `@Column(length = 1500)` en entidades JPA. Creada la suite `LongitudCamposDtoVsEsquemaTest` y ampliada `FlywayMigrationScriptsTest` para garantizar la correspondencia. Claude ya puede subir los límites de los formularios a 1500 caracteres.
2. **`@Valid` en valoraciones (Resuelto):** Añadido `@Valid` en `@RequestBody CrearValoracionDTO` en `ValoracionRestController.crearOActualizar`. Verificada respuesta 400 `ProblemDetail` ante comentarios de más de 1500 caracteres y puntuaciones fuera del rango 1–5 en la suite `ValidacionRestControllersTest`.
3. **Contraseña de administrador y registro (Resuelto):** Añadido `@Size(min = 6)` a `CrearAdmin.password` y `UsuarioDTO.password` para rechazar contraseñas débiles de menos de 6 caracteres. Verificado con respuestas 400 `ProblemDetail` en `ValidacionRestControllersTest`.
4. **Búsqueda `q` en `GET /api/valoraciones/mis-valoraciones` (Resuelto):** Añadido parámetro opcional de consulta `q` en `GET /api/valoraciones/mis-valoraciones` que busca de manera insensible a mayúsculas sobre `comentario`, respetando paginación, orden por fecha descendente y aislamiento por usuario. Verificado en tests de repositorio, servicio e integración WebMvc.

## Fallos de backend para Antigravity (G8, 2026-11-09) — Resueltos

1. **Contraseñas demo rotas (Resuelto):** Creada la migración Flyway `V5__actualizar_hashes_demo.sql` con los hashes bcrypt válidos de `Admin123!` y `Usuario123!`. Añadida la suite `UsuariosDemoPasswordTest` que valida con `PasswordEncoder` la correspondencia con las credenciales documentadas en `docs/deployment.md`. Ampliada `FlywayMigrationScriptsTest` para validar V5.
2. **Recurso inexistente → 500 (Resuelto):** Añadido manejador para `NoResourceFoundException` en `GlobalExceptionHandler`, devolviendo `404 ProblemDetail` RFC 7807 uniforme. Verificado en `GlobalExceptionHandlerTest`.
3. **Búsqueda en el historial (Resuelto):** Incorporado el parámetro opcional `q` en `GET /api/entrenamientos/mi-historial`, con búsqueda insensible a mayúsculas sobre notas, nombre de rutinas y ubicaciones deportivas, respetando el orden por fecha descendente, paginación y aislamiento por usuario. Cubierto con tests de servicio y WebMvc. Claude ya puede añadir el campo de búsqueda en el frontend cuando lo requiera.

Ya corregido en el frontend (no requiere backend): los guards `authGuard` y `publicGuard` llamaban a `/api/auth/yo`, retirado en 4.1; ahora usan `/api/auth/me`.

## Contrato de la API paginada (para Claude — Adaptación de Frontend)

A partir de la tarea 4.8, todos los listados de colecciones del backend devuelven una estructura inmutable `PaginaResponse<T>` en sustitución de arrays directos.

### Estructura del DTO genérico `PaginaResponse<T>`

```json
{
  "content": [
    {
      "id": 1,
      "nombre": "Full Body Fuerza",
      "descripcion": "Rutina completa de fuerza y resistencia",
      "nivel": "PRINCIPIANTE",
      "categoria": "FUERZA_TOTAL",
      "duracionEnMinutos": 45
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Campos:
- `content` (`T[]`): Array con los elementos de la página actual.
- `page` (`number`): Índice de la página devuelta (basado en 0).
- `size` (`number`): Tamaño de la página (por defecto 20, máximo 100).
- `totalElements` (`number`): Cantidad total de elementos coincidentes en la base de datos.
- `totalPages` (`number`): Número total de páginas disponibles.

### Parámetros de consulta estándar (Query Params)

Todos los endpoints paginados aceptan los siguientes parámetros opcionales:
- `page`: Número de página solicitado (entero `>= 0`, por defecto `0`).
- `size`: Cantidad de elementos por página (entero `1` a `100`, por defecto `20`). Si se solicita un valor superior a `100`, el backend lo acota automáticamente a `100`.
- `sort`: Campo y dirección de ordenación en formato Spring Data (`campo,asc` o `campo,desc`).

### Endpoints paginados y filtros disponibles

| Endpoint | Método | Orden por defecto | Filtros opcionales (query params) | Descripción |
|---|---|---|---|---|
| `/api/entrenamientos` | GET | `nombre,asc` | `nombre`, `nivel`, `categoria`, `duracionEnMinutos` | Entrenamientos base del catálogo general |
| `/api/mis-entrenamientos` | GET | `id,desc` | `nombre`, `nivel`, `categoria`, `duracionEnMinutos` | Entrenamientos propios del usuario autenticado |
| `/api/entrenamientos-comunidad` | GET | `fechaPublicacion,desc` | `nombre`, `nivel`, `categoria`, `duracionEnMinutos` | Entrenamientos compartidos por la comunidad (`@EntityGraph` autor) |
| `/api/entrenamientos/mi-historial` | GET | `fechaHora,desc` | `q` (texto sobre rutina, ubicación y notas), `duracionMinutos`, `fecha` (ISO datetime) | Historial de entrenamientos completados (`@EntityGraph`) |
| `/api/centros-privados` | GET | `nombre,asc` | `nombre`, `direccion`, `precioMensual` | Centros deportivos base del catálogo |
| `/api/mis-centros-privados` | GET | `id,desc` | `nombre`, `direccion`, `precioMensual` | Centros deportivos propios del usuario |
| `/api/lugares-publicos` | GET | `nombre,asc` | `nombre`, `direccion`, `tipo` | Espacios públicos de entrenamiento (parques, calistenia) |
| `/api/mis-lugares-publicos` | GET | `id,desc` | `nombre`, `direccion`, `tipo` | Lugares públicos propios del usuario |
| `/api/valoraciones/publicas` | GET | `fecha,desc` | `categoria` (`TODOS`, `ENTRENAMIENTOS`, `CENTROS_PRIVADOS`, `LUGARES_PUBLICOS`) | Valoraciones públicas globales (`@EntityGraph` autor) |
| `/api/valoraciones/mis-valoraciones` | GET | `fecha,desc` | `q` (texto sobre comentario) | Valoraciones emitidas por el usuario autenticado |
| `/api/valoraciones/{tipoContenido}/{idContenido}` | GET | `fecha,desc` | Ninguno (parámetros en ruta) | Valoraciones asociadas a un recurso específico |

> **Nota para el frontend:** Los servicios Angular deben actualizar sus tipos de retorno de `Observable<T[]>` a `Observable<PaginaResponse<T>>`, extrayendo `.content` para el renderizado o integrando controles de paginación/scroll según corresponda en las fases 5.2 a 5.4.

