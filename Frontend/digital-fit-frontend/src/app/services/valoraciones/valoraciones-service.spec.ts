import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ValoracionesService } from './valoraciones-service';

const PAGINA_VACIA = { content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 };

describe('ValoracionesService', () => {
  let service: ValoracionesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ValoracionesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('mis valoraciones devuelve solo el contenido y pide el tamaño máximo', () => {
    let resultado: unknown[] | undefined;
    service.getMisValoraciones().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/valoraciones/mis-valoraciones');
    expect(req.request.params.get('size')).toBe('100');
    req.flush({ ...PAGINA_VACIA, content: [{ id: 3 }], totalElements: 1, totalPages: 1 });

    expect(resultado).toEqual([{ id: 3 }]);
  });

  it('las públicas envían la categoría, salvo TODOS', () => {
    service.getValoracionesPublicas('ENTRENAMIENTOS').subscribe();
    const conCategoria = http.expectOne((r) => r.url === '/api/valoraciones/publicas');
    expect(conCategoria.request.params.get('categoria')).toBe('ENTRENAMIENTOS');
    expect(conCategoria.request.params.get('size')).toBe('100');
    conCategoria.flush(PAGINA_VACIA);

    service.getValoracionesPublicas('TODOS').subscribe();
    const todos = http.expectOne((r) => r.url === '/api/valoraciones/publicas');
    expect(todos.request.params.has('categoria')).toBe(false);
    todos.flush(PAGINA_VACIA);
  });

  it('las de un contenido usan la ruta con tipo e id', () => {
    service.getValoracionesPorContenido('ENTRENAMIENTOS', 5).subscribe();

    const req = http.expectOne((r) => r.url === '/api/valoraciones/ENTRENAMIENTOS/5');
    expect(req.request.params.get('size')).toBe('100');
    req.flush(PAGINA_VACIA);
  });
});
