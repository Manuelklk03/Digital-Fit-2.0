import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import { aParametros } from '../../models/entrenamiento';
import { Autocompletado, CentroForm, CentroPrivado, FiltroSitio } from '../../models/lugar';

@Injectable({
  providedIn: 'root'
})
export class MisCentrosService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/mis-centros-privados';

  getMisCentros(): Observable<CentroPrivado[]> {
    return getContenido<CentroPrivado>(this.http, this.apiUrl);
  }

  buscar(filtro: FiltroSitio | null, page = 0): Observable<PaginaResponse<CentroPrivado>> {
    return getPagina<CentroPrivado>(this.http, this.apiUrl, aParametros(filtro), page);
  }

  getMiCentroById(id: number): Observable<CentroPrivado> {
    return this.http.get<CentroPrivado>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  autocompletarDatosCentro(latitud: number, longitud: number): Observable<Autocompletado> {
    const params = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString());

    return this.http.get<Autocompletado>(`${this.apiUrl}/autocompletar`, {
      params,
      withCredentials: true
    });
  }

  crearCentroDesdeMaps(centro: CentroForm): Observable<CentroPrivado> {
    return this.http.post<CentroPrivado>(`${this.apiUrl}/centros-maps`, centro, {
      withCredentials: true
    });
  }

  anadirCentroDesdeApp(id: number): Observable<CentroPrivado> {
    return this.http.post<CentroPrivado>(`${this.apiUrl}/centros-app/${id}`, {}, {
      withCredentials: true
    });
  }

  borrarCentro(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
