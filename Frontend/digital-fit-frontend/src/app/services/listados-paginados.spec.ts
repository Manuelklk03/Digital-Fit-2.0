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
  filtrado?: string;
  args?: unknown[];
  esperado?: Record<string, string>;
}

const ENTRENAMIENTO = { args: ['fuerza total', 'principiante', 30, 'full'], esperado: { categoria: 'FUERZA_TOTAL', nivel: 'PRINCIPIANTE', duracionEnMinutos: '30', nombre: 'full' } };
const CENTRO = { args: ['gym', 'valencia', 30], esperado: { nombre: 'gym', direccion: 'valencia', precioMensual: '30' } };
const LUGAR = { args: ['parque', 'valencia', 'calistenia'], esperado: { nombre: 'parque', direccion: 'valencia', tipo: 'CALISTENIA' } };

// Los servicios con listados piden size=100 y devuelven solo `content`; el filtrado conserva ambos.
const CASOS: Caso[] = [
  { servicio: EntrenamientosService, url: '/api/entrenamientos', lista: 'getEntrenamientos', filtrado: 'getEntrenamientosFiltrados', ...ENTRENAMIENTO },
  { servicio: MisEntrenamientosService, url: '/api/mis-entrenamientos', lista: 'getMisEntrenamientos', filtrado: 'getMisEntrenamientosFiltrados', ...ENTRENAMIENTO },
  { servicio: EntrenamientosComunidadService, url: '/api/entrenamientos-comunidad', lista: 'getEntrenamientosComunidad', filtrado: 'getEntrenamientosComunidadFiltrados', ...ENTRENAMIENTO },
  { servicio: HistorialEntrenamientosService, url: '/api/entrenamientos/mi-historial', lista: 'getHistorial' },
  { servicio: PrivadosService, url: '/api/centros-privados', lista: 'getCentrosPrivados', filtrado: 'getCentrosPrivadosFiltrados', ...CENTRO },
  { servicio: MisCentrosService, url: '/api/mis-centros-privados', lista: 'getMisCentros', filtrado: 'getMisCentrosFiltrados', ...CENTRO },
  { servicio: PublicosService, url: '/api/lugares-publicos', lista: 'getLugaresPublicos', filtrado: 'getLugaresPublicosFiltrados', ...LUGAR },
  { servicio: MisLugaresService, url: '/api/mis-lugares-publicos', lista: 'getMisLugares', filtrado: 'getMisLugaresFiltrados', ...LUGAR },
];

describe('Servicios con listados paginados', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
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

      if (caso.filtrado) {
        it('conserva los filtros y el tamaño al filtrar', () => {
          const servicio = TestBed.inject(caso.servicio) as unknown as Record<string, Metodo>;

          servicio[caso.filtrado as string](...(caso.args ?? [])).subscribe();

          const req = http.expectOne((r) => r.url === caso.url);
          expect(req.request.params.get('size')).toBe('100');
          for (const [clave, valor] of Object.entries(caso.esperado ?? {})) {
            expect(req.request.params.get(clave)).toBe(valor);
          }
          req.flush({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });
        });
      }
    });
  }
});
