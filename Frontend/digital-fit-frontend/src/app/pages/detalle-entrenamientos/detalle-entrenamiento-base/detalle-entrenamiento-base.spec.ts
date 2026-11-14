import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { DetalleEntrenamientoComponent } from './detalle-entrenamiento-base';

const E = {
  id: 4,
  nombre: 'HIIT 20',
  descripcion: 'Intervalos',
  categoria: 'HIIT',
  nivel: 'AVANZADO',
  duracionEnMinutos: 20,
};

describe('DetalleEntrenamientoComponent', () => {
  let fixture: ComponentFixture<DetalleEntrenamientoComponent>;
  let http: HttpTestingController;

  async function crear(rol: 'USER' | 'ADMIN') {
    await TestBed.configureTestingModule({
      imports: [DetalleEntrenamientoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '4' }) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DetalleEntrenamientoComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.match('/api/auth/me').forEach((r) => r.flush({ username: 'u', email: 'u@x.es', rol }));
    http.expectOne('/api/entrenamientos/4').flush(E);
    fixture.detectChanges();
  }

  it('muestra la ficha y añade a mis entrenamientos', async () => {
    await crear('USER');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('HIIT 20');

    fixture.nativeElement.querySelector('.acciones button').click();
    http.expectOne('/api/mis-entrenamientos/desde-base/4').flush({});
    expect(fixture.componentInstance.aviso.actual()?.tipo).toBe('exito');
  });

  it('el administrador borra y vuelve al catálogo', async () => {
    await crear('ADMIN');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.acciones button').click();
    http
      .expectOne((r) => r.method === 'DELETE' && r.url === '/api/admin/entrenamientos-base/4')
      .flush(null);

    expect(navegar).toHaveBeenCalledWith(['/entrenamientos']);
  });
});
