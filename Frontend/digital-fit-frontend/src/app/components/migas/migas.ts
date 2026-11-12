import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { MigasService } from '../../services/migas';

/** Migas de pan de la página actual. No pinta nada si la ruta no declara `data.migas`. */
@Component({
  selector: 'app-migas',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (migas.migas().length > 0) {
      <nav class="migas" [attr.aria-label]="i18n.t().migas.etiqueta">
        <ol>
          @for (miga of migas.migas(); track miga.texto) {
            <li>
              @if (miga.ruta) {
                <a [routerLink]="miga.ruta">{{ miga.texto }}</a>
              } @else {
                <span aria-current="page">{{ miga.texto }}</span>
              }
            </li>
          }
        </ol>
      </nav>
    }
  `,
  styles: [`
    ol { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: 13px; color: var(--df-text-muted); }
    li { display: inline-flex; align-items: center; gap: 8px; }
    /* El separador es decorativo: el texto alternativo vacío lo deja fuera del lector de pantalla. */
    li + li::before { content: '/' / ''; color: var(--df-text-subtle); }
    a { color: var(--df-text-muted); text-decoration: none; border-radius: var(--df-radius-sm); }
    a:hover { color: var(--df-text); text-decoration: underline; text-underline-offset: 3px; }
    a:focus-visible { outline: 2px solid var(--df-border-focus); outline-offset: 2px; }
    [aria-current='page'] { color: var(--df-text); font-weight: 600; }
  `],
})
export class MigasComponent {
  protected readonly migas = inject(MigasService);
  protected readonly i18n = inject(I18nService);
}
