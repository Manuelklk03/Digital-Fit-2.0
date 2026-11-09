import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginaResponse, PARAMS_PAGINA_COMPLETA, soloContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class ValoracionesService {

  private http = inject(HttpClient);
  private apiUrl = '/api/valoraciones';

  getMisValoraciones(): Observable<any[]> {
    return this.http.get<PaginaResponse<any>>(`${this.apiUrl}/mis-valoraciones`, {
      params: PARAMS_PAGINA_COMPLETA,
      withCredentials: true
    }).pipe(soloContenido());
  }

  getValoracionesPublicas(categoria?: string | null): Observable<any[]> {
    let params: HttpParams = PARAMS_PAGINA_COMPLETA;

    if (categoria && categoria !== 'TODOS') {
      params = params.set('categoria', categoria);
    }

    return this.http.get<PaginaResponse<any>>(`${this.apiUrl}/publicas`, {
      params,
      withCredentials: true
    }).pipe(soloContenido());
  }

  getValoracionesPorContenido(tipoContenido: string, idContenido: number): Observable<any[]> {
    return this.http.get<PaginaResponse<any>>(`${this.apiUrl}/${tipoContenido}/${idContenido}`, {
      params: PARAMS_PAGINA_COMPLETA,
      withCredentials: true
    }).pipe(soloContenido());
  }

  crearOActualizarValoracion(tipoContenido: string, idContenido: number, valoracion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${tipoContenido}/${idContenido}`, valoracion, {
      withCredentials: true
    });
  }

  borrarValoracion(tipoContenido: string, idContenido: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${tipoContenido}/${idContenido}`, {
      withCredentials: true
    });
  }
}