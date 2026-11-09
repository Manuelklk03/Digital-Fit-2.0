import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginaResponse, PARAMS_PAGINA_COMPLETA, soloContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class MisLugaresService {

  private http = inject(HttpClient);
  private apiUrl = '/api/mis-lugares-publicos';

  getMisLugares(): Observable<any[]> {
    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params: PARAMS_PAGINA_COMPLETA,
      withCredentials: true
    }).pipe(soloContenido());
  }

  getMisLugaresFiltrados(
    nombre?: string,
    direccion?: string,
    tipo?: string
  ): Observable<any[]> {
    let params = PARAMS_PAGINA_COMPLETA;

    if (nombre) {
      params = params.set('nombre', nombre);
    }

    if (direccion) {
      params = params.set('direccion', direccion);
    }

    if (tipo) {
      params = params.set('tipo', tipo.toUpperCase().replaceAll(' ', '_'));
    }

    return this.http.get<PaginaResponse<any>>(this.apiUrl, {
      params,
      withCredentials: true
    }).pipe(soloContenido());
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
