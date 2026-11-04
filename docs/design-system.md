# Sistema de diseño — Digital-Fit 2.0

Estado: **Dirección visual definida (2026-11-04, Tarea 3.3)**. La dirección aprobada es **Neutral Sport / Industrial**, con la pantalla de **Asistente de Entrenar** como modelo representativo.

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
| GSAP | Librería de JS sin framework: compatible | Transiciones con función, respetando `prefers-reduced-motion`. Con ScrollTrigger, solo en la portada `/inicio` (D15) |
| Lenis | JS sin framework: compatible | Solo si hay páginas largas de contenido; no en formularios ni en el mapa. Previsto únicamente en la portada `/inicio` (D15) |
| shadcn/ui | Componentes de React: **no** se usa directamente | Referencia visual; alternativas Angular a evaluar: Angular CDK, Spartan UI (port de shadcn a Angular) |
| React Bits | Componentes de React: **no** compatible | Solo como referencia de ideas |
| Leaflet | Ya instalado | Mapa; revisar estilos de teselas y atribución |

La compatibilidad, licencia y mantenimiento de cada alternativa se comprueban en el momento de instalarla; esta tabla no sustituye esa comprobación.

## Decisiones visuales (Tarea 3.3)

### 1. Dirección: Neutral Sport / Industrial
- **Concepto:** Estética técnica, funcional y precisa inspirada en instrumentación de alto rendimiento deportivo (Whoop, Strava Pro).
- **Paleta y superficies:** Fondos oscuros grafito (`--df-bg`), tarjetas elevadas (`--df-surface`) y acentos de color aplicados con función semántica (estados de serie, descansos, métricas activas), evitando brillos o gradientes ornamentales (*antislop*).

### 2. Tipografía base y técnica
- **Familia principal:** `Inter` (soporte de números tabulares para cronómetros y pesos, alta legibilidad en pantallas móviles bajo fatiga física). Fallback al sistema: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Sustitución de Arial:** Se descarta definitivamente `Arial` heredado de la v1 (resuelve los 2 avisos Stylelint en `styles.css`).
- **Datos numéricos:** Uso de `font-mono` o variantes numéricas tabulares (`tnum`) para tiempos de descanso, pesos y repeticiones para evitar saltos de línea al cambiar dígitos.

### 3. Tarjetas y contenedores (adiós `border-left` v1)
- **Estructura:** Borde perimetral fino (`1px solid var(--df-border)`), esquinas con radio estándar (`rounded-xl` / `12px`) y contraste mediante tono de superficie.
- **Sustitución de `border-left: 4px solid`:** Se eliminan los acentos laterales gruesos de la v1 (resuelve los 3 avisos Stylelint en `styles.css`). Las categorías o estados se comunican mediante **chips/badges semánticos discretos** integrados en la cabecera de la tarjeta.

### 4. Pantalla representativa de referencia
- **Pantalla elegida:** **Asistente de Entrenar en vivo (`/entrenar`)**.
- **Elementos clave que valida:**
  - Cronómetro regresivo de descanso con tipografía tabular legible de un vistazo.
  - Tarjeta de ejercicio activo con selectores táctiles de peso y repeticiones.
  - Botones de acción principal (siguiente serie, finalizar sesión) con estados de foco y contraste accesible.
