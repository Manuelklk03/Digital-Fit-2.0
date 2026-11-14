import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { ValoracionesComponent } from './valoraciones';
import { Valoracion } from '../../models/progreso';

const pagina = <T>(items: T[]) => ({
  content: items,
  page: 0,
  size: 12,
  totalElements: items.length,
  totalPages: 1,
});
const lista = <T>(items: T[]) => ({
  content: items,
  page: 0,
  size: 100,
  totalElements: items.length,
  totalPages: 1,
});
const MIA: Valoracion = {
  id: 7,
  puntuacion: 4,
  comentario: 'Buen gimnasio',
  fecha: '2026-11-09 10:00:00',
  tipoDeValoracion: 'CENTRO_PRIVADO_BASE',
  contenidoId: 3,
  contenidoNombre: 'AltaFit',
  usuarioId: 1,
  username: 'usuario1',
};
const AJENA: Valoracion = { ...MIA, id: 8, username: 'otra', comentario: null };

describe('ValoracionesComponent', () => {
  let fixture: ComponentFixture<ValoracionesComponent>;
  let component: ValoracionesComponent;
  let http: HttpTestingController;

  const mias = () => http.expectOne((r) => r.url === '/api/valoraciones/mis-valoraciones');
  const publicas = () => http.expectOne((r) => r.url === '/api/valoraciones/publicas');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValoracionesComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ValoracionesComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http
      .match('/api/auth/me')
      .forEach((r) => r.flush({ username: 'usuario1', email: 'u@u.es', rol: 'USER' }));
    mias().flush(pagina([MIA]));
    publicas().flush(pagina([MIA, AJENA]));
    fixture.detectChanges();
  });

  afterEach(() => vi.restoreAllMocks());

  it('pinta mis valoraciones con acciones y las de la comunidad con autor', () => {
    const tarjetas = fixture.nativeElement.querySelectorAll('.valoracion');
    expect(tarjetas.length).toBe(3);
    expect(tarjetas[0].textContent).toContain('Editar');
    expect(tarjetas[2].textContent).toContain('otra');
    expect(tarjetas[2].textContent).not.toContain('Editar');
    expect(tarjetas[0].textContent).toContain('4 de 5');
  });

  it('carga solo las listas de la categoría elegida y valida antes de enviar', () => {
    component.abrirNueva();
    for (const url of [
      '/api/entrenamientos',
      '/api/mis-entrenamientos',
      '/api/entrenamientos/mi-historial',
      '/api/entrenamientos-comunidad',
    ]) {
      http
        .expectOne((r) => r.url === url)
        .flush(
          lista([
            {
              id: 1,
              nombre: 'Core',
              entrenamiento: 'Core',
              fecha: '2026-11-09 10:00:00',
              usuario: 'ana',
            },
          ]),
        );
    }
    expect(component.grupos()?.length).toBe(4);

    component.guardar();
    expect(component.errores()).toEqual(['contenido']);

    component.cambiarCategoria('LUGARES_PUBLICOS');
    http
      .expectOne((r) => r.url === '/api/lugares-publicos')
      .flush(lista([{ id: 5, nombre: 'Turia' }]));
    http
      .expectOne((r) => r.url === '/api/mis-lugares-publicos')
      .flush(null, { status: 500, statusText: 'Error' });
    expect(component.errorOpciones()).toBe(true);

    component.seleccion = 'LUGAR_PUBLICO_BASE|5';
    component.puntuacion = 3;
    component.comentario = '  Bien  ';
    component.guardar();
    const req = http.expectOne('/api/valoraciones/LUGAR_PUBLICO_BASE/5');
    expect(req.request.body).toEqual({ puntuacion: 3, comentario: 'Bien' });
    req.flush(MIA);
    mias().flush(pagina([MIA]));
    publicas().flush(pagina([MIA]));
    expect(component.aviso.actual()?.tipo).toBe('exito');
    expect(component.enEdicion()).toBeUndefined();
  });

  it('marca como «Tuya» lo propio en la comunidad y limita el comentario a lo que admite la BD (1000)', () => {
    const comunidad = fixture.nativeElement.querySelectorAll('.valoracion');
    expect(comunidad[1].textContent).toContain('Tuya');
    expect(comunidad[2].textContent).not.toContain('Tuya');

    component.editar(MIA);
    component.comentario = 'x'.repeat(1001);
    component.guardar();
    expect(component.errores()).toEqual(['comentario']);
    http.expectNone('/api/valoraciones/CENTRO_PRIVADO_BASE/3');
  });

  it('edita la propia sobre el mismo contenido', () => {
    component.editar(MIA);
    expect(component.puntuacion).toBe(4);
    component.puntuacion = 5;
    component.guardar();
    const req = http.expectOne('/api/valoraciones/CENTRO_PRIVADO_BASE/3');
    expect(req.request.body.puntuacion).toBe(5);
    req.flush(MIA);
    mias().flush(pagina([MIA]));
    publicas().flush(pagina([MIA]));
  });

  it('borra tras confirmar y filtra la comunidad por categoría', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.borrar(MIA);
    http.expectOne('/api/valoraciones/CENTRO_PRIVADO_BASE/3').flush(null);
    mias().flush(pagina([]));
    publicas().flush(pagina([AJENA]));
    expect(component.aviso.actual()?.tipo).toBe('exito');

    component.filtrarComunidad('ENTRENAMIENTOS');
    const req = publicas();
    expect(req.request.params.get('categoria')).toBe('ENTRENAMIENTOS');
    expect(req.request.params.get('page')).toBe('0');
    req.flush(pagina([]));
  });
});
