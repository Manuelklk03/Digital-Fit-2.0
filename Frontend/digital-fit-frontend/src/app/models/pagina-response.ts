import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs';

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

/**
 * Pide la página más grande posible. Sirve a las pantallas que aún no paginan.
 * shortcut: devuelve como mucho 100 elementos; paginar en pantalla (recorridos 5.2-5.4) cuando haya más.
 */
export const PARAMS_PAGINA_COMPLETA = new HttpParams().set('size', TAMANO_MAXIMO_PAGINA);

/** Extrae el array de una `PaginaResponse` para no cambiar a los consumidores. */
export const soloContenido = <T>() => map((pagina: PaginaResponse<T>) => pagina.content);
