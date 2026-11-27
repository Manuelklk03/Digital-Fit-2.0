import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { EstadisticaUsuario } from '../../models/progreso';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../services/auth-service';

const DATOS: EstadisticaUsuario = {
  entrenamientosRealizados: 12,
  minutosEntrenados: 540,
  promedioMinutosEntrenamiento: 45,
  centrosPrivadosVisitados: 2,
  lugaresPublicosVisitados: 3,
  entrenamientoMasRealizado: 'Fuerza total',
};

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let http: HttpTestingController;
  let i18n: I18nService;

  beforeEach(async () => {
    localStorage.removeItem('digitalfit_lang');
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    i18n = TestBed.inject(I18nService);
    i18n.cambiarIdioma('es');
    fixture = TestBed.createComponent(DashboardComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  afterEach(() => {
    localStorage.removeItem('digitalfit_lang');
    localStorage.removeItem('digitalfit_guia_inicial_v1:ana');
    http.verify();
  });

  const actividad = () =>
    fixture.nativeElement.querySelector('.dashboard-actividad') as HTMLElement;

  it('muestra carga y después los totales reales del historial', () => {
    expect(actividad().textContent).toContain('Cargando tu actividad');

    http.expectOne('/api/estadisticas').flush(DATOS);
    fixture.detectChanges();

    expect(actividad().querySelectorAll('dd').length).toBe(2);
    expect(actividad().textContent).toContain('12');
    expect(actividad().textContent).toContain('540');
    expect(actividad().textContent).toContain('Totales de tu historial');
    expect(actividad().textContent).not.toContain('esta semana');
  });

  it('muestra un estado vacío cuando no hay entrenamientos', () => {
    http.expectOne('/api/estadisticas').flush({ ...DATOS, entrenamientosRealizados: 0 });
    fixture.detectChanges();

    expect(actividad().textContent).toContain('Todavía no tienes entrenamientos registrados');
    expect(actividad().querySelector('dl')).toBeNull();
  });

  it('permite reintentar tras un error de la API', () => {
    http.expectOne('/api/estadisticas').flush(null, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(actividad().querySelector('[role="alert"]')).not.toBeNull();
    (actividad().querySelector('button') as HTMLButtonElement).click();
    http.expectOne('/api/estadisticas').flush(DATOS);
    fixture.detectChanges();

    expect(actividad().textContent).toContain('540');
  });

  it('usa rutas funcionales y cambia los textos al seleccionar otro idioma', () => {
    http.expectOne('/api/estadisticas').flush(DATOS);
    fixture.detectChanges();

    const enlaces = Array.from(
      fixture.nativeElement.querySelectorAll('main a') as NodeListOf<HTMLAnchorElement>,
    );
    expect(enlaces.some((enlace) => enlace.getAttribute('href') === '/entrenar')).toBe(true);
    expect(enlaces.some((enlace) => enlace.getAttribute('href') === '/progreso')).toBe(true);
    expect(enlaces.some((enlace) => enlace.getAttribute('href') === '/mis-entrenamientos')).toBe(
      true,
    );
    expect(
      enlaces.some((enlace) => enlace.getAttribute('href') === '/historial-entrenamientos'),
    ).toBe(true);

    i18n.cambiarIdioma('en');
    fixture.detectChanges();
    expect(actividad().textContent).toContain('Your activity');
    expect(actividad().textContent).toContain('Workouts completed');
  });

  it('muestra la guía opcional a USER y permite omitirla y recuperarla', () => {
    http.expectOne('/api/estadisticas').flush(DATOS);
    TestBed.inject(AuthService).me().subscribe();
    http
      .expectOne('/api/auth/me')
      .flush({ username: 'ana', email: 'ana@example.test', rol: 'USER' });
    fixture.detectChanges();

    const guia = fixture.nativeElement.querySelector('.dashboard-guia') as HTMLElement;
    const boton = guia.querySelector('button') as HTMLButtonElement;
    const contenido = guia.querySelector('#dashboard-guia-contenido') as HTMLElement;
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    expect(contenido.hidden).toBe(false);
    expect(Array.from(contenido.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual([
      '/explorar',
      '/entrenamientos',
      '/progreso',
    ]);

    boton.click();
    fixture.detectChanges();
    expect(contenido.hidden).toBe(true);
    expect(boton.getAttribute('aria-expanded')).toBe('false');

    boton.click();
    fixture.detectChanges();
    expect(contenido.hidden).toBe(false);
    expect(boton.getAttribute('aria-expanded')).toBe('true');
  });
});
