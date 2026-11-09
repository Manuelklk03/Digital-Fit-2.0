import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, PARAMS_PAGINA_COMPLETA } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class MisCentrosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/mis-centros-privados';

  getMisCentros(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getMisCentrosFiltrados(
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

  getMiCentroById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  autocompletarDatosCentro(latitud: number, longitud: number): Observable<any> {
    const params = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString());

    return this.http.get<any>(`${this.apiUrl}/autocompletar`, {
      params,
      withCredentials: true
    });
  }

  crearCentroDesdeMaps(centro: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/centros-maps`, centro, {
      withCredentials: true
    });
  }

  anadirCentroDesdeApp(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/centros-app/${id}`, {}, {
      withCredentials: true
    });
  }

  borrarCentro(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}