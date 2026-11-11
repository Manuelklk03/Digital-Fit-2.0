import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Footer } from './footer';
import { I18nService } from '../../i18n/i18n.service';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let i18n: I18nService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    i18n = TestBed.inject(I18nService);
    fixture.detectChanges();
  });

  const texto = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('enlaza a las pantallas principales, al código y a la licencia del mapa', () => {
    const hrefs = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('a')).map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual(expect.arrayContaining(['/inicio', '/explorar', '/entrenar']));
    expect(hrefs).toContain('https://github.com/Manuelklk03/Digital-Fit-2.0');
    expect(hrefs).toContain('https://www.openstreetmap.org/copyright');
  });

  it('muestra el año actual y no usa el símbolo ®', () => {
    expect(texto()).toContain(`© ${new Date().getFullYear()} Digital-FIT`);
    expect(texto()).not.toContain('®');
  });

  it('cambia de texto al cambiar de idioma', () => {
    expect(texto()).toContain('seguimiento deportivo');

    i18n.cambiarIdioma('en');
    fixture.detectChanges();

    expect(texto()).toContain('training tracking');
    expect(texto()).not.toContain('seguimiento deportivo');
  });
});
