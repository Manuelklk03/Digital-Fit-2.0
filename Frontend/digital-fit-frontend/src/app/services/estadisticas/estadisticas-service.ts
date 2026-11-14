import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadisticaUsuario } from '../../models/progreso';

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/estadisticas';

  getEstadisticas(): Observable<EstadisticaUsuario> {
    return this.http.get<EstadisticaUsuario>(this.apiUrl, {
      withCredentials: true,
    });
  }
}
