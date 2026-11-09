import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class MisLugaresService {

  private http = inject(HttpClient);
  private apiUrl = '/api/mis-lugares-publicos';

  getMisLugares(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getMisLugaresFiltrados(
    nombre?: string,
    direccion?: string,
    tipo?: string
  ): Observable<any[]> {
    return getContenido(this.http, this.apiUrl, {
      nombre,
      direccion,
      tipo: tipo?.toUpperCase().replaceAll(' ', '_')
    });
  }

  getMiLugarById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  autocompletarDatosLugar(latitud: number, longitud: number): Observable<any> {
    const params = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString());

    return this.http.get<any>(`${this.apiUrl}/autocompletar`, {
      params,
      withCredentials: true
    });
  }

  crearLugarDesdeMaps(lugar: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, lugar, {
      withCredentials: true
    });
  }

  anadirLugarDesdeBase(idBase: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/base/${idBase}`, {}, {
      withCredentials: true
    });
  }

  borrarLugar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
