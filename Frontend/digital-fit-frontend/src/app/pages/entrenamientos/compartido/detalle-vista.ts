import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent, ButtonComponent, CardComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { Entrenamiento } from '../../../models/entrenamiento';
import { EstadoCarga } from './estado';
import { VARIANTE_NIVEL } from './tarjeta-entrenamiento';

/**
 * Vista común del detalle de un entrenamiento (base, propio o de comunidad): volver, estados de carga
 * y error y ficha. Slots: `app-alert`, `[chip]`, `[dato]` y las acciones (contenido por defecto).
 */
@Component({
  selector: 'app-detalle-vista',
  imports: [RouterLink, BadgeComponent, ButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pagina.css',
  template: `
    @let t = i18n.t().entrenamientos;
    <a df-button variant="ghost" size="sm" class="volver" [routerLink]="volver()"><span aria-hidden="true">←</span> {{ t.volverListado }}</a>
    <ng-content select="app-alert" />

    @switch (estado()) {
      @case ('cargando') {
        <div role="status">
          <span class="sr-only">{{ i18n.t().comun.cargando }}</span>
          <div class="esqueleto" aria-hidden="true"></div>
        </div>
      }
      @case ('error') {
        <div class="estado estado-error" role="alert">
          <p>{{ t.errorDetalle }}</p>
          <button df-button variant="outline" size="sm" type="button" (click)="reintentar.emit()">{{ t.reintentar }}</button>
        </div>
      }
      @default {
        @if (entrenamiento(); as e) {
          <app-card>
            <article class="detalle">
              <div class="chips">
                <span df-badge variant="primary" [dot]="true">{{ badge() }}</span>
                <span df-badge badgeStyle="outline">{{ t.categorias[e.categoria] }}</span>
                <span df-badge [variant]="varianteNivel[e.nivel]">{{ t.niveles[e.nivel] }}</span>
                <ng-content select="[chip]" />
              </div>
              <h1 class="cabecera-detalle">{{ e.nombre }}</h1>
              <dl class="datos">
                <div class="dato"><dt>{{ t.campoDuracion }}</dt><dd class="num">{{ e.duracionEnMinutos }} {{ t.minutos }}</dd></div>
                <ng-content select="[dato]" />
              </dl>
              <section>
                <h2 class="subtitulo">{{ t.campoDescripcion }}</h2>
                <p class="texto-largo">{{ e.descripcion || t.sinDescripcion }}</p>
              </section>
              <div class="acciones"><ng-content /></div>
            </article>
          </app-card>
        }
      }
    }
  `,
  host: { style: 'display: contents' },
})
export class DetalleVistaComponent {
  readonly i18n = inject(I18nService);
  readonly estado = input.required<EstadoCarga>();
  readonly entrenamiento = input.required<Entrenamiento | null>();
  readonly badge = input.required<string>();
  readonly volver = input.required<string>();
  readonly reintentar = output<void>();
  readonly varianteNivel = VARIANTE_NIVEL;
}
