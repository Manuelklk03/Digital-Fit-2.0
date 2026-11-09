import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class MisEntrenamientosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/mis-entrenamientos';

  getMisEntrenamientos(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getMisEntrenamientosFiltrados(
    categoria?: string,
    nivel?: string,
    duracionEnMinutos?: number,
    nombre?: string
  ): Observable<any[]> {
    return getContenido(this.http, this.apiUrl, {
      categoria: categoria?.toUpperCase().replaceAll(' ', '_'),
      nivel: nivel?.toUpperCase().replaceAll(' ', '_'),
      duracionEnMinutos,
      nombre
    });
  }

  getMiEntrenamientoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  crearEntrenamiento(entrenamiento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, entrenamiento, {
      withCredentials: true
    });
  }

  anadirDesdeBase(idBase: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/desde-base/${idBase}`, {}, {
      withCredentials: true
    });
  }

  anadirDesdeComunidad(idComunidad: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/desde-comunidad/${idComunidad}`, {}, {
      withCredentials: true
    });
  }

  borrarEntrenamiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}