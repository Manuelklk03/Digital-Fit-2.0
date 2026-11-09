import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PrivadosService } from './privados-service';

describe('PrivadosService', () => {
  let service: PrivadosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PrivadosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('pide la página más grande y devuelve solo el contenido', () => {
    let resultado: unknown[] | undefined;
    service.getCentrosPrivados().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/centros-privados');
    expect(req.request.params.get('size')).toBe('100');
    req.flush({ content: [{ id: 7 }], page: 0, size: 100, totalElements: 1, totalPages: 1 });

    expect(resultado).toEqual([{ id: 7 }]);
  });

  it('envía precioMensual, el nombre que espera el backend, junto con el tamaño', () => {
    service.getCentrosPrivadosFiltrados('gym', 'valencia', 30).subscribe();

    const req = http.expectOne((r) => r.url === '/api/centros-privados');
    expect(req.request.params.get('size')).toBe('100');
    expect(req.request.params.get('precioMensual')).toBe('30');
    req.flush({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });
  });
});
