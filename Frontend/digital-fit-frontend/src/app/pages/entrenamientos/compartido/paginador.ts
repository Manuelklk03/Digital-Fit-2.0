import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ButtonComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';

/** Controles Anterior / Siguiente. `pagina` empieza en 0, como en el backend. */
@Component({
  selector: 'app-paginador',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().entrenamientos;
    @if (totalPaginas() > 1) {
      <nav class="paginador" [attr.aria-label]="t.paginacion">
        <button
          df-button
          variant="outline"
          size="sm"
          type="button"
          [disabled]="pagina() === 0"
          (click)="cambiar.emit(pagina() - 1)"
        >
          {{ t.paginaAnterior }}
        </button>
        <span class="posicion" aria-live="polite">
          {{ t.pagina }} <strong>{{ pagina() + 1 }}</strong> {{ t.de }} {{ totalPaginas() }}
        </span>
        <button
          df-button
          variant="outline"
          size="sm"
          type="button"
          [disabled]="pagina() + 1 >= totalPaginas()"
          (click)="cambiar.emit(pagina() + 1)"
        >
          {{ t.paginaSiguiente }}
        </button>
      </nav>
    }
  `,
  styles: [
    `
      .paginador {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 24px;
      }
      .posicion {
        font-size: 13px;
        color: var(--df-text-muted);
        font-variant-numeric: tabular-nums;
      }
      .posicion strong {
        color: var(--df-text);
      }
    `,
  ],
})
export class PaginadorComponent {
  readonly i18n = inject(I18nService);
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly cambiar = output<number>();
}
