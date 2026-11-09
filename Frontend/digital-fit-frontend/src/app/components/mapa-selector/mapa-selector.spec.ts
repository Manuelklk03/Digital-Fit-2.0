import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { MapaSelectorComponent } from './mapa-selector';

const geocodificar = (r: { url: string }) => r.url === '/api/explorar/geocodificar';

describe('MapaSelector', () => {
  let component: MapaSelectorComponent;
  let fixture: ComponentFixture<MapaSelectorComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [MapaSelectorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MapaSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
  });

  it('pide escribir algo si la búsqueda está vacía', () => {
    component.textoBusqueda = '   ';
    component.buscarDireccion();
    expect(component.buscando()).toBe(false);
    expect(component.mensaje()).toContain('Escribe una dirección');
  });

  it('usa el proxy del backend y emite la ubicación encontrada', () => {
    const emitSpy = vi.spyOn(component.ubicacionSeleccionada, 'emit');
    component.textoBusqueda = 'Calle Colon';
    component.buscarDireccion();
    expect(component.buscando()).toBe(true);

    const req = httpTesting.expectOne(geocodificar);
    expect(req.request.params.get('q')).toContain('Calle Colon, Valencia');
    req.flush([{ nombre: 'Calle Colón', direccionCompleta: '', latitud: 39.4699, longitud: -0.3763, tipo: 'road' }]);

    expect(component.buscando()).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith({ latitud: 39.4699, longitud: -0.3763 });
  });

  it('prueba consultas más generales y avisa si ninguna cae en la Comunidad Valenciana', () => {
    component.textoBusqueda = 'Madrid';
    component.buscarDireccion();
    for (let i = 0; i < 5; i++) {
      httpTesting.expectOne(geocodificar).flush([{ nombre: 'Madrid', direccionCompleta: '', latitud: 40.41, longitud: -3.7, tipo: 'city' }]);
      vi.advanceTimersByTime(1200);
    }
    expect(component.buscando()).toBe(false);
    expect(component.mensaje()).toContain('No se encontró');
  });

  it('en modo solo vista no busca', () => {
    fixture.componentRef.setInput('soloVista', true);
    fixture.detectChanges();
    component.textoBusqueda = 'Calle Colon';
    component.buscarDireccion();
    httpTesting.expectNone(geocodificar);
    expect(fixture.nativeElement.querySelector('[role="search"]')).toBeNull();
  });

  it('mueve el marcador cuando cambian las coordenadas de entrada', () => {
    fixture.componentRef.setInput('latitud', 39.47);
    fixture.componentRef.setInput('longitud', -0.37);
    fixture.detectChanges();
    expect(() => component.volverAMarcador()).not.toThrow();
    expect(() => component.volverAValencia()).not.toThrow();
  });
});
