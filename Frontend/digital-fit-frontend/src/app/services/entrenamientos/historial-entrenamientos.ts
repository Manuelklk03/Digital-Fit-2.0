import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import {
  CrearHistorial,
  EntrenamientoUsuario,
  fechaParaBackend,
  HistorialEntrenamiento,
} from '../../models/entrenamiento';

@Injectable({
  providedIn: 'root'
})
export class HistorialEntrenamientosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/entrenamientos/mi-historial';

  getHistorial(): Observable<HistorialEntrenamiento[]> {
    return getContenido<HistorialEntrenamiento>(this.http, this.apiUrl);
  }

  /** Página del historial, del más reciente al más antiguo (orden por defecto del backend). */
  getPaginaHistorial(page = 0): Observable<PaginaResponse<HistorialEntrenamiento>> {
    return getPagina<HistorialEntrenamiento>(this.http, this.apiUrl, {}, page);
  }

  getHistorialById(id: number): Observable<HistorialEntrenamiento> {
    return this.http.get<HistorialEntrenamiento>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  crearRegistro(registro: CrearHistorial): Observable<HistorialEntrenamiento> {
    return this.http.post<HistorialEntrenamiento>(this.apiUrl, registro, {
      withCredentials: true
    });
  }

  crearRegistroDesdeMiEntrenamiento(entrenamiento: EntrenamientoUsuario): Observable<HistorialEntrenamiento> {
    return this.crearRegistro({
      entrenamientoBaseId: null,
      entrenamientoUsuarioId: entrenamiento.id,
      lugarPublicoBaseId: null,
      lugarPublicoUsuarioId: null,
      centroPrivadoBaseId: null,
      centroPrivadoUsuarioId: null,
      fecha: fechaParaBackend(),
      duracionEnMinutos: entrenamiento.duracionEnMinutos,
      notas: 'Entrenamiento realizado desde el detalle de "Mis entrenamientos".'
    });
  }

  borrarRegistro(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
