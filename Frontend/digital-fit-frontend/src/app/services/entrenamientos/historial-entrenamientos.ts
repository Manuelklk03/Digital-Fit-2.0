import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getContenido } from '../../models/pagina-response';

@Injectable({
  providedIn: 'root'
})
export class HistorialEntrenamientosService {

  private http = inject(HttpClient);
  private apiUrl = '/api/entrenamientos/mi-historial';

  getHistorial(): Observable<any[]> {
    return getContenido(this.http, this.apiUrl);
  }

  getHistorialById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }

  crearRegistro(registro: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, registro, {
      withCredentials: true
    });
  }

  crearRegistroDesdeMiEntrenamiento(entrenamiento: any): Observable<any> {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    const payload = {
      entrenamientoBaseId: null,
      entrenamientoUsuarioId: entrenamiento.id,
      lugarPublicoBaseId: null,
      lugarPublicoUsuarioId: null,
      centroPrivadoBaseId: null,
      centroPrivadoUsuarioId: null,
      fecha: `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`,
      duracionEnMinutos: entrenamiento.duracionEnMinutos ?? 0,
      notas: `Entrenamiento realizado desde el detalle de "Mis entrenamientos".`
    };

    return this.http.post<any>(this.apiUrl, payload, {
      withCredentials: true
    });
  }

  borrarRegistro(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}
