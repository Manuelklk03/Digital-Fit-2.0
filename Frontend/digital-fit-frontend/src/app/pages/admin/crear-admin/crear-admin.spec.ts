import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CrearAdminComponent } from './crear-admin';

describe('CrearAdminComponent', () => {
  let fixture: ComponentFixture<CrearAdminComponent>;
  let component: CrearAdminComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAdminComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(CrearAdminComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('valida usuario, correo y longitud de contraseña sin enviar', () => {
    component.email = 'no-es-correo';
    component.password = '123';
    component.crear();
    expect(component.errores()).toEqual(['username', 'email', 'password']);
    http.expectNone('/api/admin/crear-admin');
  });

  it('crea el admin y limpia el formulario', () => {
    component.username = ' admin2 ';
    component.email = 'admin2@digitalfit.es';
    component.password = 'Secreto1';
    component.crear();
    const req = http.expectOne('/api/admin/crear-admin');
    expect(req.request.body).toEqual({ username: 'admin2', email: 'admin2@digitalfit.es', password: 'Secreto1' });
    req.flush('Admin creado');
    expect(component.aviso.actual()?.tipo).toBe('exito');
    expect(component.username).toBe('');
  });

  it('muestra el detalle del error del backend', () => {
    component.username = 'admin1';
    component.email = 'admin1@digitalfit.es';
    component.password = 'Secreto1';
    component.crear();
    http.expectOne('/api/admin/crear-admin').flush(JSON.stringify({ detail: 'El usuario ya existe' }), { status: 409, statusText: 'Conflict' });
    expect(component.aviso.actual()).toEqual({ texto: 'El usuario ya existe', tipo: 'error' });
  });
});
