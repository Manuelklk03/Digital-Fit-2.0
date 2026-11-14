import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ValoracionesService } from './valoraciones-service';

const VACIA = { content: [], page: 0, size: 12, totalElements: 0, totalPages: 0 };

describe('ValoracionesService', () => {
  let service: ValoracionesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ValoracionesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide la página indicada de mis valoraciones', () => {
    service.getPaginaMisValoraciones(2).subscribe();
    const req = http.expectOne((r) => r.url === '/api/valoraciones/mis-valoraciones');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('12');
    req.flush(VACIA);
  });

  it('filtra las públicas por categoría y la omite si no hay', () => {
    service.getPaginaPublicas('CENTROS_PRIVADOS').subscribe();
    expect(
      http.expectOne((r) => r.url === '/api/valoraciones/publicas').request.params.get('categoria'),
    ).toBe('CENTROS_PRIVADOS');

    service.getPaginaPublicas(null).subscribe();
    expect(
      http.expectOne((r) => r.url === '/api/valoraciones/publicas').request.params.has('categoria'),
    ).toBe(false);
  });

  it('crea o actualiza y borra por tipo y contenido', () => {
    service
      .crearOActualizarValoracion('LUGAR_PUBLICO_BASE', 3, { puntuacion: 4, comentario: null })
      .subscribe();
    const post = http.expectOne('/api/valoraciones/LUGAR_PUBLICO_BASE/3');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ puntuacion: 4, comentario: null });

    service.borrarValoracion('LUGAR_PUBLICO_BASE', 3).subscribe();
    expect(http.expectOne('/api/valoraciones/LUGAR_PUBLICO_BASE/3').request.method).toBe('DELETE');
  });
});
