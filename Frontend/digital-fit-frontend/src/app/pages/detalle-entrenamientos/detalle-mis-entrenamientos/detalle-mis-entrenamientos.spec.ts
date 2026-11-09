import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DetalleMiEntrenamientoComponent } from './detalle-mis-entrenamientos';

describe('DetalleMiEntrenamientoComponent', () => {
  let fixture: ComponentFixture<DetalleMiEntrenamientoComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMiEntrenamientoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleMiEntrenamientoComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('muestra el error si el entrenamiento no existe', () => {
    http.expectOne('/api/mis-entrenamientos/5').flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.estado-error')).toBeTruthy();
  });

  it('marca como realizado creando un registro de historial', () => {
    http.expectOne('/api/mis-entrenamientos/5').flush({
      id: 5, nombre: 'Core', descripcion: 'd', categoria: 'FUERZA_CORE', nivel: 'INTERMEDIO', duracionEnMinutos: 15,
    });
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.acciones button').click();
    const req = http.expectOne('/api/entrenamientos/mi-historial');
    expect(req.request.body).toEqual(expect.objectContaining({ entrenamientoUsuarioId: 5, duracionEnMinutos: 15 }));
    req.flush({});
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ver historial');
  });
});
