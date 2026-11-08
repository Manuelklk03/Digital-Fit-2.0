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

  it.each([
    { u: '', e: '', p: '', caso: 'campos vacíos' },
    { u: 'nuevoUsuario', e: 'correo-no-valido', p: 'Password123!', caso: 'email inválido' },
    { u: 'nuevoUsuario', e: 'usuario@ejemplo.com', p: '12345', caso: 'contraseña corta' },
  ])('debe rechazar registro con datos inválidos: $caso', ({ u, e, p }) => {
    component.username = u;
    component.email = e;
    component.password = p;
    component.registrar();

    expect(component.alerta()).not.toBeNull();
    expect(component.alerta()?.tipo).toBe('error');
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
    expect(component.alerta()?.tipo).toBe('exito');
  });

  it('debe mostrar alerta de error cuando el servicio de autenticación falla', () => {
    vi.spyOn(authService, 'registrar').mockReturnValue(throwError(() => new Error('Error al registrar')));

    component.username = 'nuevoAtleta';
    component.email = 'atleta@digitalfit.com';
    component.password = 'Atleta2026!';
    component.registrar();

    expect(component.alerta()?.tipo).toBe('error');
    expect(component.cargando).toBe(false);
  });
});
