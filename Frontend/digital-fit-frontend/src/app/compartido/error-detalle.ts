import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ButtonComponent } from '../components/ui';
import { I18nService } from '../i18n/i18n.service';
import { MotivoError } from './estado';

/**
 * Error al cargar un detalle. Distingue «no existe» (404) y «no tienes permiso» (403) de un fallo
 * de conexión o del servidor; solo en este último ofrece reintentar, porque en los otros no cambiaría nada.
 */
@Component({
  selector: 'app-error-detalle',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pagina.css',
  host: { style: 'display: contents' },
  template: `
    @let c = i18n.t().comun;
    <div class="estado estado-error" role="alert">
      @switch (motivo()) {
        @case ('no-encontrado') {
          <p>{{ c.errorNoEncontrado }}</p>
        }
        @case ('sin-permiso') {
          <p>{{ c.errorSinPermiso }}</p>
        }
        @default {
          <p>{{ c.errorConexion }}</p>
          <button df-button variant="outline" size="sm" type="button" (click)="reintentar.emit()">
            {{ i18n.t().entrenamientos.reintentar }}
          </button>
        }
      }
    </div>
  `,
})
export class ErrorDetalleComponent {
  readonly i18n = inject(I18nService);
  readonly motivo = input.required<MotivoError>();
  readonly reintentar = output<void>();
}
