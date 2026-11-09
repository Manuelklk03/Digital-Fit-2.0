import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ButtonComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { ListadoPaginado } from './estado';
import { PaginadorComponent } from './paginador';

/**
 * Estados de un listado paginado: esqueleto al cargar, error con reintento, vacío (con slot `[vacio]`)
 * y, con datos, el contenido proyectado seguido del paginador.
 */
@Component({
  selector: 'app-estado-listado',
  imports: [ButtonComponent, PaginadorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pagina.css',
  host: { style: 'display: contents' },
  template: `
    @let t = i18n.t().entrenamientos;
    @let l = listado();
    @switch (l.estado()) {
      @case ('cargando') {
        <div [class]="fila() ? 'lista' : 'rejilla'" role="status">
          <span class="sr-only">{{ t.cargandoListado }}</span>
          @for (i of esqueletos(); track i) {
            <div class="esqueleto" [class.esqueleto-fila]="fila()" aria-hidden="true"></div>
          }
        </div>
      }
      @case ('error') {
        <div class="estado estado-error" role="alert">
          <p>{{ t.errorCarga }}</p>
          <button df-button variant="outline" size="sm" type="button" (click)="l.recargar()">{{ t.reintentar }}</button>
        </div>
      }
      @default {
        @if (l.items().length === 0) {
          <div class="estado">
            <p>{{ vacio() }}</p>
            <ng-content select="[vacio]" />
          </div>
        } @else {
          <ng-content />
          <app-paginador [pagina]="l.pagina()!.page" [totalPaginas]="l.pagina()!.totalPages" (cambiar)="l.cargar($event)" />
        }
      }
    }
  `,
})
export class EstadoListadoComponent {
  readonly i18n = inject(I18nService);
  readonly listado = input.required<ListadoPaginado<unknown>>();
  readonly vacio = input.required<string>();
  /** Filas (historial) en lugar de rejilla de tarjetas. */
  readonly fila = input(false);
  readonly esqueletos = input([1, 2, 3, 4, 5, 6]);
}
