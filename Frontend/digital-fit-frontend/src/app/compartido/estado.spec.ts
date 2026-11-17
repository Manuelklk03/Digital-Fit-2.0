import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PaginaResponse } from '../models/pagina-response';
import { Aviso, Detalle, ListadoPaginado, motivoError } from './estado';

const pagina = (page: number, content: number[], totalPages = 3): PaginaResponse<number> => ({
  content,
  page,
  size: 12,
  totalElements: content.length,
  totalPages,
});

describe('ListadoPaginado', () => {
  it('pasa de cargando a listo con la página recibida', () => {
    const listado = TestBed.runInInjectionContext(
      () => new ListadoPaginado<number>((p) => of(pagina(p, [1, 2]))),
    );
    expect(listado.estado()).toBe('cargando');

    listado.cargar(1);

    expect(listado.estado()).toBe('listo');
    expect(listado.items()).toEqual([1, 2]);
    expect(listado.pagina()?.page).toBe(1);
  });

  it('marca error si la petición falla', () => {
    const listado = TestBed.runInInjectionContext(
      () => new ListadoPaginado<number>(() => throwError(() => new Error('500'))),
    );
    listado.cargar();
    expect(listado.estado()).toBe('error');
  });

  it('retrocede una página si la actual se queda vacía tras borrar', () => {
    const fuente = vi.fn((p: number) => of(p === 2 ? pagina(2, []) : pagina(p, [9])));
    const listado = TestBed.runInInjectionContext(() => new ListadoPaginado<number>(fuente));

    listado.cargar(2);

    expect(fuente).toHaveBeenLastCalledWith(1);
    expect(listado.pagina()?.page).toBe(1);
  });
});

it('reintenta la página que falló, no la última correcta', () => {
  const fuente = vi.fn((p: number) =>
    p === 1 ? throwError(() => new Error('500')) : of(pagina(p, [p])),
  );
  const listado = TestBed.runInInjectionContext(() => new ListadoPaginado<number>(fuente));
  listado.cargar(0);
  listado.cargar(1);
  expect(listado.estado()).toBe('error');

  listado.recargar();
  expect(fuente).toHaveBeenLastCalledWith(1);
});

describe('Aviso', () => {
  it('oculta solo los mensajes de éxito', () => {
    vi.useFakeTimers();
    const aviso = TestBed.runInInjectionContext(() => new Aviso());

    aviso.mostrar('ok', 'exito');
    vi.advanceTimersByTime(5000);
    expect(aviso.actual()).toBeNull();

    aviso.mostrar('mal', 'error');
    vi.advanceTimersByTime(5000);
    expect(aviso.actual()?.texto).toBe('mal');
    vi.useRealTimers();
  });
});

describe('Detalle', () => {
  it('traduce el código HTTP del fallo a su motivo', () => {
    expect([404, 403, 0, 500].map((status) => motivoError({ status }))).toEqual([
      'no-encontrado',
      'sin-permiso',
      'conexion',
      'conexion',
    ]);
    expect(motivoError(null)).toBe('conexion');
  });

  it('guarda el motivo del error y lo limpia al cargar con éxito', () => {
    let fallar = true;
    const detalle = new Detalle(() => (fallar ? throwError(() => ({ status: 403 })) : of('ok')));
    detalle.cargar();
    expect([detalle.estado(), detalle.motivo()]).toEqual(['error', 'sin-permiso']);
    fallar = false;
    detalle.cargar();
    expect([detalle.estado(), detalle.item()]).toEqual(['listo', 'ok']);
  });
});
