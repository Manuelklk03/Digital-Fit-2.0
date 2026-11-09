import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class PublicosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/lugares-publicos';

  getLugaresPublicos(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getLugaresPublicosFiltrados(
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

  getLugarPublicoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}