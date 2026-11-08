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
| G1 | LIBRE | Antigravity → Claude | Tarea 4.8 completada. Contrato de API paginada documentado abajo. Listo para que Claude adapte el frontend |
| G2 | Pendiente | Claude → Antigravity | Antigravity no retira el backend de tickets hasta que Claude quite las pantallas de soporte |
| G3 | Pendiente | Claude → Antigravity | Claude confirma que no queda ninguna llamada a `/api/soporte` en el frontend |
| G4 | Pendiente | Manuel → Antigravity | Cuentas de Netlify, Render y Neon y secretos con `gh secret set`. Sin ellos no hay 2.3 ni 2.4 |
| G5 | Pendiente | Claude → Antigravity | 6.2 (E2E) espera a que Claude cierre todo el frontend |
| G6 | Pendiente | Claude → Antigravity | 6.5 (Prettier) espera a que Claude no tenga ramas abiertas |
| G7 | Pendiente | Manuel → Antigravity | 7.3 (tag `v2.0.0`) solo con orden expresa de Manuel |

## Registro de avisos

Añade aquí cada `BLOQUEADO` y `LIBRE` con fecha.

| Fecha | Parada | Estado | Nota |
|---|---|---|---|
| 2026-11-09 | G1 | LIBRE | Tarea 4.8 completada y fusionada (PR #62). Contrato de API paginada publicado para que Claude adapte el frontend |

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
| `/api/entrenamientos/mi-historial` | GET | `fechaHora,desc` | `duracionMinutos`, `fecha` (ISO datetime) | Historial de entrenamientos completados (`@EntityGraph`) |
| `/api/centros-privados` | GET | `nombre,asc` | `nombre`, `direccion`, `precioMaximo` | Centros deportivos base del catálogo |
| `/api/mis-centros-privados` | GET | `id,desc` | `nombre`, `direccion`, `precioMaximo` | Centros deportivos propios del usuario |
| `/api/lugares-publicos` | GET | `nombre,asc` | `nombre`, `direccion`, `tipo` | Espacios públicos de entrenamiento (parques, calistenia) |
| `/api/mis-lugares-publicos` | GET | `id,desc` | `nombre`, `direccion`, `tipo` | Lugares públicos propios del usuario |
| `/api/valoraciones/publicas` | GET | `fecha,desc` | `categoria` (`TODOS`, `ENTRENAMIENTOS`, `CENTROS_PRIVADOS`, `LUGARES_PUBLICOS`) | Valoraciones públicas globales (`@EntityGraph` autor) |
| `/api/valoraciones/mis-valoraciones` | GET | `fecha,desc` | Ninguno | Valoraciones emitidas por el usuario autenticado |
| `/api/valoraciones/{tipoContenido}/{idContenido}` | GET | `fecha,desc` | Ninguno (parámetros en ruta) | Valoraciones asociadas a un recurso específico |

> **Nota para el frontend:** Los servicios Angular deben actualizar sus tipos de retorno de `Observable<T[]>` a `Observable<PaginaResponse<T>>`, extrayendo `.content` para el renderizado o integrando controles de paginación/scroll según corresponda en las fases 5.2 a 5.4.

