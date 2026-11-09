import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import { aParametros } from '../../models/entrenamiento';
import { Autocompletado, FiltroSitio, LugarForm, LugarPublico } from '../../models/lugar';

@Injectable({
  providedIn: 'root'
})
export class MisLugaresService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/mis-lugares-publicos';

  getMisLugares(): Observable<LugarPublico[]> {
    return getContenido<LugarPublico>(this.http, this.apiUrl);
  }

  buscar(filtro: FiltroSitio | null, page = 0): Observable<PaginaResponse<LugarPublico>> {
    return getPagina<LugarPublico>(this.http, this.apiUrl, aParametros(filtro), page);
  }

  getMiLugarById(id: number): Observable<LugarPublico> {
    return this.http.get<LugarPublico>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  autocompletarDatosLugar(latitud: number, longitud: number): Observable<Autocompletado> {
    const params = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString());

    return this.http.get<Autocompletado>(`${this.apiUrl}/autocompletar`, {
      params,
      withCredentials: true
    });
  }

  crearLugarDesdeMaps(lugar: LugarForm): Observable<LugarPublico> {
    return this.http.post<LugarPublico>(this.apiUrl, lugar, {
      withCredentials: true
    });
  }

  anadirLugarDesdeBase(idBase: number): Observable<LugarPublico> {
    return this.http.post<LugarPublico>(`${this.apiUrl}/base/${idBase}`, {}, {
      withCredentials: true
    });
  }

  borrarLugar(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
