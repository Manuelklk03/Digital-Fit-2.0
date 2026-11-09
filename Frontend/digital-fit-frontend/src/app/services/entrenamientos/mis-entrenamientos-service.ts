import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import {
  aParametros,
  EntrenamientoForm,
  EntrenamientoUsuario,
  FiltroEntrenamiento,
} from '../../models/entrenamiento';

@Injectable({
  providedIn: 'root'
})
export class MisEntrenamientosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/mis-entrenamientos';

  getMisEntrenamientos(): Observable<EntrenamientoUsuario[]> {
    return getContenido<EntrenamientoUsuario>(this.http, this.apiUrl);
  }

  buscar(filtro: FiltroEntrenamiento | null, page = 0): Observable<PaginaResponse<EntrenamientoUsuario>> {
    return getPagina<EntrenamientoUsuario>(this.http, this.apiUrl, aParametros(filtro), page);
  }

  getMiEntrenamientoById(id: number): Observable<EntrenamientoUsuario> {
    return this.http.get<EntrenamientoUsuario>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  crearEntrenamiento(entrenamiento: EntrenamientoForm): Observable<EntrenamientoUsuario> {
    return this.http.post<EntrenamientoUsuario>(this.apiUrl, entrenamiento, {
      withCredentials: true
    });
  }

  anadirDesdeBase(idBase: number): Observable<EntrenamientoUsuario> {
    return this.http.post<EntrenamientoUsuario>(`${this.apiUrl}/desde-base/${idBase}`, {}, {
      withCredentials: true
    });
  }

  anadirDesdeComunidad(idComunidad: number): Observable<EntrenamientoUsuario> {
    return this.http.post<EntrenamientoUsuario>(`${this.apiUrl}/desde-comunidad/${idComunidad}`, {}, {
      withCredentials: true
    });
  }

  borrarEntrenamiento(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
