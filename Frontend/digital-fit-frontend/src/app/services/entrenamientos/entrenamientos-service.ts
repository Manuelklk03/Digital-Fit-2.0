import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/entrenamientos';

  getEntrenamientos(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getEntrenamientosFiltrados(
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

  getEntrenamientoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}