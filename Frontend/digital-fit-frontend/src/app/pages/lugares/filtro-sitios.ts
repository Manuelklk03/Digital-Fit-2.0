import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputDirective } from '../../components/ui';
import { I18nService } from '../../i18n/i18n.service';
import { CampoFiltroSitio, ClaseSitio, FiltroSitio, TIPOS_LUGAR } from '../../models/lugar';

/** Filtro con un único campo activo, como el backend: nombre, dirección y precio máximo (centros) o tipo (lugares). */
@Component({
  selector: 'app-filtro-sitios',
  imports: [FormsModule, ButtonComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().lugares;
    @let te = i18n.t().entrenamientos;
    <form class="filtro" role="search" (ngSubmit)="aplicar()">
      <div class="campo">
        <label for="filtro-campo">{{ te.filtrarPor }}</label>
        <select df-input size="sm" id="filtro-campo" name="campo" [ngModel]="campo()" (ngModelChange)="cambiarCampo($event)">
          <option value="nombre">{{ t.campoNombre }}</option>
          <option value="direccion">{{ t.campoDireccion }}</option>
          @if (clase() === 'centro') {
            <option value="precioMensual">{{ t.filtroPrecioMax }}</option>
          } @else {
            <option value="tipo">{{ t.campoTipo }}</option>
          }
        </select>
      </div>

      <div class="campo campo-valor">
        <label for="filtro-valor">{{ te.valorFiltro }}</label>
        @switch (campo()) {
          @case ('tipo') {
            <select df-input size="sm" id="filtro-valor" name="valor" [(ngModel)]="valor">
              <option value="">{{ te.seleccionar }}</option>
              @for (tipo of tipos; track tipo) {
                <option [value]="tipo">{{ t.tipos[tipo] }}</option>
              }
            </select>
          }
          @case ('precioMensual') {
            <input df-input size="sm" id="filtro-valor" name="valor" type="number" min="0" step="any" inputmode="decimal"
              [(ngModel)]="valor" [placeholder]="t.precioPlaceholder" />
          }
          @default {
            <input df-input size="sm" id="filtro-valor" name="valor" type="search" [(ngModel)]="valor"
              [placeholder]="campo() === 'direccion' ? t.direccionPlaceholder : t.nombrePlaceholder" />
          }
        }
      </div>

      <div class="acciones">
        <button df-button variant="primary" size="sm" type="submit">{{ te.botonBuscar }}</button>
        <button df-button variant="ghost" size="sm" type="button" (click)="limpiar()">{{ te.botonLimpiar }}</button>
      </div>
    </form>
  `,
  styles: [`
    .filtro { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; }
    .campo { display: flex; flex-direction: column; gap: 6px; min-width: 160px; }
    .campo-valor { flex: 1 1 200px; }
    label { font-size: 12px; font-weight: 600; color: var(--df-text-muted); }
    .acciones { display: flex; gap: 8px; }
  `],
})
export class FiltroSitiosComponent {
  readonly i18n = inject(I18nService);
  readonly clase = input.required<ClaseSitio>();
  readonly filtrar = output<FiltroSitio | null>();

  readonly tipos = TIPOS_LUGAR;
  readonly campo = signal<CampoFiltroSitio>('nombre');
  valor = '';

  cambiarCampo(campo: CampoFiltroSitio): void {
    this.campo.set(campo);
    this.valor = '';
  }

  aplicar(): void {
    const valor = String(this.valor ?? '').trim();
    this.filtrar.emit(valor ? { campo: this.campo(), valor } : null);
  }

  limpiar(): void {
    this.cambiarCampo('nombre');
    this.filtrar.emit(null);
  }
}
