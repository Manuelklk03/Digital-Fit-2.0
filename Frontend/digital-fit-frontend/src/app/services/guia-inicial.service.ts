import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

/** Preferencia local y por cuenta para mostrar la guía del Dashboard. */
@Injectable({ providedIn: 'root' })
export class GuiaInicialService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cambios = signal(new Map<string, boolean>());

  estaVisible(username: string): boolean {
    const actual = this.cambios().get(username);
    if (actual !== undefined) return actual;
    if (!isPlatformBrowser(this.platformId)) return false;

    try {
      return localStorage.getItem(this.clave(username)) !== 'oculta';
    } catch {
      return true;
    }
  }

  establecerVisible(username: string, visible: boolean): void {
    this.cambios.update((anteriores) => new Map(anteriores).set(username, visible));
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (visible) localStorage.removeItem(this.clave(username));
      else localStorage.setItem(this.clave(username), 'oculta');
    } catch {
      // La guía sigue funcionando durante esta sesión si el navegador bloquea el almacenamiento.
    }
  }

  private clave(username: string): string {
    return `digitalfit_guia_inicial_v1:${encodeURIComponent(username)}`;
  }
}
