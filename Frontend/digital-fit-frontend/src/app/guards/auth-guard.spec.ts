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

import { authGuard } from './auth-guard';

describe('authGuard', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  const ejecutar = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/mis-entrenamientos' } as RouterStateSnapshot,
      ),
    ) as Observable<boolean | UrlTree>;

  // /api/auth/yo se retiró en la tarea 4.1: el guard debe usar /api/auth/me.
  it('deja pasar con sesión válida en /api/auth/me', () => {
    let resultado: boolean | UrlTree | undefined;
    ejecutar().subscribe((r) => (resultado = r));
    http.expectOne('/api/auth/me').flush({ username: 'u', email: 'u@x.es', rol: 'USER' });
    expect(resultado).toBe(true);
  });

  it('bloquea sin sesión', () => {
    let resultado: boolean | UrlTree | undefined;
    ejecutar().subscribe((r) => (resultado = r));
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe(
      '/login?returnUrl=%2Fmis-entrenamientos',
    );
  });
});
