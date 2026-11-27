import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';

import { userGuard } from './user-guard';

describe('userGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  const ejecutar = () =>
    TestBed.runInInjectionContext(() =>
      userGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/mis-entrenamientos' } as RouterStateSnapshot,
      ),
    ) as Observable<boolean | UrlTree>;

  it('conserva la ruta solicitada si no hay sesión', () => {
    let resultado: boolean | UrlTree | undefined;
    ejecutar().subscribe((valor) => (resultado = valor));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe(
      '/login?returnUrl=%2Fmis-entrenamientos',
    );
  });

  it('no deja a ADMIN entrar en rutas de USER', () => {
    let resultado: boolean | UrlTree | undefined;
    ejecutar().subscribe((valor) => (resultado = valor));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush({ username: 'admin', email: 'admin@example.test', rol: 'ADMIN' });
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/inicio');
  });
});
