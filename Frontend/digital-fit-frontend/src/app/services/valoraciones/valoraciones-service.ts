import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getPagina, PaginaResponse } from '../../models/pagina-response';
import {
  CategoriaValoracion,
  CrearValoracion,
  TipoValoracion,
  Valoracion,
} from '../../models/progreso';

@Injectable({
  providedIn: 'root',
})
export class ValoracionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/valoraciones';

  getPaginaMisValoraciones(page = 0): Observable<PaginaResponse<Valoracion>> {
    return getPagina<Valoracion>(this.http, `${this.apiUrl}/mis-valoraciones`, {}, page);
  }

  /** Sin categoría devuelve las de todos los tipos. */
  getPaginaPublicas(
    categoria: CategoriaValoracion | null,
    page = 0,
  ): Observable<PaginaResponse<Valoracion>> {
    return getPagina<Valoracion>(this.http, `${this.apiUrl}/publicas`, { categoria }, page);
  }

  /** Crea la valoración o, si el usuario ya valoró ese contenido, la sustituye. */
  crearOActualizarValoracion(
    tipo: TipoValoracion,
    idContenido: number,
    valoracion: CrearValoracion,
  ): Observable<Valoracion> {
    return this.http.post<Valoracion>(`${this.apiUrl}/${tipo}/${idContenido}`, valoracion, {
      withCredentials: true,
    });
  }

  borrarValoracion(tipo: TipoValoracion, idContenido: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${tipo}/${idContenido}`, {
      withCredentials: true,
    });
  }
}
