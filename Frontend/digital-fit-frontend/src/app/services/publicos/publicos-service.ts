import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginaResponse, PARAMS_PAGINA_COMPLETA, soloContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class PublicosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/lugares-publicos';

  getLugaresPublicos(): Observable<any[]> {
    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params: PARAMS_PAGINA_COMPLETA,
      withCredentials: true
    }).pipe(soloContenido());
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

    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params,
      withCredentials: true
    }).pipe(soloContenido());
  }

  getLugarPublicoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}