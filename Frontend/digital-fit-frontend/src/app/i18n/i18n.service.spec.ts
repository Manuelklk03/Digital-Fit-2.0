import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'es';
    TestBed.configureTestingModule({
      providers: [I18nService],
    });
    service = TestBed.inject(I18nService);
  });

  it('debe inicializarse con el idioma español por defecto', () => {
    expect(service.idiomaActual()).toBe('es');
    expect(service.t().nav.inicio).toBe('Inicio');
    expect(service.infoIdiomaActual().etiqueta).toBe('Español');
    expect(document.documentElement.lang).toBe('es');
  });

  it('debe listar los cuatro idiomas disponibles (es, ca, en, fr)', () => {
    expect(service.idiomas).toHaveLength(4);
    const codigos = service.idiomas.map((i) => i.codigo);
    expect(codigos).toEqual(['es', 'ca', 'en', 'fr']);
  });

  it('debe cambiar correctamente al valenciano (ca)', () => {
    service.cambiarIdioma('ca');
    expect(service.idiomaActual()).toBe('ca');
    expect(service.t().nav.inicio).toBe('Inici');
    expect(service.t().header.salir).toBe('Eixir');
    expect(service.infoIdiomaActual().abreviatura).toBe('VA');
    expect(document.documentElement.lang).toBe('ca');
    expect(localStorage.getItem('digitalfit_lang')).toBe('ca');
  });

  it('debe cambiar correctamente al inglés (en)', () => {
    service.cambiarIdioma('en');
    expect(service.idiomaActual()).toBe('en');
    expect(service.t().nav.inicio).toBe('Home');
    expect(service.t().header.salir).toBe('Sign out');
    expect(service.infoIdiomaActual().abreviatura).toBe('EN');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('digitalfit_lang')).toBe('en');
  });

  it('debe cambiar correctamente al francés (fr)', () => {
    service.cambiarIdioma('fr');
    expect(service.idiomaActual()).toBe('fr');
    expect(service.t().nav.inicio).toBe('Accueil');
    expect(service.t().header.salir).toBe('Déconnexion');
    expect(service.infoIdiomaActual().abreviatura).toBe('FR');
    expect(document.documentElement.lang).toBe('fr');
    expect(localStorage.getItem('digitalfit_lang')).toBe('fr');
  });

  it('no debe realizar cambios si se pasa el mismo idioma activo', () => {
    service.cambiarIdioma('es');
    expect(service.idiomaActual()).toBe('es');
  });

  it('debe recuperar el idioma guardado en localStorage al instanciarse', () => {
    localStorage.setItem('digitalfit_lang', 'en');
    const nuevoServicio = new I18nService();
    expect(nuevoServicio.idiomaActual()).toBe('en');
    expect(nuevoServicio.t().nav.inicio).toBe('Home');
  });

  it('debe descartar un valor inválido de localStorage y volver a español', () => {
    localStorage.setItem('digitalfit_lang', 'idioma_inexistente');
    const nuevoServicio = new I18nService();
    expect(nuevoServicio.idiomaActual()).toBe('es');
  });
});
