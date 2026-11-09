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

/** Tamaño máximo de página que acepta el backend; si se pide más, lo acota a 100. */
export const TAMANO_MAXIMO_PAGINA = 100;

/** Parámetros que piden la página más grande posible. */
export const PARAMS_PAGINA_COMPLETA = new HttpParams().set('size', TAMANO_MAXIMO_PAGINA);

/**
 * GET de un listado paginado que devuelve solo el array `content`, para las pantallas que aún no paginan.
 * shortcut: devuelve como mucho 100 elementos; paginar en pantalla (recorridos 5.2-5.4) cuando haya más.
 */
export function getContenido<T = unknown>(
  http: HttpClient,
  url: string,
  params: HttpParams = PARAMS_PAGINA_COMPLETA
): Observable<T[]> {
  return http
    .get<PaginaResponse<T>>(url, { params, withCredentials: true })
    .pipe(map((pagina) => pagina.content));
}
