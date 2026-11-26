import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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

  // El idioma se guarda en localStorage: sin limpiarlo, otros specs del mismo proceso arrancarían en inglés.
  afterEach(() => localStorage.clear());

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

    fixture.nativeElement
      .querySelector('.opcion-idioma')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
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

    fixture.nativeElement
      .querySelector('.menu-idiomas')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.desplegableIdiomaAbierto).toBe(true);

    document.body.click();
    expect(component.desplegableIdiomaAbierto).toBe(false);
  });

  it('abre el menú de navegación y actualiza aria-expanded', () => {
    fixture.detectChanges();
    const boton = fixture.nativeElement.querySelector('.boton-menu') as HTMLButtonElement;
    expect(boton.getAttribute('aria-expanded')).toBe('false');

    boton.click();
    fixture.detectChanges();
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.menu-navegacion.abierto')).not.toBeNull();

    component.cerrarMenuNavegacion();
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    expect(boton.getAttribute('aria-expanded')).toBe('false');
  });

  it('cierra el menú de navegación con Escape y devuelve el foco al botón', () => {
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const boton = fixture.nativeElement.querySelector('.boton-menu') as HTMLButtonElement;
    boton.click();
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector('.menu-navegacion a')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(component.menuNavegacionAbierto).toBe(false);
    expect(document.activeElement).toBe(boton);
    fixture.nativeElement.remove();
  });

  it('muestra el acceso al Dashboard solo a usuarios normales', () => {
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    const enlaces = () => fixture.nativeElement.querySelectorAll('nav a[href="/dashboard"]');
    expect(enlaces().length).toBe(0);

    http.expectOne('/api/auth/me').flush({
      username: 'manuel',
      email: 'manuel@example.test',
      rol: 'USER',
    });
    expect(component.usuarioActual?.rol).toBe('USER');
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    expect(fixture.nativeElement.textContent).toContain('Mi espacio');
    expect(enlaces().length).toBe(1);

    component.usuarioActual = { username: 'admin', email: 'admin@example.test', rol: 'ADMIN' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    expect(enlaces().length).toBe(0);
  });

  it('muestra las cinco vistas a USER y solo administración y perfil a ADMIN', () => {
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/me').flush({
      username: 'deportista',
      email: 'user@example.test',
      rol: 'USER',
    });
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    const rutas = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll('nav a') as NodeListOf<HTMLAnchorElement>,
      ).map((a) => a.getAttribute('href'));
    expect(rutas()).toEqual(['/dashboard', '/entrenar', '/explorar', '/progreso', '/perfil']);

    component.usuarioActual = { username: 'admin', email: 'admin@example.test', rol: 'ADMIN' };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    expect(rutas()).toEqual(['/perfil', '/admin/crear-admin']);
  });
});
