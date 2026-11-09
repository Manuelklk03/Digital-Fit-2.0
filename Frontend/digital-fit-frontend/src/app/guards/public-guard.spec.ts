import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';

import { publicGuard } from './public-guard';

describe('publicGuard', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'inicio', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  const ejecutar = () =>
    TestBed.runInInjectionContext(() =>
      publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean>;

  it('deja entrar sin sesión y redirige con sesión (consulta /api/auth/me)', () => {
    const resultados: boolean[] = [];
    ejecutar().subscribe((r) => resultados.push(r));
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    ejecutar().subscribe((r) => resultados.push(r));
    http.expectOne('/api/auth/me').flush({ username: 'u', email: 'u@x.es', rol: 'USER' });
    expect(resultados).toEqual([true, false]);
  });
});
