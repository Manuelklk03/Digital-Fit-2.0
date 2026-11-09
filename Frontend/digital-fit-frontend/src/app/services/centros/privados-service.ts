import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, PARAMS_PAGINA_COMPLETA } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class PrivadosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/centros-privados';

  getCentrosPrivados(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getCentrosPrivadosFiltrados(
    nombre?: string,
    direccion?: string,
    precioMensual?: number
  ): Observable<any[]> {
    let params = PARAMS_PAGINA_COMPLETA;

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (direccion) {
      params = params.set('direccion', direccion);
    }

    if (precioMensual !== undefined) {
      params = params.set('precioMensual', precioMensual.toString());
    }

    return getContenido(this.http, this.apiUrl, params);
  }

  getCentroPrivadoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}