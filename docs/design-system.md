# Sistema de diseño — Digital-Fit 2.0

Estado: **sin definir**. Este documento fija el método y los criterios; la dirección visual concreta se decide en la fase 3 ([roadmap.md](roadmap.md#fase-3--producto-navegación-y-sistema-visual)) y se registra aquí cuando se apruebe.

## Punto de partida (v1.0.0)

- CSS propio por componente y un `styles.css` global de 718 líneas, sin tokens ni componentes compartidos.
- Imágenes de stock en `public/img` (hero, gimnasios, parques) y logotipo en PNG.
- Sin revisión de accesibilidad documentada. `index.html` con `lang="en"`.

## Objetivos

- Identidad deportiva con personalidad propia, no una plantilla genérica.
- Jerarquía clara: lo primero que ve cada pantalla es la acción o el dato principal (el próximo entrenamiento, el mapa, el progreso).
- Móvil primero: el público usa la aplicación entrenando o en la calle.
- Accesible: contraste AA, foco visible, teclado, etiquetas, `prefers-reduced-motion`.
- Estados reales en cada vista: carga, error, vacío y éxito.

## Qué evitar (antislop)

Degradados y brillos decorativos, rejillas de tarjetas iguales para todo, animaciones sin función, iconos genéricos en cada título, textos vacíos («Lleva tu entrenamiento al siguiente nivel»), métricas inventadas y testimonios falsos. Los textos describen lo que la aplicación hace de verdad.

## Método

1. `frontend-stack` decide qué skill lidera cada parte (dirección, tipografía, color, movimiento) y resuelve conflictos entre ellas. Apoyan `impeccable`, `frontend-design`, `taste`, `ui-ux-pro-max`, `emil-design-eng` e `imagegen-skills`.
2. Propuestas de dirección visual comparables (2–3) antes de escribir componentes.
3. Una **pantalla representativa** implementada y revisada antes de extender el sistema al resto.
4. Tokens en variables CSS (`--color-*`, `--space-*`, `--font-*`, `--radius-*`, `--motion-*`) en `styles.css`; componentes base en Angular que los consumen.
5. Revisión con `antislop` (diseño y textos) y `frontend-stack:ui-reviewer` en cada recorrido.

## Dependencias de interfaz

Se instala cada una solo cuando se usa, explicando su función. Criterios: compatibilidad con Angular, mantenimiento, licencia, peso y accesibilidad. No se introduce React (decisión D6).

| Herramienta | Encaje con Angular | Uso previsto |
|---|---|---|
| GSAP | Librería de JS sin framework: compatible | Transiciones con función, respetando `prefers-reduced-motion` |
| Lenis | JS sin framework: compatible | Solo si hay páginas largas de contenido; no en formularios ni en el mapa |
| shadcn/ui | Componentes de React: **no** se usa directamente | Referencia visual; alternativas Angular a evaluar: Angular CDK, Spartan UI (port de shadcn a Angular) |
| React Bits | Componentes de React: **no** compatible | Solo como referencia de ideas |
| Leaflet | Ya instalado | Mapa; revisar estilos de teselas y atribución |

La compatibilidad, licencia y mantenimiento de cada alternativa se comprueban en el momento de instalarla; esta tabla no sustituye esa comprobación.

## Decisiones visuales

_Pendiente de la fase 3._
