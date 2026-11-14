import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { DetalleEntrenamientoComunidadComponent } from './detalle-entrenamiento-comunidad';

const E = {
  id: 9,
  nombre: 'Trail',
  descripcion: 'Monte',
  categoria: 'TRAIL_RUNNING',
  nivel: 'EXPERTO',
  duracionEnMinutos: 90,
  usuario: 'ana',
  fechaPublicacion: '2026-11-01 10:00:00',
};

describe('DetalleEntrenamientoComunidadComponent', () => {
  let fixture: ComponentFixture<DetalleEntrenamientoComunidadComponent>;
  let http: HttpTestingController;

  async function crear(username: string) {
    await TestBed.configureTestingModule({
      imports: [DetalleEntrenamientoComunidadComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '9' }) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DetalleEntrenamientoComunidadComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.match('/api/auth/me').forEach((r) => r.flush({ username, email: 'x@x.es', rol: 'USER' }));
    http.expectOne('/api/entrenamientos-comunidad/9').flush(E);
    fixture.detectChanges();
  }

  it('muestra autor y fecha y permite añadir lo ajeno', async () => {
    await crear('luis');
    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('ana');
    expect(texto).toContain('2026');
    expect(texto).not.toContain('Tuyo');

    fixture.nativeElement.querySelector('.acciones button').click();
    http.expectOne('/api/mis-entrenamientos/desde-comunidad/9').flush({});
    expect(fixture.componentInstance.aviso.actual()?.tipo).toBe('exito');
  });

  it('el autor ve «Tuyo» y puede borrar', async () => {
    await crear('ana');
    expect(fixture.nativeElement.textContent).toContain('Tuyo');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.acciones button').click();
    http.expectOne((r) => r.method === 'DELETE').flush(null);

    expect(navegar).toHaveBeenCalledWith(['/entrenamientos-comunidad']);
  });
});
