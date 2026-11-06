import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { MapaSelectorComponent } from './mapa-selector';

describe('MapaSelector', () => {
  let component: MapaSelectorComponent;
  let fixture: ComponentFixture<MapaSelectorComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaSelectorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MapaSelectorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle empty or whitespace address', () => {
    component.textoBusqueda = '   ';
    component.buscarDireccion();
    expect(component.buscando).toBe(false);
    expect(component.mostrarMensajeBusqueda).toBe(true);
  });

  it('should call backend proxy and emit location on successful geocoding', () => {
    const emitSpy = vi.spyOn(component.ubicacionSeleccionada, 'emit');

    component.textoBusqueda = 'Calle Colon Valencia';
    component.buscarDireccion();
    expect(component.buscando).toBe(true);

    const req = httpTesting.expectOne((r) => r.url === '/api/explorar/geocodificar');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        nombre: 'Calle Colon',
        latitud: 39.4699,
        longitud: -0.3763,
      },
    ]);

    expect(component.buscando).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith({
      latitud: 39.4699,
      longitud: -0.3763,
    });
  });
});
