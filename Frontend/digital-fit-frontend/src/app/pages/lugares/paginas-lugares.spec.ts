import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { PrivadosComponent } from '../privados/privados';
import { PublicosComponent } from '../publicos/publicos';
import { MisCentrosComponent } from '../privados/mis-centros/mis-centros';
import { MisLugaresComponent } from '../publicos/mis-lugares/mis-lugares';
import { DetallePrivadoComponent } from '../detalle-privado/detalle-privado';
import { DetallePublicoComponent } from '../detalle-publico/detalle-publico/detalle-publico';
import { DetalleMiCentroComponent } from '../detalle-privado/detalle-mi-centro/detalle-mi-centro';
import { DetalleMiLugarComponent } from '../detalle-publico/detalle-mis-lugares/detalle-mi-lugar/detalle-mi-lugar';
import { ListadoSitiosComponent } from './listado-sitios';
import { DetalleSitioComponent } from './detalle-sitio';
import { CentroPrivado, LugarPublico, SitioForm } from '../../models/lugar';

const CENTRO: CentroPrivado = {
  id: 4, nombre: 'Gym Centro', direccion: 'Calle Colón 1', telefono: null, horario: '7-23',
  descripcion: null, latitud: 39.47, longitud: -0.376, precioMensual: 30,
};
const LUGAR: LugarPublico = {
  id: 4, nombre: 'Parque Turia', direccion: 'Jardín del Turia', telefono: null, horario: null,
  descripcion: 'Barras', latitud: 39.48, longitud: -0.37, tipo: 'PARQUE_CALISTENIA',
};
const pagina = <T>(items: T[]) => ({ content: items, page: 0, size: 12, totalElements: items.length, totalPages: 1 });
const ADMIN = { username: 'admin1', email: 'a@a.es', rol: 'ADMIN' };
const USUARIO = { username: 'usuario1', email: 'u@u.es', rol: 'USER' };

interface CasoListado {
  nombre: string;
  componente: Type<unknown>;
  url: string;
  sitio: CentroPrivado | LugarPublico;
  catalogo: boolean;
  crear: string;
  borrar: string;
  anadir?: string;
  actualizar?: string;
  autocompletar?: string;
}

const LISTADOS: CasoListado[] = [
  { nombre: 'Privados', componente: PrivadosComponent, url: '/api/centros-privados', sitio: CENTRO, catalogo: true,
    crear: '/api/admin/centros-privados-base', actualizar: '/api/admin/centros-privados-base/4',
    borrar: '/api/admin/centros-privados-base/4', anadir: '/api/mis-centros-privados/centros-app/4' },
  { nombre: 'Publicos', componente: PublicosComponent, url: '/api/lugares-publicos', sitio: LUGAR, catalogo: true,
    crear: '/api/admin/lugares-publicos-base', actualizar: '/api/admin/lugares-publicos-base/4',
    borrar: '/api/admin/lugares-publicos-base/4', anadir: '/api/mis-lugares-publicos/base/4' },
  { nombre: 'MisCentros', componente: MisCentrosComponent, url: '/api/mis-centros-privados', sitio: CENTRO, catalogo: false,
    crear: '/api/mis-centros-privados/centros-maps', borrar: '/api/mis-centros-privados/4',
    autocompletar: '/api/mis-centros-privados/autocompletar' },
  { nombre: 'MisLugares', componente: MisLugaresComponent, url: '/api/mis-lugares-publicos', sitio: LUGAR, catalogo: false,
    crear: '/api/mis-lugares-publicos', borrar: '/api/mis-lugares-publicos/4',
    autocompletar: '/api/mis-lugares-publicos/autocompletar' },
];

const DATOS: SitioForm = { nombre: 'Nuevo', direccion: 'Calle 1', telefono: null, horario: null, descripcion: null, latitud: 39.4, longitud: -0.3, precioMensual: 20 };

