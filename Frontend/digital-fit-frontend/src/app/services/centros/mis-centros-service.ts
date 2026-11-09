import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginaResponse, PARAMS_PAGINA_COMPLETA, soloContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class MisCentrosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/mis-centros-privados';

  getMisCentros(): Observable<any[]> {
    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params: PARAMS_PAGINA_COMPLETA,
      withCredentials: true
    }).pipe(soloContenido());
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

    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params,
      withCredentials: true
    }).pipe(soloContenido());
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