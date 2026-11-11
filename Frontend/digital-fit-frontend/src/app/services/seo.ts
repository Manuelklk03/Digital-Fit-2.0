import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../i18n/i18n.service';
import { MigasService } from './migas';
import { DiccionarioTraduccion } from '../i18n/i18n.types';

/** Datos que una ruta declara en `data` para el SEO. Sin `seo`, la ruta es privada y no se indexa. */
export interface DatosSeo {
  /** Página pública indexable: sus textos están en `seo` del diccionario. */
  seo?: keyof DiccionarioTraduccion['seo'];
  /** Clave de `nav` que da el título de una página privada (accesibilidad: cada página con su título). */
  tituloNav?: keyof DiccionarioTraduccion['nav'];
}

const MARCA = 'Digital-FIT';

/**
 * Título, descripción, `robots`, canónica y Open Graph según la ruta activa y el idioma.
 * shortcut: se aplica en el cliente con JavaScript (Googlebot lo ejecuta); un prerender estático (`@angular/ssr`) lo serviría ya en el HTML.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly titulo = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);
  private readonly migas = inject(MigasService);
  /** `null` hasta que termina la primera navegación: así una página pública no queda marcada `noindex` al arrancar. */
  private readonly datos = signal<DatosSeo | null>(null);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.datos.set(this.datosDeLaRuta()));

    effect(() => {
      const datos = this.datos();
      if (datos) {
        this.aplicar(datos, this.i18n.t());
      }
    });
  }

  private datosDeLaRuta(): DatosSeo {
    let ruta = this.router.routerState.snapshot.root;
    let datos: DatosSeo = { ...ruta.data };
    while (ruta.firstChild) {
      ruta = ruta.firstChild;
      datos = { ...datos, ...ruta.data };
    }
    return datos;
  }

  private aplicar(datos: DatosSeo, t: DiccionarioTraduccion): void {
    const publica = datos.seo !== undefined;
    const pagina = datos.seo ? t.seo[datos.seo] : null;
    // Sin título propio, se usa el camino de las migas sin «Inicio», del último nivel al primero: «Detalle · Mis centros».
    const delCamino = this.migas.migas().slice(1).map((m) => m.texto).reverse().join(' · ');
    const titulo = pagina?.titulo ?? (datos.tituloNav ? `${t.nav[datos.tituloNav]} · ${MARCA}` : delCamino ? `${delCamino} · ${MARCA}` : MARCA);
    const descripcion = pagina?.descripcion ?? t.seo.inicio.descripcion;
    const url = `${this.doc.location.origin}${this.router.url.split(/[?#]/)[0]}`;

    this.titulo.setTitle(titulo);
    this.meta.updateTag({ name: 'description', content: descripcion });
    this.meta.updateTag({ name: 'robots', content: publica ? 'index, follow' : 'noindex, nofollow' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: MARCA });
    this.meta.updateTag({ property: 'og:title', content: titulo });
    this.meta.updateTag({ property: 'og:description', content: descripcion });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.canonica(publica ? url : null);
    this.jsonLdMigas(publica ? url : null);
  }

  /** Mantiene un único `<link rel="canonical">` en las páginas indexables y lo quita en las privadas. */
  private canonica(url: string | null): void {
    let enlace = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (url === null) {
      enlace?.remove();
      return;
    }
    if (!enlace) {
      enlace = this.doc.createElement('link');
      enlace.rel = 'canonical';
      this.doc.head.appendChild(enlace);
    }
    enlace.href = url;
  }

  /**
   * `BreadcrumbList` en JSON-LD solo en páginas públicas con al menos dos niveles (Inicio y la página);
   * en las privadas no tiene sentido porque no se indexan.
   */
  private jsonLdMigas(urlActual: string | null): void {
    const id = 'ld-migas';
    this.doc.getElementById(id)?.remove();
    const migas = this.migas.migas();
    if (urlActual === null || migas.length < 2) {
      return;
    }
    const origen = this.doc.location.origin;
    const script = this.doc.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: migas.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: m.texto,
        item: m.ruta ? `${origen}${m.ruta}` : urlActual,
      })),
    });
    this.doc.head.appendChild(script);
  }
}
