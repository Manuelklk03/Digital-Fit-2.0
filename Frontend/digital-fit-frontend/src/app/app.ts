import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter, take } from 'rxjs';
import { SkeletonComponent } from './components/ui';
import { I18nService } from './i18n/i18n.service';
import { SeoService } from './services/seo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SkeletonComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('digital-fit-frontend');
  protected readonly i18n = inject(I18nService);
  /** Verdadero hasta que termina la primera navegación: los guards esperan a `/api/auth/me`, que tarda si el backend está dormido. */
  protected readonly primeraCarga = signal(true);

  constructor() {
    inject(SeoService); // empieza a aplicar título, descripción y robots por ruta
    inject(Router)
      .events.pipe(
        filter(
          (e) =>
            e instanceof NavigationEnd ||
            e instanceof NavigationError ||
            (e instanceof NavigationCancel && !seguiraOtraNavegacion(e)),
        ),
        take(1),
      )
      .subscribe(() => this.primeraCarga.set(false));
  }
}

/**
 * Los guards (authGuard, userGuard...) redirigen con router.navigate() y devuelven false: la navegación se cancela
 * pero otra (al login o a /inicio) ya viene detrás. Hay que mantener el esqueleto hasta que esa termine.
 * shortcut: un guard futuro que devuelva false sin redirigir dejaría el esqueleto en pantalla; devolver un UrlTree lo evita.
 */
function seguiraOtraNavegacion(cancelacion: NavigationCancel): boolean {
  return [
    NavigationCancellationCode.GuardRejected,
    NavigationCancellationCode.SupersededByNewNavigation,
    NavigationCancellationCode.Redirect,
  ].includes(cancelacion.code as NavigationCancellationCode);
}
