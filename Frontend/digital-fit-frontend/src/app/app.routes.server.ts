import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Solo las páginas públicas e indexables se generan como HTML en el build (coinciden con sitemap.xml).
 * El resto necesita sesión y datos de la API, así que se pinta en el navegador como hasta ahora.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'inicio', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
