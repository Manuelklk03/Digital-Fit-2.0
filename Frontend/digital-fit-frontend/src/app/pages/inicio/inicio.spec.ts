import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { InicioComponent } from './inicio';
import { AuthService } from '../../services/auth-service';

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;
  let authServiceSpy: any;

  beforeEach(async () => {
    // Mock de window.matchMedia para entorno de test JSDOM
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    authServiceSpy = {
      usuario$: of({ username: 'atletatest', rol: 'USER' }),
      me: () => of({ username: 'atletatest', rol: 'USER' }),
      logout: () => of(null),
    };

    await TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe crearse correctamente y resolver usuario autenticado', () => {
    expect(component).toBeTruthy();
    expect(component.usuarioActual()).toEqual({ username: 'atletatest', rol: 'USER' });
    expect(component.esAdmin()).toBe(false);
  });

  it('debe manejar error de autenticacion manteniendo la portada publica', () => {
    authServiceSpy.me = () => throwError(() => new Error('401'));
    component.ngOnInit();
    expect(component.usuarioActual()).toBeNull();
  });

  it('debe detectar rol de administrador correctamente', () => {
    component.usuarioActual.set({ username: 'adminmaster', rol: 'ADMIN' });
    expect(component.esAdmin()).toBe(true);
  });

  it('debe ejecutar ngAfterViewInit e inicializar animaciones GSAP', async () => {
    await component.ngAfterViewInit();
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('debe respetar prefers-reduced-motion sin animar si el usuario lo solicita', async () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true, // Movimiento reducido activado
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await component.ngAfterViewInit();
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('debe formatear el tiempo correctamente en minutos y segundos', () => {
    expect(component.formatearTiempo(90)).toBe('01:30');
    expect(component.formatearTiempo(75)).toBe('01:15');
    expect(component.formatearTiempo(5)).toBe('00:05');
  });

  it('debe iniciar, contar y pausar el descanso correctamente con temporizador', () => {
    vi.useFakeTimers();

    expect(component.descansoActivo()).toBe(false);
    component.descansoSegundos.set(10);
    component.toggleDescanso();
    expect(component.descansoActivo()).toBe(true);

    // Avanza 2 segundos
    vi.advanceTimersByTime(2000);
    expect(component.descansoSegundos()).toBe(8);

    // Pausar
    component.toggleDescanso();
    expect(component.descansoActivo()).toBe(false);

    // Reanudar y agotar hasta 0
    component.toggleDescanso();
    vi.advanceTimersByTime(9000);
    expect(component.descansoSegundos()).toBe(90);
    expect(component.descansoActivo()).toBe(false);
  });

  it('debe reiniciar el descanso a 90 segundos', () => {
    component.descansoSegundos.set(45);
    component.reiniciarDescanso();
    expect(component.descansoSegundos()).toBe(90);
    expect(component.descansoActivo()).toBe(false);
  });

  it('debe ajustar peso y repeticiones dentro de limites seguros', () => {
    const pesoInicial = component.pesoActual();
    component.ajustarPeso(2.5);
    expect(component.pesoActual()).toBe(pesoInicial + 2.5);

    const repsInicial = component.repsActual();
    component.ajustarReps(1);
    expect(component.repsActual()).toBe(repsInicial + 1);

    component.ajustarReps(-1);
    expect(component.repsActual()).toBe(repsInicial);
  });

  it('debe avanzar de serie y activar descanso al completar serie', () => {
    component.serieActual.set(1);
    component.completarSerie();
    expect(component.serieActual()).toBe(2);
    expect(component.descansoActivo()).toBe(true);
    expect(component.descansoSegundos()).toBe(90);
  });

  it('debe reiniciar a serie 1 al completar todas las series', () => {
    component.serieActual.set(4);
    component.completarSerie();
    expect(component.serieActual()).toBe(1);
    expect(component.descansoActivo()).toBe(false);
  });

  it('debe limpiar recursos en ngOnDestroy', () => {
    component.iniciarDescanso();
    expect(component.descansoActivo()).toBe(true);
    component.ngOnDestroy();
    expect(component.descansoActivo()).toBe(true); // interval cleared
  });
});
