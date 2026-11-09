import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, getPagina, PaginaResponse } from '../../models/pagina-response';
import { aParametros } from '../../models/entrenamiento';
import { FiltroSitio, LugarPublico } from '../../models/lugar';

@Injectable({
  providedIn: 'root'
})
export class PublicosService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/lugares-publicos';

  getLugaresPublicos(): Observable<LugarPublico[]> {
    return getContenido<LugarPublico>(this.http, this.apiUrl);
  }

  buscar(filtro: FiltroSitio | null, page = 0): Observable<PaginaResponse<LugarPublico>> {
    return getPagina<LugarPublico>(this.http, this.apiUrl, aParametros(filtro), page);
  }

  getLugarPublicoById(id: number): Observable<LugarPublico> {
    return this.http.get<LugarPublico>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
