import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = (_ruta, estado) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map((usuario) => {
      if (usuario?.rol === 'ADMIN') {
        return true;
      }

      return router.parseUrl('/dashboard');
    }),
    catchError(() =>
      of(router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } })),
    ),
  );
};
