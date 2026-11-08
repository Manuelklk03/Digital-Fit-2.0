import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginaResponse, PARAMS_PAGINA_COMPLETA, soloContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class EntrenamientosComunidadService {

  private http = inject(HttpClient);
  private apiUrl = '/api/entrenamientos-comunidad';

  getEntrenamientosComunidad(): Observable<any[]> {
    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params: PARAMS_PAGINA_COMPLETA,
      withCredentials: true
    }).pipe(soloContenido());
  }

  getEntrenamientosComunidadFiltrados(
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

    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params,
      withCredentials: true
    }).pipe(soloContenido());
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