import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EntrenamientosComunidadComponent } from './entrenamientos-comunidad';

const comun = { descripcion: 'd', categoria: 'HIIT', nivel: 'INTERMEDIO', duracionEnMinutos: 25, fechaPublicacion: '2026-11-01 10:00:00' };

describe('EntrenamientosComunidadComponent', () => {
  let fixture: ComponentFixture<EntrenamientosComunidadComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenamientosComunidadComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EntrenamientosComunidadComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.match('/api/auth/me').forEach((r) => r.flush({ username: 'ana', email: 'a@x.es', rol: 'USER' }));
    http.expectOne((r) => r.url === '/api/entrenamientos-comunidad').flush({
      content: [
        { id: 1, nombre: 'Mío', usuario: 'ana', ...comun },
        { id: 2, nombre: 'Ajeno', usuario: 'luis', ...comun },
      ],
      page: 0, size: 12, totalElements: 2, totalPages: 1,
    });
    fixture.detectChanges();
  });

  it('marca como propio solo lo publicado por el usuario de la sesión', () => {
    const tarjetas: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('app-tarjeta-entrenamiento'));
    expect(tarjetas[0].textContent).toContain('Tuyo');
    expect(tarjetas[0].textContent).toContain('Borrar');
    expect(tarjetas[1].textContent).not.toContain('Tuyo');
    expect(tarjetas[1].textContent).toContain('Añadir a mis entrenamientos');
  });

  it('añade un entrenamiento ajeno a mis entrenamientos y avisa', () => {
    const anadir: HTMLButtonElement = fixture.nativeElement
      .querySelectorAll('app-tarjeta-entrenamiento')[1].querySelector('button');
    anadir.click();
    http.expectOne('/api/mis-entrenamientos/desde-comunidad/2').flush({});
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-alert')?.textContent).toContain('Añadido a tus entrenamientos.');
  });
});
