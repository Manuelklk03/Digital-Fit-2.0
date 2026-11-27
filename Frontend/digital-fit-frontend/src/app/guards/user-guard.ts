import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { map, catchError, of } from 'rxjs';

export const userGuard: CanActivateFn = (_ruta, estado) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map((usuario) => {
      if (usuario?.rol === 'USER') {
        return true;
      }

      return router.parseUrl('/inicio');
    }),
    catchError(() =>
      of(router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } })),
    ),
  );
};
