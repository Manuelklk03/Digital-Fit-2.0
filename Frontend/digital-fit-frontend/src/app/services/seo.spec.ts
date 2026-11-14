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
          { path: 'login', data: { seo: 'login', migas: ['login'] }, children: [] },
          {
            path: 'mis-centros',
            data: { tituloNav: 'misCentros', migas: ['misCentros'] },
            children: [],
          },
          { path: 'sin-datos', children: [] },
          { path: 'detalle/:id', data: { migas: ['misCentros', 'detalle'] }, children: [] },
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
    // El documento y localStorage (donde se guarda el idioma) se comparten entre tests: se limpia lo que se ha tocado.
    localStorage.clear();
    doc.head.querySelector('link[rel="canonical"]')?.remove();
    doc.getElementById('ld-migas')?.remove();
    doc.head
      .querySelectorAll(
        'meta[name="description"], meta[name="robots"], meta[name="twitter:card"], meta[property^="og:"]',
      )
      .forEach((m) => m.remove());
  });

  it('una página pública se indexa, con su título, descripción y canónica', async () => {
    await irA('/inicio');

    expect(titulo.getTitle()).toBe(i18n.t().seo.inicio.titulo);
    expect(contenido('name="description"')).toBe(i18n.t().seo.inicio.descripcion);
    expect(contenido('name="robots"')).toBe('index, follow');
    expect(contenido('property="og:title"')).toBe(i18n.t().seo.inicio.titulo);
    expect(doc.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toContain(
      '/inicio',
    );
  });

  it('una página privada no se indexa, tiene título propio y no lleva canónica', async () => {
    await irA('/inicio');
    await irA('/mis-centros');

    expect(titulo.getTitle()).toBe(`${i18n.t().nav.misCentros} · Digital-FIT`);
    expect(contenido('name="robots"')).toBe('noindex, nofollow');
    expect(doc.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('sin título propio usa el camino de las migas, del último nivel al primero', async () => {
    await irA('/detalle/5');

    expect(titulo.getTitle()).toBe('Detalle · Mis centros · Digital-FIT');
    expect(contenido('name="robots"')).toBe('noindex, nofollow');
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

  it('una página pública con migas publica BreadcrumbList en JSON-LD con URLs absolutas', async () => {
    await irA('/login');

    const ld = JSON.parse(doc.getElementById('ld-migas')?.textContent ?? '{}');
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(
      ld.itemListElement.map((i: { position: number; name: string }) => [i.position, i.name]),
    ).toEqual([
      [1, 'Inicio'],
      [2, 'Iniciar sesión'],
    ]);
    expect(ld.itemListElement[0].item).toBe(`${doc.location.origin}/inicio`);
    expect(ld.itemListElement[1].item).toContain('/login');
  });

  it('las páginas privadas y las que no tienen migas no publican JSON-LD de migas', async () => {
    await irA('/login');
    await irA('/mis-centros');
    expect(doc.getElementById('ld-migas')).toBeNull();

    await irA('/inicio');
    expect(doc.getElementById('ld-migas')).toBeNull();
  });

  it('no marca como noindex antes de terminar la primera navegación', () => {
    TestBed.tick();

    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
