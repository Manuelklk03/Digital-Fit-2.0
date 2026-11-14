import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntrenamientoBase, EntrenamientoForm } from '../../models/entrenamiento';

@Injectable({
  providedIn: 'root',
})
export class AdminEntrenamientosBaseService {
  private http = inject(HttpClient);
  private apiUrl = '/api/admin/entrenamientos-base';

  crearEntrenamientoBase(entrenamiento: EntrenamientoForm): Observable<EntrenamientoBase> {
    return this.http.post<EntrenamientoBase>(this.apiUrl, entrenamiento, {
      withCredentials: true,
    });
  }

  actualizarEntrenamientoBase(
    id: number,
    entrenamiento: EntrenamientoForm,
  ): Observable<EntrenamientoBase> {
    return this.http.put<EntrenamientoBase>(`${this.apiUrl}/${id}`, entrenamiento, {
      withCredentials: true,
    });
  }

  borrarEntrenamientoBase(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
