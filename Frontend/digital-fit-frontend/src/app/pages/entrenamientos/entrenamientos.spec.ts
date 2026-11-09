import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EntrenamientosComponent } from './entrenamientos';

const BASE = { id: 1, nombre: 'Full body', descripcion: 'd', categoria: 'FUERZA_TOTAL', nivel: 'PRINCIPIANTE', duracionEnMinutos: 40 };

describe('EntrenamientosComponent', () => {
  let fixture: ComponentFixture<EntrenamientosComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenamientosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EntrenamientosComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  const listado = () => http.expectOne((r) => r.url === '/api/entrenamientos');
  const sesion = (rol: 'USER' | 'ADMIN') =>
    http.match('/api/auth/me').forEach((r) => r.flush({ username: 'u', email: 'u@x.es', rol }));

  it('muestra esqueletos mientras carga y luego las tarjetas', () => {
    sesion('USER');
    expect(fixture.nativeElement.querySelectorAll('.esqueleto').length).toBeGreaterThan(0);

    listado().flush({ content: [BASE], page: 0, size: 12, totalElements: 1, totalPages: 1 });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('app-tarjeta-entrenamiento').length).toBe(1);
    expect(el.textContent).toContain('Full body');
    expect(el.textContent).toContain('Añadir a mis entrenamientos');
  });

  it('muestra el estado de error con reintento', () => {
    sesion('USER');
    listado().flush('fallo', { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.estado-error [df-button]')).toBeTruthy();
    fixture.nativeElement.querySelector('.estado-error button').click();
    listado().flush({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0 });
  });

  it('distingue el vacío con filtro y envía un solo filtro', () => {
    sesion('USER');
    listado().flush({ content: [BASE], page: 0, size: 12, totalElements: 1, totalPages: 1 });

    fixture.componentInstance.filtrar({ campo: 'nivel', valor: 'EXPERTO' });
    const req = listado();
    expect(req.request.params.get('nivel')).toBe('EXPERTO');
    expect(req.request.params.get('page')).toBe('0');
    req.flush({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0 });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ningún entrenamiento coincide con el filtro.');
  });

  it('muestra editar y borrar solo al administrador', () => {
    sesion('ADMIN');
    listado().flush({ content: [BASE], page: 0, size: 12, totalElements: 1, totalPages: 1 });
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Editar');
    expect(texto).toContain('Nuevo entrenamiento');
    expect(texto).not.toContain('Añadir a mis entrenamientos');
  });
});
