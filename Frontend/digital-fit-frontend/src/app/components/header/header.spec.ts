import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import { HeaderComponent } from './header';
import { I18nService } from '../../i18n/i18n.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let i18nService: I18nService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), I18nService],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    i18nService = TestBed.inject(I18nService);
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe alternar la visibilidad del desplegable de idiomas', () => {
    expect(component.desplegableIdiomaAbierto).toBe(false);
    component.alternarDesplegableIdioma();
    expect(component.desplegableIdiomaAbierto).toBe(true);
    component.alternarDesplegableIdioma();
    expect(component.desplegableIdiomaAbierto).toBe(false);
  });

  it('debe cambiar de idioma al seleccionar una opción y cerrar el menú', () => {
    component.desplegableIdiomaAbierto = true;
    component.seleccionarIdioma('ca');
    expect(i18nService.idiomaActual()).toBe('ca');
    expect(component.desplegableIdiomaAbierto).toBe(false);

    component.seleccionarIdioma('en');
    expect(i18nService.idiomaActual()).toBe('en');

    component.seleccionarIdioma('fr');
    expect(i18nService.idiomaActual()).toBe('fr');
  });

  it('debe renderizar el botón selector con el idioma activo inicial', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const botonIdioma = compiled.querySelector('.boton-idioma');
    expect(botonIdioma).toBeTruthy();
    expect(botonIdioma?.textContent).toContain('ES');
  });

  it('con Escape cierra el menú de idiomas y devuelve el foco al botón', () => {
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const boton = fixture.nativeElement.querySelector('.boton-idioma') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.menu-idiomas')).toBeTruthy();

    fixture.nativeElement.querySelector('.opcion-idioma').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.menu-idiomas')).toBeNull();
    expect(document.activeElement).toBe(boton);
    fixture.nativeElement.remove();
  });

  it('cierra el menú de idiomas al pulsar fuera, pero no al pulsar dentro', () => {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.boton-idioma').click();
    fixture.detectChanges();
    expect(component.desplegableIdiomaAbierto).toBe(true);

    fixture.nativeElement.querySelector('.menu-idiomas').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.desplegableIdiomaAbierto).toBe(true);

    document.body.click();
    expect(component.desplegableIdiomaAbierto).toBe(false);
  });
});
