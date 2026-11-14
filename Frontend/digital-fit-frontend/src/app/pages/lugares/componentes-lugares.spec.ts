import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { FormularioSitioComponent } from './formulario-sitio';
import { FiltroSitiosComponent } from './filtro-sitios';
import { TarjetaSitioComponent } from './tarjeta-sitio';
import {
  Autocompletado,
  CentroPrivado,
  coordenadasLegibles,
  esLugarPublico,
  LugarPublico,
  SitioForm,
} from '../../models/lugar';

const CENTRO: CentroPrivado = {
  id: 1,
  nombre: 'Gym',
  direccion: 'Calle 1',
  telefono: '600',
  horario: '7-23',
  descripcion: 'Sala',
  latitud: 39.47,
  longitud: -0.376,
  precioMensual: 30,
};
const LUGAR: LugarPublico = {
  id: 2,
  nombre: 'Parque',
  direccion: 'Turia',
  telefono: null,
  horario: null,
  descripcion: null,
  latitud: 39.48,
  longitud: -0.37,
  tipo: 'ZONA_BARRAS',
};
const PROVIDERS = [provideRouter([]), provideHttpClient(), provideHttpClientTesting()];

describe('Modelo de lugares', () => {
  it('distingue lugares de centros y formatea coordenadas', () => {
    expect(esLugarPublico(LUGAR)).toBe(true);
    expect(esLugarPublico(CENTRO)).toBe(false);
    expect(coordenadasLegibles(39.4699, -0.3763)).toBe('39.46990, -0.37630');
    expect(coordenadasLegibles(null, 1)).toBeNull();
  });
});

