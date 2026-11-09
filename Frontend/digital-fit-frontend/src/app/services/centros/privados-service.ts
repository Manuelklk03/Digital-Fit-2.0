import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class PrivadosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/centros-privados';

  getCentrosPrivados(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getCentrosPrivadosFiltrados(
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

  getCentroPrivadoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}