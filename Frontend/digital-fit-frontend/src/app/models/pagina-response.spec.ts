import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getContenido, PARAMS_PAGINA_COMPLETA, TAMANO_MAXIMO_PAGINA } from './pagina-response';

describe('getContenido', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('pide el tamaño máximo por defecto, con credenciales, y devuelve solo el contenido', () => {
    let resultado: number[] | undefined;
    getContenido<number>(http, '/api/x').subscribe((r) => (resultado = r));

    const req = controller.expectOne((r) => r.url === '/api/x');
    expect(req.request.params.get('size')).toBe(String(TAMANO_MAXIMO_PAGINA));
    expect(req.request.withCredentials).toBe(true);
    req.flush({ content: [1, 2], page: 0, size: 100, totalElements: 2, totalPages: 1 });

    expect(resultado).toEqual([1, 2]);
  });

  it('usa los parámetros indicados en lugar de los de por defecto', () => {
    getContenido(http, '/api/x', PARAMS_PAGINA_COMPLETA.set('nombre', 'a')).subscribe();

    const req = controller.expectOne((r) => r.url === '/api/x');
    expect(req.request.params.get('nombre')).toBe('a');
    req.flush({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });
  });
});
