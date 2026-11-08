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
