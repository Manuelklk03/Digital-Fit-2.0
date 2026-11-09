import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from '../../components/ui';
import { I18nService } from '../../i18n/i18n.service';
import { esLugarPublico, Sitio } from '../../models/lugar';

/** Tarjeta de un centro (precio) o lugar (tipo): título enlazado, dirección, horario y acciones proyectadas. */
@Component({
  selector: 'app-tarjeta-sitio',
  imports: [RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().lugares;
    @let s = sitio();
    <article class="tarjeta">
      <div class="chips">
        @if (esLugar(s)) {
          <span df-badge badgeStyle="outline">{{ t.tipos[s.tipo] }}</span>
        } @else {
          <span class="precio">
            @if (s.precioMensual != null) {
              <strong>{{ s.precioMensual }}</strong> {{ t.porMes }}
            } @else {
              {{ t.sinPrecio }}
            }
          </span>
        }
      </div>
      <h3><a [routerLink]="ruta()">{{ s.nombre }}</a></h3>
      <p class="direccion">{{ s.direccion }}</p>
      @if (s.horario) {
        <p class="horario"><span class="sr-only">{{ t.campoHorario }}: </span>{{ s.horario }}</p>
      }
      <div class="acciones"><ng-content /></div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .tarjeta {
      height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px;
      padding: 20px; background: var(--df-surface); border: 1px solid var(--df-border); border-radius: 16px;
      transition: border-color var(--df-transition-fast);
    }
    .tarjeta:hover, .tarjeta:focus-within { border-color: var(--df-text-subtle); }
    .chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-height: 22px; }
    .precio { font-family: var(--df-font-mono); font-variant-numeric: tabular-nums; font-size: 13px; color: var(--df-text-muted); }
    .precio strong { font-size: 16px; color: var(--df-text); }
    h3 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.3; }
    h3 a { color: var(--df-text); text-decoration: none; border-radius: 4px; }
    h3 a:hover { text-decoration: underline; text-underline-offset: 3px; }
    h3 a:focus-visible { outline: 2px solid var(--df-border-focus); outline-offset: 2px; }
    p { margin: 0; font-size: 14px; line-height: 1.5; color: var(--df-text-muted); overflow-wrap: anywhere; }
    .horario { font-size: 13px; }
    .acciones { margin-top: auto; display: flex; flex-wrap: wrap; gap: 8px; padding-top: 4px; }
  `],
})
export class TarjetaSitioComponent {
  readonly i18n = inject(I18nService);
  readonly sitio = input.required<Sitio>();
  readonly ruta = input.required<(string | number)[]>();
  readonly esLugar = esLugarPublico;
}
