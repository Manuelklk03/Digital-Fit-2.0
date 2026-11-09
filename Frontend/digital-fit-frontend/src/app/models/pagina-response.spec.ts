import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getContenido, getPagina, mensajeError, TAMANO_MAXIMO_PAGINA } from './pagina-response';

describe('getContenido', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('pide el tamaño máximo, con credenciales, y devuelve solo el contenido', () => {
    let resultado: number[] | undefined;
    getContenido<number>(http, '/api/x').subscribe((r) => (resultado = r));

    const req = controller.expectOne((r) => r.url === '/api/x');
    expect(req.request.params.get('size')).toBe(String(TAMANO_MAXIMO_PAGINA));
    expect(req.request.withCredentials).toBe(true);
    req.flush({ content: [1, 2], page: 0, size: 100, totalElements: 2, totalPages: 1 });

    expect(resultado).toEqual([1, 2]);
  });

  it('envía los filtros con valor, incluido el 0, y omite los vacíos', () => {
    getContenido(http, '/api/x', { nombre: 'a', precio: 0, vacio: '', nulo: null, sin: undefined }).subscribe();

    const req = controller.expectOne((r) => r.url === '/api/x');
    expect(req.request.params.get('nombre')).toBe('a');
    expect(req.request.params.get('precio')).toBe('0');
    expect(req.request.params.has('vacio')).toBe(false);
    expect(req.request.params.has('nulo')).toBe(false);
    expect(req.request.params.has('sin')).toBe(false);
    req.flush({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });
  });
});

describe('getPagina', () => {
  it('envía página y tamaño indicados', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const controller = TestBed.inject(HttpTestingController);
    getPagina(TestBed.inject(HttpClient), '/api/x', { nombre: 'a' }, 3, 12).subscribe();

    const req = controller.expectOne((r) => r.url === '/api/x');
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('size')).toBe('12');
    expect(req.request.params.get('nombre')).toBe('a');
    req.flush({ content: [], page: 3, size: 12, totalElements: 0, totalPages: 0 });
    controller.verify();
  });
});

describe('mensajeError', () => {
  it('usa el detail de ProblemDetail, el texto plano o el mensaje por defecto', () => {
    expect(mensajeError({ error: { detail: 'Ya existe' } }, 'x')).toBe('Ya existe');
    expect(mensajeError({ error: 'Texto' }, 'x')).toBe('Texto');
    expect(mensajeError({ error: { detail: '  ' } }, 'x')).toBe('x');
    expect(mensajeError(null, 'x')).toBe('x');
    // responseType 'text': el ProblemDetail llega como JSON en texto.
    expect(mensajeError({ error: '{"detail":"Duplicado"}' }, 'x')).toBe('Duplicado');
    expect(mensajeError({ error: '"citado"' }, 'x')).toBe('citado');
  });
});
