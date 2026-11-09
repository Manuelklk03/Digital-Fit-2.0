import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EstadisticasComponent } from './estadisticas';

const DATOS = {
  entrenamientosRealizados: 12,
  minutosEntrenados: 540,
  promedioMinutosEntrenamiento: 45,
  centrosPrivadosVisitados: 2,
  lugaresPublicosVisitados: 3,
  entrenamientoMasRealizado: 'Fuerza total',
};

describe('EstadisticasComponent', () => {
  let fixture: ComponentFixture<EstadisticasComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(EstadisticasComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  const texto = () => fixture.nativeElement.textContent as string;

  it('muestra las cifras del usuario', () => {
    http.expectOne('/api/estadisticas').flush(DATOS);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kpi').length).toBe(6);
    expect(texto()).toContain('540');
    expect(texto()).toContain('Fuerza total');
  });

  it('trata "N/A" como sin datos', () => {
    http.expectOne('/api/estadisticas').flush({ ...DATOS, entrenamientoMasRealizado: 'N/A' });
    fixture.detectChanges();
    expect(texto()).toContain('Aún sin datos');
  });

  it('sin sesiones invita a ir al historial', () => {
    http.expectOne('/api/estadisticas').flush({ ...DATOS, entrenamientosRealizados: 0 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kpi')).toBeNull();
    expect(texto()).toContain('Ir al historial');
  });

  it('muestra el error y reintenta', () => {
    http.expectOne('/api/estadisticas').flush(null, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(texto()).toContain('No se pudieron cargar las estadísticas.');
    fixture.nativeElement.querySelector('.estado-error button').click();
    http.expectOne('/api/estadisticas').flush(DATOS);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kpi').length).toBe(6);
  });
});
