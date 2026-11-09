# Relevo entre Claude y Antigravity

Cómo se coordinan las dos herramientas. Manuel hace de enlace: ninguna avisa a la otra directamente.

## Reparto

- **Claude:** SEO (3.9) y todo el frontend (fase 5, vistas nuevas, P1, P7, interceptor, auditoría de interfaz).
- **Antigravity:** todo lo demás (backend, DevOps, despliegue, tests E2E y de CI, revisión de backend, README, release).

Reglas comunes: cada herramienta trabaja en su rama, nunca en los mismos archivos a la vez. Mínimo 3 commits por PR. Sin atribución a IA en commits ni PR. Textos en español. Detalle en [AGENTS.md](../AGENTS.md).

## Cómo se usa este archivo

Al llegar a una parada, quien espera **no sigue**: escribe una línea `BLOQUEADO` en la tabla de abajo y se lo dice a Manuel. Quien debe resolverlo la cambia a `LIBRE` al terminar.

Formato de cada línea: `Parada | Estado | Espera a | Qué se necesita | Fecha`.

## Paradas

| Parada | Estado | Espera a | Qué se necesita |
|---|---|---|---|
| G1 | Resuelta | Antigravity → Claude | Tarea 4.8 completada (PR #62) y adaptada por Claude en frontend (PR #64) |
| G2 | Resuelta | Claude → Antigravity | Pantallas y servicios de soporte retirados en frontend (PR #65) y backend purgado con Flyway V4 (PR #66) |
| G3 | Resuelta | Claude → Antigravity | Confirmado: cero referencias residuales a soporte o tickets en frontend y backend |
| G4 | Pendiente | Manuel → Antigravity | Cuentas de Netlify, Render y Neon y secretos con `gh secret set`. Sin ellos no hay 2.3 ni 2.4 |
| G5 | LIBRE | Claude → Antigravity | Fase 5 cerrada: Antigravity puede hacer 6.2 (E2E) y 6.1 (CI) |
| G6 | LIBRE | Claude → Antigravity | Claude no tiene ramas abiertas tras fusionar `feat/recorrido-progreso`: Antigravity puede hacer 6.5 (Prettier) |
| G7 | Pendiente | Manuel → Antigravity | 7.3 (tag `v2.0.0`) solo con orden expresa de Manuel |
| G9 | LIBRE | Claude → Antigravity | Fallos de backend encontrados en los recorridos 3–5 (ver «Fallos de backend para Antigravity (G9)») |
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
| 2026-11-09 | G8 | Resuelta | Antigravity resolvió los 3 fallos de backend (V5 hashes demo, 404 NoResourceFoundException, y parámetro q en historial). Claude ya puede añadir la búsqueda del historial en frontend |

## Fallos de backend para Antigravity (G9, 2026-11-09)

1. **Longitud de textos DTO ≠ BD:** los DTO aceptan 1500 caracteres (`@Size(max = 1500)`) pero las columnas de `V1__esquema_inicial.sql` son `VARCHAR(1000)` en `descripcion` de entrenamientos base y de usuario, centros y lugares (base y de usuario) y en `valoraciones.comentario`. Un texto de 1001–1500 pasa la validación y falla al guardar (500). Opción recomendada: migración V6 que amplíe esas columnas a `VARCHAR(1500)` (no destructiva) y un test que compare DTO y esquema. El frontend limita hoy a 1000; Claude lo subirá a 1500 cuando esté hecho.
2. **`@Valid` en valoraciones:** `ValoracionRestController.crearOActualizar` no lleva `@Valid` en `@RequestBody CrearValoracionDTO`, así que el `@Size` del comentario no se aplica. Añadirlo y probar 400 ProblemDetail con comentario largo y puntuación fuera de 1–5.
3. **Contraseña de administrador:** `CrearAdmin.password` solo tiene `@NotBlank`; se puede crear un ADMIN con contraseña de 1 carácter por petición directa. Aplicar `@Size(min = 6)` (la regla del registro y del formulario) y revisar que `CrearUsuario`/registro tenga la misma.
4. **Opcional — búsqueda `q` en `GET /api/valoraciones/mis-valoraciones`:** la v1 filtraba en cliente; con la paginación ya no es posible. Mismo patrón que el `q` del historial.

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
| `/api/valoraciones/mis-valoraciones` | GET | `fecha,desc` | Ninguno | Valoraciones emitidas por el usuario autenticado |
| `/api/valoraciones/{tipoContenido}/{idContenido}` | GET | `fecha,desc` | Ninguno (parámetros en ruta) | Valoraciones asociadas a un recurso específico |

> **Nota para el frontend:** Los servicios Angular deben actualizar sus tipos de retorno de `Observable<T[]>` a `Observable<PaginaResponse<T>>`, extrayendo `.content` para el renderizado o integrando controles de paginación/scroll según corresponda en las fases 5.2 a 5.4.

