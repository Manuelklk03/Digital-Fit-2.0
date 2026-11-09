import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

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
    return getContenido(this.http, this.apiUrl, {
      nombre,
      direccion,
      precioMensual
    });
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