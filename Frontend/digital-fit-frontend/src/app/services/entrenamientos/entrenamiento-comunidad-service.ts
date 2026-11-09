import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import {
  aParametros,
  EntrenamientoComunidad,
  EntrenamientoForm,
  FiltroEntrenamiento,
} from '../../models/entrenamiento';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientosComunidadService {

  private http = inject(HttpClient);
  private apiUrl = '/api/entrenamientos-comunidad';

  getEntrenamientosComunidad(): Observable<EntrenamientoComunidad[]> {
    return getContenido<EntrenamientoComunidad>(this.http, this.apiUrl);
  }

  buscar(filtro: FiltroEntrenamiento | null, page = 0): Observable<PaginaResponse<EntrenamientoComunidad>> {
    return getPagina<EntrenamientoComunidad>(this.http, this.apiUrl, aParametros(filtro), page);
  }

  getEntrenamientoComunidadById(id: number): Observable<EntrenamientoComunidad> {
    return this.http.get<EntrenamientoComunidad>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  crearEntrenamientoComunidad(entrenamiento: EntrenamientoForm): Observable<EntrenamientoComunidad> {
    return this.http.post<EntrenamientoComunidad>(this.apiUrl, entrenamiento, {
      withCredentials: true
    });
  }

  actualizarEntrenamientoComunidad(id: number, entrenamiento: EntrenamientoForm): Observable<EntrenamientoComunidad> {
    return this.http.put<EntrenamientoComunidad>(`${this.apiUrl}/${id}`, entrenamiento, {
      withCredentials: true
    });
  }

  borrarEntrenamientoComunidad(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
