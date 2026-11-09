import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Cuerpo de `CrearAdmin` en el backend. */
export interface CrearAdmin {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin';

  /** El backend responde con un texto plano de confirmación. */
  crearAdmin(admin: CrearAdmin): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/crear-admin`,
      admin,
      {
        withCredentials: true,
        responseType: 'text'
      }
    );
  }
}
