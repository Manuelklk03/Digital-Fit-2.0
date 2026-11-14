import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

/** Respuesta paginada del backend desde la tarea 4.8 (ver docs/HANDOFF.md). */
export interface PaginaResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Filtros opcionales de un listado: se omiten los vacíos (`undefined`, `null` o texto vacío). */
export type Filtros = Record<string, string | number | null | undefined>;

/** Tamaño máximo de página que acepta el backend; si se pide más, lo acota a 100. */
export const TAMANO_MAXIMO_PAGINA = 100;

/** Tamaño de página de las pantallas que paginan. */
export const TAMANO_PAGINA = 12;

/** GET de una página concreta de un listado, con sus filtros. */
export function getPagina<T>(
  http: HttpClient,
  url: string,
  filtros: Filtros = {},
  page = 0,
  size = TAMANO_PAGINA,
): Observable<PaginaResponse<T>> {
  let params = new HttpParams().set('page', page).set('size', size);
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return http.get<PaginaResponse<T>>(url, { params, withCredentials: true });
}

/**
 * GET de un listado paginado que devuelve solo el array `content`, para listas auxiliares (selects).
 * shortcut: devuelve como mucho 100 elementos; paginar o buscar en servidor si un select necesita más.
 */
export function getContenido<T = unknown>(
  http: HttpClient,
  url: string,
  filtros: Filtros = {},
): Observable<T[]> {
  return getPagina<T>(http, url, filtros, 0, TAMANO_MAXIMO_PAGINA).pipe(
    map((pagina) => pagina.content),
  );
}

/** Mensaje de un error HTTP: `detail` de ProblemDetail (RFC 7807), texto plano o el mensaje por defecto. */
export function mensajeError(err: unknown, porDefecto: string): string {
  let cuerpo = (err as { error?: unknown } | null)?.error;
  if (typeof cuerpo === 'string' && cuerpo.trim() !== '') {
    const texto = cuerpo;
    // Con responseType 'text', un ProblemDetail llega como JSON sin parsear.
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      return texto;
    }
    if (typeof cuerpo === 'string') {
      return cuerpo;
    }
  }
  const detalle = (cuerpo as { detail?: unknown } | null)?.detail;
  return typeof detalle === 'string' && detalle.trim() !== '' ? detalle : porDefecto;
}
