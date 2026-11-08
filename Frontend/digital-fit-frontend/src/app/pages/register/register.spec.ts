import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RegisterComponent } from './register';
import { AuthService } from '../../services/auth-service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe rechazar registro con campos vacíos', () => {
    component.username = '';
    component.email = '';
    component.password = '';
    component.registrar();

    expect(component.mensajeAlerta).toBeTruthy();
    expect(component.tipoAlerta).toBe('error');
  });

  it('debe rechazar un email con formato inválido', () => {
    component.username = 'nuevoUsuario';
    component.email = 'correo-no-valido';
    component.password = 'Password123!';
    component.registrar();

    expect(component.mensajeAlerta).toBeTruthy();
    expect(component.tipoAlerta).toBe('error');
  });

  it('debe rechazar una contraseña de longitud inferior a 6 caracteres', () => {
    component.username = 'nuevoUsuario';
    component.email = 'usuario@ejemplo.com';
    component.password = '12345';
    component.registrar();

    expect(component.mensajeAlerta).toBeTruthy();
    expect(component.tipoAlerta).toBe('error');
  });

  it('debe procesar el registro satisfactoriamente cuando los datos son válidos', () => {
    vi.spyOn(authService, 'registrar').mockReturnValue(of('Usuario registrado'));

    component.username = 'nuevoAtleta';
    component.email = 'atleta@digitalfit.com';
    component.password = 'Atleta2026!';
    component.registrar();

    expect(authService.registrar).toHaveBeenCalledWith({
      username: 'nuevoAtleta',
      email: 'atleta@digitalfit.com',
      password: 'Atleta2026!',
    });
    expect(component.tipoAlerta).toBe('exito');
  });

  it('debe mostrar alerta de error cuando el servicio de autenticación falla', () => {
    vi.spyOn(authService, 'registrar').mockReturnValue(throwError(() => new Error('Error al registrar')));

    component.username = 'nuevoAtleta';
    component.email = 'atleta@digitalfit.com';
    component.password = 'Atleta2026!';
    component.registrar();

    expect(component.tipoAlerta).toBe('error');
    expect(component.cargando).toBe(false);
  });
});
