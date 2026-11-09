import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido, PARAMS_PAGINA_COMPLETA } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class ValoracionesService {

  private http = inject(HttpClient);
  private apiUrl = '/api/valoraciones';

  getMisValoraciones(): Observable<any[]> {
    return getContenido(this.http, `${this.apiUrl}/mis-valoraciones`);
  }

  getValoracionesPublicas(categoria?: string | null): Observable<any[]> {
    let params: HttpParams = PARAMS_PAGINA_COMPLETA;

    if (categoria && categoria !== 'TODOS') {
      params = params.set('categoria', categoria);
    }

    return getContenido(this.http, `${this.apiUrl}/publicas`, params);
  }

  getValoracionesPorContenido(tipoContenido: string, idContenido: number): Observable<any[]> {
    return getContenido(this.http, `${this.apiUrl}/${tipoContenido}/${idContenido}`);
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