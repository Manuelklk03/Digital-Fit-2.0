import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';
import { SkeletonComponent } from './components/ui';
import { I18nService } from './i18n/i18n.service';

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
    inject(Router).events
      .pipe(
        filter((e) => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError),
        take(1),
      )
      .subscribe(() => this.primeraCarga.set(false));
  }
}
