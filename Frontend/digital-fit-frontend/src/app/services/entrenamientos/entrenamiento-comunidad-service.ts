import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientosComunidadService {

  private http = inject(HttpClient);
  private apiUrl = '/api/entrenamientos-comunidad';

  getEntrenamientosComunidad(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getEntrenamientosComunidadFiltrados(
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

  getEntrenamientoComunidadById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  crearEntrenamientoComunidad(entrenamiento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, entrenamiento, {
      withCredentials: true
    });
  }

  actualizarEntrenamientoComunidad(id: number, entrenamiento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, entrenamiento, {
      withCredentials: true
    });
  }

  borrarEntrenamientoComunidad(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}