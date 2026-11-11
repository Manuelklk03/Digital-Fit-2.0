import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginComponent } from './login';
import { AuthService } from '../../services/auth-service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar alerta de error si se envía el formulario vacío', () => {
    component.username = '';
    component.password = '';
    component.iniciarSesion();

    expect(component.alerta()).not.toBeNull();
    expect(component.alerta()?.tipo).toBe('error');
  });

  it('debe autocompletar credenciales demo de usuario estándar', () => {
    component.cargarCredencialesDemo('user');
    expect(component.username).toBe('usuario1');
    expect(component.password).toBe('Usuario123!');
  });

  it('debe autocompletar credenciales demo de administrador', () => {
    component.cargarCredencialesDemo('admin');
    expect(component.username).toBe('admin1');
    expect(component.password).toBe('Admin123!');
  });

  it('debe gestionar el inicio de sesión exitoso', () => {
    vi.spyOn(authService, 'login').mockReturnValue(of('ok'));
    vi.spyOn(authService, 'me').mockReturnValue(of({ username: 'usuario1', email: 'u@u.es', rol: 'USER' }));

    component.username = 'usuario1';
    component.password = 'Usuario123!';
    component.iniciarSesion();

    expect(authService.login).toHaveBeenCalledWith('usuario1', 'Usuario123!');
    expect(component.alerta()?.tipo).toBe('exito');
  });

  it('debe mostrar error de credenciales si login falla', () => {
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => new Error('Credenciales inválidas')));

    component.username = 'usuario1';
    component.password = 'incorrecta';
    component.iniciarSesion();

    expect(component.alerta()?.tipo).toBe('error');
    expect(component.cargando).toBe(false);
  });

  it('con 429 avisa del límite de intentos en lugar de decir que la clave es incorrecta', () => {
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429 })));

    component.username = 'usuario1';
    component.password = 'Usuario123!';
    component.iniciarSesion();

    expect(component.alerta()?.texto).toContain('Demasiados intentos');
    expect(component.alerta()?.texto).not.toContain('incorrectos');
    expect(component.cargando).toBe(false);
  });

  it('con 401 sigue diciendo que usuario o contraseña son incorrectos', () => {
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

    component.username = 'usuario1';
    component.password = 'mala';
    component.iniciarSesion();

    expect(component.alerta()?.texto).toContain('incorrectos');
  });
});
