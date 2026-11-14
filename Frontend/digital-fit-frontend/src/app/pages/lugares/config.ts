import { Observable } from 'rxjs';
import { DiccionarioLugares } from '../../i18n/i18n.types';
import { PaginaResponse } from '../../models/pagina-response';
import { Autocompletado, ClaseSitio, FiltroSitio, Sitio, SitioForm } from '../../models/lugar';

/** Clave de los textos de cada pantalla en `i18n.t().lugares`. */
export type SeccionSitios = keyof Pick<
  DiccionarioLugares,
  'centrosBase' | 'lugaresBase' | 'misCentros' | 'misLugares'
>;

interface ConfigComun {
  clase: ClaseSitio;
  seccion: SeccionSitios;
  /**
   * Catálogo base: solo un ADMIN crea, edita y borra; el resto puede añadirlo a su lista.
   * Lista propia (`false`): el usuario crea desde el mapa y borra los suyos.
   */
  catalogo: boolean;
  borrar(id: number): Observable<unknown>;
  anadirAMis?(id: number): Observable<unknown>;
}

/** Lo que cambia entre los cuatro listados (centros/lugares × catálogo/propios). */
export interface ConfigListado extends ConfigComun {
  rutaDetalle: string;
  /** Desde la lista propia, enlace al catálogo cuando está vacía. */
  rutaCatalogo?: string;
  buscar(filtro: FiltroSitio | null, page: number): Observable<PaginaResponse<Sitio>>;
  crear(datos: SitioForm): Observable<unknown>;
  actualizar?(id: number, datos: SitioForm): Observable<unknown>;
  /** Rellena el formulario desde OpenStreetMap al marcar la ubicación (solo listas propias). */
  autocompletar?(latitud: number, longitud: number): Observable<Autocompletado>;
}

/** Lo que cambia entre los cuatro detalles. */
export interface ConfigDetalle extends ConfigComun {
  rutaListado: string;
  cargar(id: number): Observable<Sitio>;
}
