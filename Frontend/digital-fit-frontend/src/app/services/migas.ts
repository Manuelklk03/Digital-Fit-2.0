import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { DiccionarioTraduccion } from '../i18n/i18n.types';

/** Páginas que pueden aparecer en las migas; cada una tiene su texto en `migas` del diccionario. */
export type ClaveMiga = Exclude<keyof DiccionarioTraduccion['migas'], 'etiqueta'>;

export interface Miga {
  texto: string;
  /** Sin ruta: es la página actual (o un nivel sin pantalla propia, como «Detalle»). */
  ruta?: string;
}

/** Ruta a la que enlaza cada nivel. «detalle» no tiene: depende del identificador. */
const RUTAS: Partial<Record<ClaveMiga, string>> = {
  inicio: '/inicio',
  entrenamientos: '/entrenamientos',
  comunidad: '/entrenamientos-comunidad',
  historial: '/historial-entrenamientos',
  misEntrenamientos: '/mis-entrenamientos',
  centros: '/privados',
  lugares: '/publicos',
  misCentros: '/mis-centros',
  misLugares: '/mis-lugares',
  progreso: '/estadisticas',
  valoraciones: '/valoraciones',
  crearAdmin: '/admin/crear-admin',
  login: '/login',
  registro: '/register',
};

/**
 * Migas de pan de la ruta activa. Cada ruta declara en `data.migas` su camino (sin «Inicio», que se antepone);
 * sin `migas`, no hay migas. Lo usan el componente visible y el JSON-LD `BreadcrumbList` de SeoService.
 */
@Injectable({ providedIn: 'root' })
export class MigasService {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly claves = signal<ClaveMiga[]>([]);

  readonly migas = computed<Miga[]>(() => {
    const claves = this.claves();
    if (claves.length === 0) {
      return [];
    }
    const t = this.i18n.t().migas;
    const camino: Miga[] = [{ texto: t.inicio, ruta: RUTAS.inicio }];
    claves.forEach((clave, i) => camino.push({ texto: t[clave], ruta: i < claves.length - 1 ? RUTAS[clave] : undefined }));
    return camino;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.claves.set(this.clavesDeLaRuta()));
  }

  private clavesDeLaRuta(): ClaveMiga[] {
    let ruta = this.router.routerState.snapshot.root;
    let claves: ClaveMiga[] = (ruta.data['migas'] as ClaveMiga[] | undefined) ?? [];
    while (ruta.firstChild) {
      ruta = ruta.firstChild;
      claves = (ruta.data['migas'] as ClaveMiga[] | undefined) ?? claves;
    }
    return claves;
  }
}
