import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import { aParametros } from '../../models/entrenamiento';
import { CentroPrivado, FiltroSitio } from '../../models/lugar';

@Injectable({
  providedIn: 'root'
})
export class PrivadosService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/centros-privados';

  getCentrosPrivados(): Observable<CentroPrivado[]> {
    return getContenido<CentroPrivado>(this.http, this.apiUrl);
  }

  buscar(filtro: FiltroSitio | null, page = 0): Observable<PaginaResponse<CentroPrivado>> {
    return getPagina<CentroPrivado>(this.http, this.apiUrl, aParametros(filtro), page);
  }

  getCentroPrivadoById(id: number): Observable<CentroPrivado> {
    return this.http.get<CentroPrivado>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
