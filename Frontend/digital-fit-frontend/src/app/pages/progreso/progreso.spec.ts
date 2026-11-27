import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProgresoComponent } from './progreso';

describe('ProgresoComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('digitalfit_lang');
    await TestBed.configureTestingModule({
      imports: [ProgresoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => localStorage.removeItem('digitalfit_lang'));

  it('muestra los totales reales y enlaza al detalle existente', () => {
    const fixture = TestBed.createComponent(ProgresoComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    http
      .expectOne('/api/estadisticas')
      .flush({ entrenamientosRealizados: 4, minutosEntrenados: 120 });
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.querySelectorAll('dd').length).toBe(2);
    expect(main.textContent).toContain('120');
    expect(Array.from(main.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual([
      '/historial-entrenamientos',
      '/estadisticas',
      '/valoraciones',
    ]);
    http.verify();
  });
});
