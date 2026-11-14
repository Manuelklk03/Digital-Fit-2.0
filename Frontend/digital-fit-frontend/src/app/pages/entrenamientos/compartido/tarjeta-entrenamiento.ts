import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent, BadgeVariant } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { Entrenamiento, Nivel } from '../../../models/entrenamiento';

export const VARIANTE_NIVEL: Record<Nivel, BadgeVariant> = {
  PRINCIPIANTE: 'accent',
  INTERMEDIO: 'neutral',
  AVANZADO: 'warning',
  EXPERTO: 'danger',
};

/** Tarjeta de un entrenamiento: chips, título enlazado al detalle, metadatos y acciones proyectadas. */
@Component({
  selector: 'app-tarjeta-entrenamiento',
  imports: [RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().entrenamientos;
    @let e = entrenamiento();
    <article class="tarjeta">
      <div class="chips">
        <span df-badge badgeStyle="outline">{{ t.categorias[e.categoria] }}</span>
        <span df-badge [variant]="varianteNivel[e.nivel]">{{ t.niveles[e.nivel] }}</span>
        <ng-content select="[chip]" />
        <span class="duracion">{{ e.duracionEnMinutos }} {{ t.minutos }}</span>
      </div>
      <h3>
        <a [routerLink]="ruta()">{{ e.nombre }}</a>
      </h3>
      <p class="descripcion">{{ e.descripcion || t.sinDescripcion }}</p>
      <ng-content select="[meta]" />
      <div class="acciones"><ng-content /></div>
    </article>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .tarjeta {
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
        background: var(--df-surface);
        border: 1px solid var(--df-border);
        border-radius: 16px;
        transition: border-color var(--df-transition-fast);
      }
      .tarjeta:hover,
      .tarjeta:focus-within {
        border-color: var(--df-text-subtle);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .duracion {
        margin-left: auto;
        font-family: var(--df-font-mono);
        font-variant-numeric: tabular-nums;
        font-size: 13px;
        font-weight: 600;
        color: var(--df-text-muted);
      }
      h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -0.01em;
        line-height: 1.3;
      }
      h3 a {
        color: var(--df-text);
        text-decoration: none;
        border-radius: 4px;
      }
      h3 a:hover {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      h3 a:focus-visible {
        outline: 2px solid var(--df-border-focus);
        outline-offset: 2px;
      }
      .descripcion {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--df-text-muted);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .acciones {
        margin-top: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding-top: 4px;
      }
    `,
  ],
})
export class TarjetaEntrenamientoComponent {
  readonly i18n = inject(I18nService);
  readonly entrenamiento = input.required<Entrenamiento>();
  readonly ruta = input.required<(string | number)[]>();
  readonly varianteNivel = VARIANTE_NIVEL;
}
