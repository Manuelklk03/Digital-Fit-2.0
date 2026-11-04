import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EntrenarComponent } from './entrenar';

describe('EntrenarComponent', () => {
  let component: EntrenarComponent;
  let fixture: ComponentFixture<EntrenarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenarComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EntrenarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializarse con el primer ejercicio seleccionado', () => {
    expect(component.ejercicioActual().id).toBe(1);
    expect(component.ejercicioActual().nombre).toContain('Sentadilla');
  });

  it('debe permitir completar una serie e iniciar el descanso', () => {
    expect(component.descansoActivo()).toBe(false);
    component.completarSerie(3);
    const serie3 = component.ejercicioActual().series.find((s) => s.numero === 3);
    expect(serie3?.completada).toBe(true);
    expect(component.descansoActivo()).toBe(true);
  });

  it('debe permitir ajustar peso y repeticiones', () => {
    const pesoInicial = component.ejercicioActual().series[2].pesoKg;
    component.modificarPeso(3, 2.5);
    expect(component.ejercicioActual().series[2].pesoKg).toBe(pesoInicial + 2.5);

    const repsInicial = component.ejercicioActual().series[2].repeticiones;
    component.modificarRepeticiones(3, 1);
    expect(component.ejercicioActual().series[2].repeticiones).toBe(repsInicial + 1);
  });

  it('debe permitir detener y ajustar el descanso', () => {
    component.iniciarDescanso(60);
    expect(component.descansoSegundosRestantes()).toBe(60);
    component.ajustarDescanso(15);
    expect(component.descansoSegundosRestantes()).toBe(75);
    component.detenerDescanso();
    expect(component.descansoActivo()).toBe(false);
  });
});
