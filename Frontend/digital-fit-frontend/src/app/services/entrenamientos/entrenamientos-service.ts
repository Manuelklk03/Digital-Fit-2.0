import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, PARAMS_PAGINA_COMPLETA } from '../../models/pagina-response';

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
    let params = PARAMS_PAGINA_COMPLETA;

    if (categoria) {
      params = params.set('categoria', categoria.toUpperCase().replaceAll(' ', '_'));
    }

    if (nivel) {
      params = params.set('nivel', nivel.toUpperCase().replaceAll(' ', '_'));
    }

    if (duracionEnMinutos !== undefined) {
      params = params.set('duracionEnMinutos', duracionEnMinutos.toString());
    }

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    return getContenido(this.http, this.apiUrl, params);
  }

  getEntrenamientoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}