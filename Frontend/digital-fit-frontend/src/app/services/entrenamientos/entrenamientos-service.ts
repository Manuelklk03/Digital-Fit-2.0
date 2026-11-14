import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import { aParametros, EntrenamientoBase, FiltroEntrenamiento } from '../../models/entrenamiento';

@Injectable({
  providedIn: 'root',
})
export class EntrenamientosService {
  private http = inject(HttpClient);
  private apiUrl = '/api/entrenamientos';

  getEntrenamientos(): Observable<EntrenamientoBase[]> {
    return getContenido<EntrenamientoBase>(this.http, this.apiUrl);
  }

  buscar(
    filtro: FiltroEntrenamiento | null,
    page = 0,
  ): Observable<PaginaResponse<EntrenamientoBase>> {
    return getPagina<EntrenamientoBase>(this.http, this.apiUrl, aParametros(filtro), page);
  }

  getEntrenamientoById(id: number): Observable<EntrenamientoBase> {
    return this.http.get<EntrenamientoBase>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
