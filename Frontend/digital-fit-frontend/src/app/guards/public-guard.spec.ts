import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';

import { publicGuard } from './public-guard';

describe('publicGuard', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'inicio', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  const ejecutar = (returnUrl?: string) =>
    TestBed.runInInjectionContext(() =>
      publicGuard(
        {
          queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
        } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as Observable<boolean | UrlTree>;

  it('deja entrar sin sesión y redirige con sesión (consulta /api/auth/me)', () => {
    const resultados: (boolean | UrlTree)[] = [];
    ejecutar().subscribe((r) => resultados.push(r));
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    ejecutar().subscribe((r) => resultados.push(r));
    http.expectOne('/api/auth/me').flush({ username: 'u', email: 'u@x.es', rol: 'USER' });
    expect(resultados[0]).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(resultados[1] as UrlTree)).toBe('/dashboard');
  });

  it('recupera una ruta privada segura para una sesión ya iniciada', () => {
    let resultado: boolean | UrlTree | undefined;
    ejecutar('/mis-entrenamientos?pagina=2').subscribe((valor) => (resultado = valor));
    http
      .expectOne('/api/auth/me')
      .flush({ username: 'ana', email: 'ana@example.test', rol: 'USER' });
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe(
      '/mis-entrenamientos?pagina=2',
    );
  });
});