describe('Pantallas de lugares', () => {
  let http: HttpTestingController;

  function configurar(id?: string): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ...(id ? [{ provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } }] : []),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  }

  /** La cabecera también pide la sesión: se responden todas las peticiones a /api/auth/me. */
  function responderSesion(usuario: object): void {
    http.match('/api/auth/me').forEach((r) => r.flush(usuario));
  }

  afterEach(() => vi.restoreAllMocks());

  for (const caso of LISTADOS) {
    describe(caso.nombre, () => {
      function crear(usuario: object) {
        configurar();
        const fixture = TestBed.createComponent(caso.componente);
        fixture.detectChanges();
        responderSesion(usuario);
        const req = http.expectOne((r) => r.url === caso.url);
        expect(req.request.params.get('size')).toBe('12');
        req.flush(pagina([caso.sitio]));
        fixture.detectChanges();
        const listado = fixture.debugElement.query(By.directive(ListadoSitiosComponent)).componentInstance as ListadoSitiosComponent;
        return { fixture, listado };
      }

      it('carga la primera página y pinta las tarjetas', () => {
        const { fixture } = crear(caso.catalogo ? ADMIN : USUARIO);
        expect(fixture.nativeElement.querySelectorAll('app-tarjeta-sitio').length).toBe(1);
        expect(fixture.nativeElement.textContent).toContain(caso.sitio.nombre);
      });

      it('filtra por un único campo y vuelve a la página 0', () => {
        const { listado } = crear(USUARIO);
        listado.filtrar({ campo: 'direccion', valor: 'Colón' });
        const req = http.expectOne((r) => r.url === caso.url);
        expect(req.request.params.get('direccion')).toBe('Colón');
        expect(req.request.params.get('page')).toBe('0');
        req.flush(pagina([]));
        expect(listado.hayFiltro()).toBe(true);
      });

      it('crea con el endpoint correcto y recarga', () => {
        const { listado } = crear(caso.catalogo ? ADMIN : USUARIO);
        expect(listado.puedeGestionar()).toBe(true);
        listado.enEdicion.set(null);
        listado.guardar(DATOS);
        const req = http.expectOne(caso.crear);
        expect(req.request.method).toBe('POST');
        req.flush(caso.sitio);
        http.expectOne((r) => r.url === caso.url).flush(pagina([caso.sitio]));
        expect(listado.aviso.actual()?.tipo).toBe('exito');
        expect(listado.enEdicion()).toBeUndefined();
      });

      it('borra tras confirmar y muestra el error del backend si falla', () => {
        const { listado } = crear(caso.catalogo ? ADMIN : USUARIO);
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        listado.borrar(caso.sitio);
        http.expectOne(caso.borrar).flush({ detail: 'No permitido' }, { status: 403, statusText: 'Forbidden' });
        expect(listado.aviso.actual()).toEqual({ texto: 'No permitido', tipo: 'error' });
      });

      it('no borra si se cancela la confirmación', () => {
        const { listado } = crear(USUARIO);
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        listado.borrar(caso.sitio);
        http.expectNone(caso.borrar);
      });

      if (caso.actualizar) {
        it('el ADMIN edita con PUT', () => {
          const { listado } = crear(ADMIN);
          listado.enEdicion.set(caso.sitio);
          listado.guardar(DATOS);
          const req = http.expectOne(caso.actualizar as string);
          expect(req.request.method).toBe('PUT');
          req.flush(caso.sitio);
          http.expectOne((r) => r.url === caso.url).flush(pagina([caso.sitio]));
          expect(listado.aviso.actual()?.tipo).toBe('exito');
        });
      }

      if (caso.anadir) {
        it('un usuario no gestiona el catálogo, pero puede añadirlo a su lista', () => {
          const { fixture, listado } = crear(USUARIO);
          expect(listado.puedeGestionar()).toBe(false);
          expect(fixture.nativeElement.querySelector('#boton-nuevo')).toBeNull();
          listado.anadir(caso.sitio);
          const req = http.expectOne(caso.anadir as string);
          expect(req.request.method).toBe('POST');
          req.flush(caso.sitio);
          expect(listado.aviso.actual()?.tipo).toBe('exito');
        });
      }

      if (caso.autocompletar) {
        it('pasa el autocompletado de su servicio al formulario', () => {
          const { listado } = crear(USUARIO);
          listado.config().autocompletar?.(39.4, -0.3).subscribe();
          const req = http.expectOne((r) => r.url === caso.autocompletar);
          expect(req.request.params.get('latitud')).toBe('39.4');
          req.flush({ datosEncontrados: false });
        });
      }
    });
  }

  const DETALLES = [
    { nombre: 'DetallePrivado', componente: DetallePrivadoComponent, url: '/api/centros-privados/4', sitio: CENTRO,
      catalogo: true, borrar: '/api/admin/centros-privados-base/4', anadir: '/api/mis-centros-privados/centros-app/4', listado: '/privados' },
    { nombre: 'DetallePublico', componente: DetallePublicoComponent, url: '/api/lugares-publicos/4', sitio: LUGAR,
      catalogo: true, borrar: '/api/admin/lugares-publicos-base/4', anadir: '/api/mis-lugares-publicos/base/4', listado: '/publicos' },
    { nombre: 'DetalleMiCentro', componente: DetalleMiCentroComponent, url: '/api/mis-centros-privados/4', sitio: CENTRO,
      catalogo: false, borrar: '/api/mis-centros-privados/4', listado: '/mis-centros' },
    { nombre: 'DetalleMiLugar', componente: DetalleMiLugarComponent, url: '/api/mis-lugares-publicos/4', sitio: LUGAR,
      catalogo: false, borrar: '/api/mis-lugares-publicos/4', listado: '/mis-lugares' },
  ];

  for (const caso of DETALLES) {
    describe(caso.nombre, () => {
      function crear(usuario: object) {
        configurar('4');
        const fixture = TestBed.createComponent(caso.componente as Type<unknown>);
        fixture.detectChanges();
        responderSesion(usuario);
        return {
          fixture,
          detalle: fixture.debugElement.query(By.directive(DetalleSitioComponent)).componentInstance as DetalleSitioComponent,
        };
      }

      it('carga el sitio y muestra su ficha', () => {
        const { fixture } = crear(USUARIO);
        http.expectOne(caso.url).flush(caso.sitio);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('h1').textContent).toContain(caso.sitio.nombre);
        expect(fixture.nativeElement.textContent).toContain(caso.sitio.direccion);
      });

      it('muestra el error y reintenta', () => {
        const { fixture, detalle } = crear(USUARIO);
        http.expectOne(caso.url).flush(null, { status: 404, statusText: 'Not Found' });
        fixture.detectChanges();
        expect(detalle.detalle.estado()).toBe('error');
        detalle.detalle.cargar();
        http.expectOne(caso.url).flush(caso.sitio);
        expect(detalle.detalle.estado()).toBe('listo');
      });

      it('borra tras confirmar y vuelve al listado', () => {
        const { detalle } = crear(ADMIN);
        http.expectOne(caso.url).flush(caso.sitio);
        const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        expect(detalle.puedeGestionar()).toBe(true);
        detalle.borrar(caso.sitio);
        http.expectOne(caso.borrar).flush(null);
        expect(navegar).toHaveBeenCalledWith([caso.listado]);
      });

      if (caso.anadir) {
        it('un usuario lo añade a su lista', () => {
          const { detalle } = crear(USUARIO);
          http.expectOne(caso.url).flush(caso.sitio);
          expect(detalle.puedeGestionar()).toBe(false);
          detalle.anadir(caso.sitio);
          http.expectOne(caso.anadir as string).flush(caso.sitio);
          expect(detalle.aviso.actual()?.tipo).toBe('exito');
        });
      }
    });
  }
});
