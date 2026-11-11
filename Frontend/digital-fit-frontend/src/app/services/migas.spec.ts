import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { MigasComponent } from '../components/migas/migas';
import { I18nService } from '../i18n/i18n.service';
import { MigasService } from './migas';

@Component({ imports: [MigasComponent], template: '<app-migas />' })
class HostComponent {}

describe('Migas de pan', () => {
  let router: Router;
  let i18n: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'mis-centros/:id', data: { migas: ['misCentros', 'detalle'] }, children: [] },
          { path: 'sin-migas', children: [] },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    i18n = TestBed.inject(I18nService);
  });

  it('el servicio antepone Inicio, enlaza los niveles con ruta y deja la página actual sin enlace', async () => {
    const servicio = TestBed.inject(MigasService);
    await router.navigateByUrl('/mis-centros/5');

    expect(servicio.migas()).toEqual([
      { texto: 'Inicio', ruta: '/inicio' },
      { texto: 'Mis centros', ruta: '/mis-centros' },
      { texto: 'Detalle', ruta: undefined },
    ]);
  });

  it('sin data.migas no hay migas', async () => {
    const servicio = TestBed.inject(MigasService);
    await router.navigateByUrl('/sin-migas');

    expect(servicio.migas()).toEqual([]);
  });

  it('el componente pinta una navegación con enlaces y la página actual con aria-current', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await router.navigateByUrl('/mis-centros/5');
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav.migas') as HTMLElement;
    expect(nav.getAttribute('aria-label')).toBe(i18n.t().migas.etiqueta);
    expect(Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual(['/inicio', '/mis-centros']);
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toContain('Detalle');
  });

  it('el componente no pinta nada si la ruta no declara migas', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await router.navigateByUrl('/sin-migas');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('cambia de texto al cambiar de idioma', async () => {
    const servicio = TestBed.inject(MigasService);
    await router.navigateByUrl('/mis-centros/5');

    i18n.cambiarIdioma('en');

    expect(servicio.migas().map((m) => m.texto)).toEqual(['Home', 'My centres', 'Details']);
  });
});
