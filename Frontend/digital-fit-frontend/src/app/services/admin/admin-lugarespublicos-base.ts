import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LugarForm, LugarPublico } from '../../models/lugar';

@Injectable({
  providedIn: 'root'
})
export class AdminLugaresPublicosBaseService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/lugares-publicos-base';

  crearLugarPublicoBase(lugar: LugarForm): Observable<LugarPublico> {
    return this.http.post<LugarPublico>(this.apiUrl, lugar, {
      withCredentials: true
    });
  }

  actualizarLugarPublicoBase(id: number, lugar: LugarForm): Observable<LugarPublico> {
    return this.http.put<LugarPublico>(`${this.apiUrl}/${id}`, lugar, {
      withCredentials: true
    });
  }

  borrarLugarPublicoBase(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
