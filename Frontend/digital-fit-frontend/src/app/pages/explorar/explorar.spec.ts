import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ExplorarComponent } from './explorar';
import { PrivadosService } from '../../services/centros/privados-service';
import { PublicosService } from '../../services/publicos/publicos-service';

describe('ExplorarComponent', () => {
  let component: ExplorarComponent;
  let fixture: ComponentFixture<ExplorarComponent>;

  const mockPrivados = [
    {
      id: 1,
      nombre: 'Gym Test Privado',
      direccion: 'Calle Test 1, Valencia',
      latitud: 39.469,
      longitud: -0.376,
      precioMensual: 40,
    },
  ];

  const mockPublicos = [
    {
      id: 2,
      nombre: 'Calistenia Test',
      tipo: 'CALISTENIA',
      direccion: 'Parque Test, Valencia',
      latitud: 39.471,
      longitud: -0.372,
    },
  ];

  beforeEach(async () => {
    const fakePrivadosService = {
      getCentrosPrivados: () => of(mockPrivados),
    };
    const fakePublicosService = {
      getLugaresPublicos: () => of(mockPublicos),
    };

    await TestBed.configureTestingModule({
      imports: [ExplorarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PrivadosService, useValue: fakePrivadosService },
        { provide: PublicosService, useValue: fakePublicosService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse correctamente y cargar lugares combinados', () => {
    expect(component).toBeTruthy();
    expect(component.lugares().length).toBe(2);
    expect(component.lugaresFiltrados().length).toBe(2);
  });

  it('debe filtrar correctamente por categoría', () => {
    component.cambiarCategoria('CALISTENIA');
    expect(component.categoriaFiltro()).toBe('CALISTENIA');
    expect(component.lugaresFiltrados().length).toBe(1);
    expect(component.lugaresFiltrados()[0].categoria).toBe('CALISTENIA');

    component.cambiarCategoria('GIMNASIO');
    expect(component.lugaresFiltrados().length).toBe(1);
    expect(component.lugaresFiltrados()[0].categoria).toBe('GIMNASIO');

    component.cambiarCategoria('TODOS');
    expect(component.lugaresFiltrados().length).toBe(2);
  });

  it('debe filtrar por texto de búsqueda', () => {
    component.textoBusqueda.set('Calistenia');
    expect(component.lugaresFiltrados().length).toBe(1);
    expect(component.lugaresFiltrados()[0].nombre).toContain('Calistenia');

    component.textoBusqueda.set('');
    expect(component.lugaresFiltrados().length).toBe(2);
  });

  it('debe calcular distancias geodésicas con fórmula Haversine', () => {
    // Distancia entre Valencia Centro (39.4699, -0.3763) y La Petxina (39.4729, -0.3895) ~ 1.2 km
    const dist = component.calcularDistanciaKm(39.4699, -0.3763, 39.4729, -0.3895);
    expect(dist).toBeGreaterThan(1.0);
    expect(dist).toBeLessThan(1.5);
  });

  it('debe seleccionar un lugar al hacer clic', () => {
    const lugar = component.lugares()[0];
    component.seleccionarLugar(lugar);
    expect(component.lugarSeleccionado()?.id).toBe(lugar.id);
  });

  it('debe permitir cambiar de radio y actualizar el filtro', () => {
    component.cambiarRadio(3);
    expect(component.radioFiltroKm()).toBe(3);
    component.cambiarRadio(10);
    expect(component.radioFiltroKm()).toBe(10);
  });

  it('debe retornar las clases y símbolos correctos para cada categoría', () => {
    expect(component.obtenerClaseIcono('GIMNASIO')).toBe('pin-gimnasio');
    expect(component.obtenerClaseIcono('CALISTENIA')).toBe('pin-calistenia');
    expect(component.obtenerClaseIcono('POLIDEPORTIVO')).toBe('pin-polideportivo');
    expect(component.obtenerClaseIcono('PISCINA')).toBe('pin-piscina');
    expect(component.obtenerClaseIcono('OTRO')).toBe('pin-neutral');

    expect(component.obtenerSimboloCategoria('GIMNASIO')).toBe('🏋️');
    expect(component.obtenerSimboloCategoria('CALISTENIA')).toBe('🤸');
    expect(component.obtenerSimboloCategoria('POLIDEPORTIVO')).toBe('🏟️');
    expect(component.obtenerSimboloCategoria('PISCINA')).toBe('🏊');
    expect(component.obtenerSimboloCategoria('OTRO')).toBe('📍');
  });

  it('debe reaccionar a buscarEnEstaZona recalculando distancias al centro', () => {
    component.buscarEnEstaZona();
    expect(component.mostrarBotonZona()).toBe(false);
  });

  it('debe usar fallback de datos de Valencia si los servicios están vacíos', () => {
    const fallback = component.obtenerLugaresBaseValencia();
    expect(fallback.length).toBeGreaterThan(0);
    expect(fallback.some((l) => l.categoria === 'CALISTENIA')).toBe(true);
  });

  it('debe gestionar la geolocalización cuando no está disponible o falla', () => {
    const originalGeo = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    component.usarMiUbicacion();
    expect(component.mensajeError()).toContain('no soporta geolocalización');

    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeo,
      configurable: true,
    });
  });

  it('debe actualizar ubicación y recalcular distancias cuando la geolocalización es exitosa', () => {
    const fakeGeolocation = {
      getCurrentPosition: (success: (pos: unknown) => void) => {
        success({
          coords: { latitude: 39.47, longitude: -0.37 },
        });
      },
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: fakeGeolocation,
      configurable: true,
    });

    component.usarMiUbicacion();
    expect(component.ubicacionUsuario()).toEqual({ lat: 39.47, lng: -0.37 });
    expect(component.geolocalizando()).toBe(false);
  });

  it('debe registrar error cuando la geolocalización es denegada', () => {
    const fakeGeolocation = {
      getCurrentPosition: (_success: unknown, error: (err: unknown) => void) => {
        error({ message: 'User denied geolocation' });
      },
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: fakeGeolocation,
      configurable: true,
    });

    component.usarMiUbicacion();
    expect(component.mensajeError()).toContain('No se pudo acceder a tu ubicación');
    expect(component.geolocalizando()).toBe(false);
  });

  it('debe mapear tipos públicos a categorías unificadas', () => {
    const compAny = component as unknown as {
      mapearTipoPublico: (tipo?: string) => string;
    };
    expect(compAny.mapearTipoPublico('PISCINA_MUNICIPAL')).toBe('PISCINA');
    expect(compAny.mapearTipoPublico('POLIDEPORTIVO')).toBe('POLIDEPORTIVO');
    expect(compAny.mapearTipoPublico('DESCONOCIDO')).toBe('OTRO');
    expect(compAny.mapearTipoPublico(undefined)).toBe('OTRO');
  });

  it('debe consultar lugares en el backend y actualizar la lista', () => {
    const mockLugaresBackend = [
      {
        osmId: 999,
        nombre: 'Gimnasio Backend OSM',
        categoria: 'GIMNASIO',
        tipoOrigen: 'OSM',
        direccion: 'Calle Test, Valencia',
        latitud: 39.469,
        longitud: -0.376,
        distanciaKm: 0.3,
      },
      {
        id: 4,
        nombre: 'Centro de la app',
        categoria: 'GIMNASIO',
        tipoOrigen: 'LOCAL_PRIVADO',
        direccion: 'Calle Colón 1',
        latitud: 39.47,
        longitud: -0.375,
      },
    ];

    const httpTesting = TestBed.inject(HttpTestingController);
    component.buscarLugaresEnBackend(39.4699, -0.3763, 5, 'GIMNASIO');

    const req = httpTesting.expectOne((r) => r.url.includes('/api/explorar/lugares'));
    expect(req.request.method).toBe('GET');
    req.flush(mockLugaresBackend);

    expect(component.lugares().some((l) => l.nombre === 'Gimnasio Backend OSM')).toBe(true);
    // El backend marca los sitios de la app como LOCAL_PRIVADO / LOCAL_PUBLICO.
    expect(component.lugares().find((l) => l.nombre === 'Centro de la app')?.tipoOrigen).toBe(
      'PRIVADO',
    );
  });
});
