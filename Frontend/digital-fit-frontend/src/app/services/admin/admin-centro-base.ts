import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CentroForm, CentroPrivado } from '../../models/lugar';

@Injectable({
  providedIn: 'root'
})
export class AdminCentrosPrivadosBaseService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/centros-privados-base';

  crearCentroPrivadoBase(centro: CentroForm): Observable<CentroPrivado> {
    return this.http.post<CentroPrivado>(this.apiUrl, centro, {
      withCredentials: true
    });
  }

  actualizarCentroPrivadoBase(id: number, centro: CentroForm): Observable<CentroPrivado> {
    return this.http.put<CentroPrivado>(`${this.apiUrl}/${id}`, centro, {
      withCredentials: true
    });
  }

  borrarCentroPrivadoBase(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