describe('FormularioSitioComponent', () => {
  let fixture: ComponentFixture<FormularioSitioComponent>;
  let component: FormularioSitioComponent;
  let emitido: SitioForm | undefined;

  function crear(clase: 'centro' | 'lugar', inicial: CentroPrivado | LugarPublico | null = null) {
    TestBed.configureTestingModule({ imports: [FormularioSitioComponent], providers: PROVIDERS });
    fixture = TestBed.createComponent(FormularioSitioComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('clase', clase);
    fixture.componentRef.setInput('titulo', 'Nuevo');
    fixture.componentRef.setInput('textoEnviar', 'Crear');
    fixture.componentRef.setInput('inicial', inicial);
    emitido = undefined;
    component.guardar.subscribe((d) => (emitido = d));
    fixture.detectChanges();
  }

  afterEach(() => vi.useRealTimers());

  it('exige nombre, dirección y ubicación', () => {
    crear('centro');
    component.enviar();
    expect(component.errores()).toEqual(['ubicacion', 'nombre', 'direccion']);
    expect(emitido).toBeUndefined();
  });

  it('rechaza un precio negativo', () => {
    crear('centro', CENTRO);
    component.modelo.precioMensual = -5;
    component.enviar();
    expect(component.errores()).toEqual(['precioMensual']);
  });

  it('emite el cuerpo de un centro con la ubicación marcada', () => {
    crear('centro');
    component.marcar({ latitud: 39.4, longitud: -0.3 });
    component.modelo = {
      ...component.modelo,
      nombre: ' Gym ',
      direccion: 'Calle 2',
      precioMensual: 25,
    };
    component.enviar();
    expect(emitido).toEqual({
      nombre: 'Gym',
      direccion: 'Calle 2',
      telefono: null,
      horario: null,
      descripcion: null,
      latitud: 39.4,
      longitud: -0.3,
      precioMensual: 25,
    });
  });

  it('al editar un lugar parte de sus datos y emite el tipo', () => {
    crear('lugar', LUGAR);
    expect(component.coordenadas()).toBe('39.48000, -0.37000');
    component.enviar();
    expect(emitido).toEqual({
      nombre: 'Parque',
      direccion: 'Turia',
      telefono: null,
      horario: null,
      descripcion: null,
      latitud: 39.48,
      longitud: -0.37,
      tipo: 'ZONA_BARRAS',
    });
  });

  it('autocompleta tras marcar y conserva lo que no llega', () => {
    vi.useFakeTimers();
    crear('lugar');
    const respuesta = new Subject<Autocompletado>();
    const autocompletar = vi.fn(() => respuesta);
    fixture.componentRef.setInput('autocompletar', autocompletar);
    component.modelo.horario = '24 h';

    component.marcar({ latitud: 39.4, longitud: -0.3 });
    expect(component.estadoAutocompletado()).toBe('buscando');
    expect(component.textoAyuda()).toContain('Buscando');
    vi.advanceTimersByTime(800);
    expect(autocompletar).toHaveBeenCalledWith(39.4, -0.3);

    respuesta.next({
      direccion: 'Av. del Puerto',
      telefono: null,
      horario: null,
      descripcion: 'Pistas',
      tipo: 'PISTA_PADEL',
      latitud: 39.4,
      longitud: -0.3,
      datosEncontrados: true,
    });
    expect(component.modelo.direccion).toBe('Av. del Puerto');
    expect(component.modelo.horario).toBe('24 h');
    expect(component.modelo.tipo).toBe('PISTA_PADEL');
    expect(component.estadoAutocompletado()).toBe('ok');
  });

  it('no borra con las cadenas vacías del backend ni pisa lo escrito durante la espera', () => {
    vi.useFakeTimers();
    crear('lugar');
    const respuestas: Autocompletado[] = [
      {
        direccion: 'Calle A',
        telefono: '',
        horario: '  ',
        descripcion: 'Pistas',
        tipo: 'PISTA_TENIS',
        latitud: 1,
        longitud: 1,
        datosEncontrados: true,
      },
      {
        direccion: 'Calle B',
        telefono: '',
        horario: '',
        descripcion: 'Otra',
        tipo: 'PISTA_PADEL',
        latitud: 1,
        longitud: 1,
        datosEncontrados: true,
      },
    ];
    fixture.componentRef.setInput('autocompletar', () => of(respuestas.shift() as Autocompletado));
    component.modelo.telefono = '600';

    component.marcar({ latitud: 39.4, longitud: -0.3 });
    vi.advanceTimersByTime(800);
    expect(component.modelo).toMatchObject({
      direccion: 'Calle A',
      telefono: '600',
      horario: '',
      tipo: 'PISTA_TENIS',
    });

    // Al mover el marcador se sustituye lo autocompletado, pero no lo que el usuario cambió mientras tanto.
    component.marcar({ latitud: 39.41, longitud: -0.3 });
    component.modelo.descripcion = 'Escrita a mano';
    component.modelo.tipo = 'ZONA_BARRAS';
    vi.advanceTimersByTime(800);
    expect(component.modelo).toMatchObject({
      direccion: 'Calle B',
      descripcion: 'Escrita a mano',
      tipo: 'ZONA_BARRAS',
    });
  });

  it('con la ubicación marcada, el foco va al primer campo con error y no al buscador del mapa', async () => {
    crear('centro');
    component.marcar({ latitud: 39.4, longitud: -0.3 });
    component.enviar();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('sitio-nombre');
  });

  it('indica cuando no hay datos o la consulta falla', () => {
    vi.useFakeTimers();
    crear('centro');
    fixture.componentRef.setInput('autocompletar', () =>
      of({ datosEncontrados: false } as Autocompletado),
    );
    component.marcar({ latitud: 39.4, longitud: -0.3 });
    vi.advanceTimersByTime(800);
    expect(component.estadoAutocompletado()).toBe('sinDatos');

    fixture.componentRef.setInput('autocompletar', () => throwError(() => new Error('x')));
    component.marcar({ latitud: 39.41, longitud: -0.3 });
    vi.advanceTimersByTime(800);
    expect(component.estadoAutocompletado()).toBe('error');
    expect(component.textoAyuda()).toContain('a mano');
  });
});

describe('FiltroSitiosComponent', () => {
  it('ofrece precio a los centros y tipo a los lugares, y emite un solo campo', () => {
    TestBed.configureTestingModule({ imports: [FiltroSitiosComponent] });
    const fixture = TestBed.createComponent(FiltroSitiosComponent);
    fixture.componentRef.setInput('clase', 'lugar');
    fixture.detectChanges();
    const opciones = () =>
      [...fixture.nativeElement.querySelectorAll('#filtro-campo option')].map(
        (o: HTMLOptionElement) => o.value,
      );
    expect(opciones()).toEqual(['nombre', 'direccion', 'tipo']);

    const emitidos: unknown[] = [];
    fixture.componentInstance.filtrar.subscribe((f) => emitidos.push(f));
    fixture.componentInstance.cambiarCampo('tipo');
    fixture.componentInstance.valor = 'PISTA_TENIS';
    fixture.componentInstance.aplicar();
    fixture.componentInstance.limpiar();
    expect(emitidos).toEqual([{ campo: 'tipo', valor: 'PISTA_TENIS' }, null]);

    fixture.componentRef.setInput('clase', 'centro');
    fixture.detectChanges();
    expect(opciones()).toEqual(['nombre', 'direccion', 'precioMensual']);
  });
});

describe('TarjetaSitioComponent', () => {
  function pintar(sitio: CentroPrivado | LugarPublico): string {
    TestBed.configureTestingModule({
      imports: [TarjetaSitioComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(TarjetaSitioComponent);
    fixture.componentRef.setInput('sitio', sitio);
    fixture.componentRef.setInput('ruta', ['/x', sitio.id]);
    fixture.detectChanges();
    return fixture.nativeElement.textContent;
  }

  it('muestra el precio de un centro', () => {
    expect(pintar(CENTRO)).toContain('30');
  });

  it('muestra «precio no indicado» si falta', () => {
    expect(pintar({ ...CENTRO, precioMensual: null })).toContain('Precio no indicado');
  });

  it('muestra el tipo de un lugar', () => {
    expect(pintar(LUGAR)).toContain('Zona de barras');
  });
});
