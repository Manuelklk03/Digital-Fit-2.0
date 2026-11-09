import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { vi } from 'vitest';
import { HistorialEntrenamientosComponent } from './historial-entrenamientos';

const VACIA = { content: [], page: 0, size: 12, totalElements: 0, totalPages: 0 };

describe('HistorialEntrenamientosComponent', () => {
  let fixture: ComponentFixture<HistorialEntrenamientosComponent>;
  let component: HistorialEntrenamientosComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialEntrenamientosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialEntrenamientosComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('muestra el vacío cuando no hay registros', () => {
    http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial').flush(VACIA);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aún no has registrado ninguna sesión.');
  });

  it('busca por texto desde la página 0 y avisa si no hay coincidencias', () => {
    http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial').flush(VACIA);
    component.busqueda = ' Turia ';
    component.buscar();
    const req = http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial');
    expect(req.request.params.get('q')).toBe('Turia');
    expect(req.request.params.get('page')).toBe('0');
    req.flush(VACIA);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ningún registro coincide con la búsqueda.');

    component.limpiarBusqueda();
    const limpia = http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial');
    expect(limpia.request.params.has('q')).toBe(false);
    limpia.flush(VACIA);
    expect(component.hayBusqueda()).toBe(false);
  });

  it('valida el formulario sin enviar nada', () => {
    http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial').flush(VACIA);
    component.crearRegistro();
    expect(component.errores()).toEqual(['entrenamiento', 'fecha']);
    http.expectNone((r) => r.method === 'POST');
  });

  it('traduce las opciones elegidas al cuerpo que espera el backend', () => {
    http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial').flush(VACIA);
    component.entrenamientoSeleccionado = 'MIS-7';
    component.ubicacionSeleccionada = 'CPB-3';
    component.fecha = '2026-11-09T18:30';
    component.duracionEnMinutos = 50;
    component.notas = ' Buen ritmo ';

    component.crearRegistro();

    const req = http.expectOne((r) => r.method === 'POST');
    expect(req.request.body).toEqual({
      entrenamientoBaseId: null,
      entrenamientoUsuarioId: 7,
      lugarPublicoBaseId: null,
      lugarPublicoUsuarioId: null,
      centroPrivadoBaseId: 3,
      centroPrivadoUsuarioId: null,
      fecha: '2026-11-09 18:30:00',
      duracionEnMinutos: 50,
      notas: 'Buen ritmo',
    });
  });

  it('borra un registro tras confirmar y recarga la página', () => {
    const r = { id: 5, entrenamiento: 'Core', tipoEntrenamiento: 'MI_ENTRENAMIENTO', ubicacion: null, tipoUbicacion: null, fecha: '2026-11-09 10:00:00', duracionEnMinutos: 20, notas: null };
    http.expectOne((q) => q.url === '/api/entrenamientos/mi-historial').flush({ ...VACIA, content: [r], totalElements: 1, totalPages: 1 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('li.registro').length).toBe(1);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.borrarRegistro(r as never);
    http.expectOne('/api/entrenamientos/mi-historial/5').flush(null);
    http.expectOne((q) => q.url === '/api/entrenamientos/mi-historial').flush(VACIA);

    expect(component.aviso.actual()?.tipo).toBe('exito');
  });

  it('carga las opciones al abrir el formulario y permite reintentar si alguna falla', () => {
    http.expectOne((r) => r.url === '/api/entrenamientos/mi-historial').flush(VACIA);
    component.abrirFormulario();
    const urls = ['/api/entrenamientos', '/api/mis-entrenamientos', '/api/lugares-publicos', '/api/mis-lugares-publicos', '/api/centros-privados', '/api/mis-centros-privados'];
    for (const url of urls) {
      const req = http.expectOne((r) => r.url === url);
      if (url === '/api/mis-entrenamientos') {
        req.flush(null, { status: 500, statusText: 'Error' });
      } else {
        req.flush({ ...VACIA, content: [{ id: 1, nombre: 'X', duracionEnMinutos: 10 }] });
      }
    }
    fixture.detectChanges();
    expect(component.errorOpciones()).toBe(true);
    expect(component.opciones()?.base.length).toBe(1);

    component.cerrarFormulario();
    component.abrirFormulario();
    for (const url of urls) {
      http.expectOne((r) => r.url === url).flush(VACIA);
    }
    expect(component.errorOpciones()).toBe(false);
  });
});
