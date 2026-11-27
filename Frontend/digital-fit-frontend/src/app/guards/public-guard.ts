import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { destinoTrasLogin } from './retorno-login';

export const publicGuard: CanActivateFn = (ruta) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map((usuario) =>
      router.parseUrl(destinoTrasLogin(ruta.queryParamMap.get('returnUrl'), usuario.rol)),
    ),
    catchError(() => of(true)),
  );
};
