import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { UsuarioSesion } from '../models/entrenamiento';

/** Cuerpo de `POST /api/auth/registro`. */
export interface RegistroUsuario {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/api/auth';

  private usuarioSubject = new BehaviorSubject<UsuarioSesion | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  login(username: string, password: string): Observable<string> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post(`${this.apiUrl}/login`, body.toString(), {
      headers,
      withCredentials: true,
      responseType: 'text',
    });
  }

  registrar(usuario: RegistroUsuario): Observable<string> {
    return this.http.post(`${this.apiUrl}/registro`, usuario, {
      withCredentials: true,
      responseType: 'text',
    });
  }

  me(): Observable<UsuarioSesion> {
    // Al prerenderizar en el build no hay backend ni cookie: se pinta como visitante anónimo.
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Sin sesión al prerenderizar'));
    }
    return this.http
      .get<UsuarioSesion>(`${this.apiUrl}/me`, {
        withCredentials: true,
      })
      .pipe(tap((usuario) => this.usuarioSubject.next(usuario)));
  }

  logout(): Observable<string> {
    return this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          withCredentials: true,
          responseType: 'text',
        },
      )
      .pipe(tap(() => this.usuarioSubject.next(null)));
  }
}
