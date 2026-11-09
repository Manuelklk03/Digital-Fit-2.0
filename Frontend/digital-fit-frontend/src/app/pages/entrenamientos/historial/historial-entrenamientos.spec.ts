import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

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
});
