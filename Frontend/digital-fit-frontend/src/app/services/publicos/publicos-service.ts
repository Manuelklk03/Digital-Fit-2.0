import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, PARAMS_PAGINA_COMPLETA } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class PublicosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/lugares-publicos';

  getLugaresPublicos(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getLugaresPublicosFiltrados(
    nombre?: string,
    direccion?: string,
    tipo?: string
  ): Observable<any[]> {
    let params = PARAMS_PAGINA_COMPLETA;

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (direccion) {
      params = params.set('direccion', direccion);
    }

    if (tipo) {
      params = params.set('tipo', tipo.toUpperCase().replaceAll(' ', '_'));
    }

    return getContenido(this.http, this.apiUrl, params);
  }

  getLugarPublicoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}