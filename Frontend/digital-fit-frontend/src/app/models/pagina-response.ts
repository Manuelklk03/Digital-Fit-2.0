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

/**
 * GET de un listado paginado que devuelve solo el array `content`, para las pantallas que aún no paginan.
 * shortcut: devuelve como mucho 100 elementos; paginar en pantalla (recorridos 5.2-5.4) cuando haya más.
 */
export function getContenido<T = unknown>(http: HttpClient, url: string, filtros: Filtros = {}): Observable<T[]> {
  let params = new HttpParams().set('size', TAMANO_MAXIMO_PAGINA);
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return http
    .get<PaginaResponse<T>>(url, { params, withCredentials: true })
    .pipe(map((pagina) => pagina.content));
}
