import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { MisEntrenamientosComponent } from './mis-entrenamientos';
import { EntrenamientoUsuario } from '../../../models/entrenamiento';

const E: EntrenamientoUsuario = {
  id: 3,
  nombre: 'Core',
  descripcion: 'd',
  categoria: 'FUERZA_CORE',
  nivel: 'INTERMEDIO',
  duracionEnMinutos: 15,
};
const pagina = (content: unknown[]) => ({
  content,
  page: 0,
  size: 12,
  totalElements: content.length,
  totalPages: 1,
});

describe('MisEntrenamientosComponent', () => {
  let fixture: ComponentFixture<MisEntrenamientosComponent>;
  let http: HttpTestingController;
  const listado = () =>
    http.expectOne((r) => r.method === 'GET' && r.url === '/api/mis-entrenamientos');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisEntrenamientosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(MisEntrenamientosComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('sin entrenamientos ofrece ir al catálogo', () => {
    listado().flush(pagina([]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a[href="/entrenamientos"]')).toBeTruthy();
  });

  it('crea un entrenamiento, cierra el formulario y recarga', () => {
    listado().flush(pagina([]));
    const c = fixture.componentInstance;
    c.formAbierto.set(true);
    c.crear({
      nombre: 'Nuevo',
      descripcion: 'd',
      categoria: 'HIIT',
      nivel: 'AVANZADO',
      duracionEnMinutos: 20,
    });

    http.expectOne((r) => r.method === 'POST').flush(E);
    listado().flush(pagina([E]));
    fixture.detectChanges();

    expect(c.formAbierto()).toBe(false);
    expect(c.aviso.actual()?.tipo).toBe('exito');
    expect(fixture.nativeElement.textContent).toContain('Core');
  });

  it('borra tras confirmar y muestra el error del backend si falla', () => {
    listado().flush(pagina([E]));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const c = fixture.componentInstance;

    c.borrar(E);
    http
      .expectOne('/api/mis-entrenamientos/3')
      .flush({ detail: 'No permitido' }, { status: 403, statusText: 'Forbidden' });

    expect(c.aviso.actual()).toEqual({ texto: 'No permitido', tipo: 'error' });
    expect(c.ocupado()).toBeNull();
  });
});
