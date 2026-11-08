import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EntrenamientosService } from './entrenamientos-service';

describe('EntrenamientosService', () => {
  let service: EntrenamientosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EntrenamientosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('pide la página más grande y devuelve solo el contenido', () => {
    let resultado: unknown[] | undefined;
    service.getEntrenamientos().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/entrenamientos');
    expect(req.request.params.get('size')).toBe('100');
    req.flush({ content: [{ id: 1 }], page: 0, size: 100, totalElements: 1, totalPages: 1 });

    expect(resultado).toEqual([{ id: 1 }]);
  });

  it('conserva los filtros y el tamaño al filtrar', () => {
    let resultado: unknown[] | undefined;
    service.getEntrenamientosFiltrados('fuerza total', 'principiante', 30, 'full').subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/entrenamientos');
    expect(req.request.params.get('size')).toBe('100');
    expect(req.request.params.get('categoria')).toBe('FUERZA_TOTAL');
    expect(req.request.params.get('nivel')).toBe('PRINCIPIANTE');
    expect(req.request.params.get('duracionEnMinutos')).toBe('30');
    expect(req.request.params.get('nombre')).toBe('full');
    req.flush({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });

    expect(resultado).toEqual([]);
  });
});
