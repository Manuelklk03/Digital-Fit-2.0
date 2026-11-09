import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = '/api/auth';

  private usuarioSubject = new BehaviorSubject<any | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  login(username: string, password: string): Observable<string> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(
      `${this.apiUrl}/login`,
      body.toString(),
      {
        headers,
        withCredentials: true,
        responseType: 'text'
      }
    );
  }

  registrar(usuario: any): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/registro`,
      usuario,
      {
        withCredentials: true,
        responseType: 'text'
      }
    );
  }

  me(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/me`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(usuario => this.usuarioSubject.next(usuario))
    );
  }

  logout(): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true,
        responseType: 'text'
      }
    ).pipe(
      tap(() => this.usuarioSubject.next(null))
    );
  }
}