import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

import { SeoService } from './seo';
import { I18nService } from '../i18n/i18n.service';

describe('SeoService', () => {
  let router: Router;
  let titulo: Title;
  let meta: Meta;
  let doc: Document;
  let i18n: I18nService;

  const contenido = (selector: string) => meta.getTag(selector)?.content;

  async function irA(url: string): Promise<void> {
    await router.navigateByUrl(url);
    TestBed.tick();
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'inicio', data: { seo: 'inicio' }, children: [] },
          { path: 'login', data: { seo: 'login' }, children: [] },
          { path: 'mis-centros', data: { tituloNav: 'misCentros' }, children: [] },
          { path: 'sin-datos', children: [] },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    titulo = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
    i18n = TestBed.inject(I18nService);
    TestBed.inject(SeoService);
  });

  afterEach(() => {
    // El documento se comparte entre tests: se limpia lo que añade el servicio.
    doc.head.querySelector('link[rel="canonical"]')?.remove();
    doc.head.querySelectorAll('meta[name="description"], meta[name="robots"], meta[name="twitter:card"], meta[property^="og:"]').forEach((m) => m.remove());
  });

  it('una página pública se indexa, con su título, descripción y canónica', async () => {
    await irA('/inicio');

    expect(titulo.getTitle()).toBe(i18n.t().seo.inicio.titulo);
    expect(contenido('name="description"')).toBe(i18n.t().seo.inicio.descripcion);
    expect(contenido('name="robots"')).toBe('index, follow');
    expect(contenido('property="og:title"')).toBe(i18n.t().seo.inicio.titulo);
    expect(doc.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toContain('/inicio');
  });

  it('una página privada no se indexa, tiene título propio y no lleva canónica', async () => {
    await irA('/inicio');
    await irA('/mis-centros');

    expect(titulo.getTitle()).toBe(`${i18n.t().nav.misCentros} · Digital-FIT`);
    expect(contenido('name="robots"')).toBe('noindex, nofollow');
    expect(doc.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('una ruta sin datos es privada y usa solo la marca como título', async () => {
    await irA('/sin-datos');

    expect(titulo.getTitle()).toBe('Digital-FIT');
    expect(contenido('name="robots"')).toBe('noindex, nofollow');
  });

  it('al cambiar de idioma se actualizan el título y la descripción', async () => {
    await irA('/login');
    const enEspanol = titulo.getTitle();

    i18n.cambiarIdioma('en');
    TestBed.tick();

    expect(titulo.getTitle()).toBe(i18n.t().seo.login.titulo);
    expect(titulo.getTitle()).not.toBe(enEspanol);
    expect(contenido('name="description"')).toBe(i18n.t().seo.login.descripcion);
  });

  it('no marca como noindex antes de terminar la primera navegación', () => {
    TestBed.tick();

    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
