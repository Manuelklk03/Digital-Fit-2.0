import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DetalleHistorialEntrenamientoComponent } from './detalle-historial';

describe('DetalleHistorialEntrenamientoComponent', () => {
  let fixture: ComponentFixture<DetalleHistorialEntrenamientoComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleHistorialEntrenamientoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '2' }) } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DetalleHistorialEntrenamientoComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('muestra el registro con su tipo y ubicación', () => {
    http.expectOne('/api/entrenamientos/mi-historial/2').flush({
      id: 2, entrenamiento: 'Full Body', tipoEntrenamiento: 'ENTRENAMIENTO_BASE', ubicacion: 'Parque',
      tipoUbicacion: 'LUGAR_PUBLICO_BASE', fecha: '2026-11-09 18:30:00', duracionEnMinutos: 45, notas: null,
    });
    fixture.detectChanges();

    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('Full Body');
    expect(texto).toContain('Entrenamiento base');
    expect(texto).toContain('Lugar público');
    expect(texto).toContain('Sin notas');
  });

  it('muestra el error y reintenta', () => {
    http.expectOne('/api/entrenamientos/mi-historial/2').flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.estado-error button').click();
    http.expectOne('/api/entrenamientos/mi-historial/2').flush({
      id: 2, entrenamiento: 'Mío', tipoEntrenamiento: 'MI_ENTRENAMIENTO', ubicacion: null,
      tipoUbicacion: null, fecha: '2026-11-09 18:30:00', duracionEnMinutos: 10, notas: 'ok',
    });
    expect(fixture.componentInstance.tipoEntrenamiento()).toBe('Mi entrenamiento');
  });
});
