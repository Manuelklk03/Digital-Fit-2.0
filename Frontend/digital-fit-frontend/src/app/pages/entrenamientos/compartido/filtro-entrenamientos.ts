import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, InputDirective } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import {
  CampoFiltro,
  CATEGORIAS,
  FiltroEntrenamiento,
  NIVELES,
} from '../../../models/entrenamiento';

/** Barra de filtro con un único campo activo, igual que el backend (categoría, nivel, duración o nombre). */
@Component({
  selector: 'app-filtro-entrenamientos',
  imports: [FormsModule, ButtonComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().entrenamientos;
    <form class="filtro" role="search" (ngSubmit)="aplicar()">
      <div class="campo">
        <label for="filtro-campo">{{ t.filtrarPor }}</label>
        <select
          df-input
          size="sm"
          id="filtro-campo"
          name="campo"
          [ngModel]="campo()"
          (ngModelChange)="cambiarCampo($event)"
        >
          <option value="nombre">{{ t.campoNombre }}</option>
          <option value="categoria">{{ t.campoCategoria }}</option>
          <option value="nivel">{{ t.campoNivel }}</option>
          <option value="duracionEnMinutos">{{ t.filtroDuracionMax }}</option>
        </select>
      </div>

      <div class="campo campo-valor">
        <label for="filtro-valor">{{ t.valorFiltro }}</label>
        @switch (campo()) {
          @case ('categoria') {
            <select df-input size="sm" id="filtro-valor" name="valor" [(ngModel)]="valor">
              <option value="">{{ t.seleccionar }}</option>
              @for (c of categorias; track c) {
                <option [value]="c">{{ t.categorias[c] }}</option>
              }
            </select>
          }
          @case ('nivel') {
            <select df-input size="sm" id="filtro-valor" name="valor" [(ngModel)]="valor">
              <option value="">{{ t.seleccionar }}</option>
              @for (n of niveles; track n) {
                <option [value]="n">{{ t.niveles[n] }}</option>
              }
            </select>
          }
          @case ('duracionEnMinutos') {
            <input
              df-input
              size="sm"
              id="filtro-valor"
              name="valor"
              type="number"
              min="1"
              inputmode="numeric"
              [(ngModel)]="valor"
              [placeholder]="t.minutos"
            />
          }
          @default {
            <input
              df-input
              size="sm"
              id="filtro-valor"
              name="valor"
              type="search"
              [(ngModel)]="valor"
              [placeholder]="t.nombrePlaceholder"
            />
          }
        }
      </div>

      <div class="acciones">
        <button df-button variant="primary" size="sm" type="submit">{{ t.botonBuscar }}</button>
        <button df-button variant="ghost" size="sm" type="button" (click)="limpiar()">
          {{ t.botonLimpiar }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .filtro {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 12px;
      }
      .campo {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 160px;
      }
      .campo-valor {
        flex: 1 1 200px;
      }
      label {
        font-size: 12px;
        font-weight: 600;
        color: var(--df-text-muted);
      }
      .acciones {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class FiltroEntrenamientosComponent {
  readonly i18n = inject(I18nService);
  readonly filtrar = output<FiltroEntrenamiento | null>();

  readonly categorias = CATEGORIAS;
  readonly niveles = NIVELES;
  readonly campo = signal<CampoFiltro>('nombre');
  valor = '';

  cambiarCampo(campo: CampoFiltro): void {
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
