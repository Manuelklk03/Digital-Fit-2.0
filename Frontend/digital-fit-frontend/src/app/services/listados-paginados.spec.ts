import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';

import { EntrenamientosService } from './entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from './entrenamientos/mis-entrenamientos-service';
import { EntrenamientosComunidadService } from './entrenamientos/entrenamiento-comunidad-service';
import { HistorialEntrenamientosService } from './entrenamientos/historial-entrenamientos';
import { PrivadosService } from './centros/privados-service';
import { MisCentrosService } from './centros/mis-centros-service';
import { PublicosService } from './publicos/publicos-service';
import { MisLugaresService } from './publicos/mis-lugares';

type Metodo = (...args: unknown[]) => Observable<unknown[]>;

interface Caso {
  servicio: Type<object>;
  url: string;
  lista: string;
}

// Los listados auxiliares (selects) piden size=100 y devuelven solo `content`.
const CASOS: Caso[] = [
  { servicio: EntrenamientosService, url: '/api/entrenamientos', lista: 'getEntrenamientos' },
  {
    servicio: MisEntrenamientosService,
    url: '/api/mis-entrenamientos',
    lista: 'getMisEntrenamientos',
  },
  {
    servicio: EntrenamientosComunidadService,
    url: '/api/entrenamientos-comunidad',
    lista: 'getEntrenamientosComunidad',
  },
  {
    servicio: HistorialEntrenamientosService,
    url: '/api/entrenamientos/mi-historial',
    lista: 'getHistorial',
  },
  { servicio: PrivadosService, url: '/api/centros-privados', lista: 'getCentrosPrivados' },
  { servicio: MisCentrosService, url: '/api/mis-centros-privados', lista: 'getMisCentros' },
  { servicio: PublicosService, url: '/api/lugares-publicos', lista: 'getLugaresPublicos' },
  { servicio: MisLugaresService, url: '/api/mis-lugares-publicos', lista: 'getMisLugares' },
];

describe('Servicios con listados paginados', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  for (const caso of CASOS) {
    describe(caso.servicio.name, () => {
      it('pide la página más grande y devuelve solo el contenido', () => {
        const servicio = TestBed.inject(caso.servicio) as unknown as Record<string, Metodo>;
        let resultado: unknown[] | undefined;

        servicio[caso.lista]().subscribe((r) => (resultado = r));

        const req = http.expectOne((r) => r.url === caso.url);
        expect(req.request.params.get('size')).toBe('100');
        req.flush({ content: [{ id: 1 }], page: 0, size: 100, totalElements: 1, totalPages: 1 });
        expect(resultado).toEqual([{ id: 1 }]);
      });
    });
  }

  // Las pantallas de entrenamientos paginan: un único filtro por petición, como aplica el backend.
  const PAGINADOS: { servicio: Type<object>; url: string }[] = [
    { servicio: EntrenamientosService, url: '/api/entrenamientos' },
    { servicio: MisEntrenamientosService, url: '/api/mis-entrenamientos' },
    { servicio: EntrenamientosComunidadService, url: '/api/entrenamientos-comunidad' },
    { servicio: PrivadosService, url: '/api/centros-privados' },
    { servicio: MisCentrosService, url: '/api/mis-centros-privados' },
    { servicio: PublicosService, url: '/api/lugares-publicos' },
    { servicio: MisLugaresService, url: '/api/mis-lugares-publicos' },
  ];

  for (const caso of PAGINADOS) {
    it(`${caso.servicio.name}.buscar pide la página indicada con un solo filtro`, () => {
      const servicio = TestBed.inject(caso.servicio) as unknown as {
        buscar: (f: { campo: string; valor: string } | null, page: number) => Observable<unknown>;
      };

      servicio.buscar({ campo: 'categoria', valor: 'HIIT' }, 2).subscribe();

      const req = http.expectOne((r) => r.url === caso.url);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('12');
      expect(req.request.params.get('categoria')).toBe('HIIT');
      expect(req.request.params.keys().sort()).toEqual(['categoria', 'page', 'size']);
      req.flush({ content: [], page: 2, size: 12, totalElements: 0, totalPages: 0 });
    });
  }

  it('HistorialEntrenamientosService.getPaginaHistorial pide la página sin filtros', () => {
    const servicio = TestBed.inject(HistorialEntrenamientosService);
    servicio.getPaginaHistorial(1).subscribe();

    const req = http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.keys().sort()).toEqual(['page', 'size']);
    req.flush({ content: [], page: 1, size: 12, totalElements: 0, totalPages: 0 });
  });

  it('HistorialEntrenamientosService.getPaginaHistorial envía la búsqueda q recortada', () => {
    const servicio = TestBed.inject(HistorialEntrenamientosService);
    servicio.getPaginaHistorial(0, '  turia ').subscribe();

    const req = http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial');
    expect(req.request.params.get('q')).toBe('turia');
    req.flush({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0 });
  });
});
