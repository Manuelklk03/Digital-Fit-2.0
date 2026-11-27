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

import { adminGuard } from './admin-guard';

describe('adminGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  const ejecutar = () =>
    TestBed.runInInjectionContext(() =>
      adminGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/admin/crear-admin' } as RouterStateSnapshot,
      ),
    ) as Observable<boolean | UrlTree>;

  it('conserva la ruta administrativa si no hay sesión', () => {
    let resultado: boolean | UrlTree | undefined;
    ejecutar().subscribe((valor) => (resultado = valor));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe(
      '/login?returnUrl=%2Fadmin%2Fcrear-admin',
    );
  });

  it('envía al Dashboard a USER y permite el acceso a ADMIN', () => {
    const resultados: (boolean | UrlTree)[] = [];
    ejecutar().subscribe((valor) => resultados.push(valor));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush({ username: 'ana', email: 'ana@example.test', rol: 'USER' });
    expect(TestBed.inject(Router).serializeUrl(resultados[0] as UrlTree)).toBe('/dashboard');

    ejecutar().subscribe((valor) => resultados.push(valor));
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush({ username: 'admin', email: 'admin@example.test', rol: 'ADMIN' });
    expect(resultados[1]).toBe(true);
  });
});
