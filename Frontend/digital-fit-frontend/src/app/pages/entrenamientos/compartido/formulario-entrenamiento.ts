import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, CardComponent, InputDirective } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { CATEGORIAS, EntrenamientoForm, NIVELES } from '../../../models/entrenamiento';
import { enfocarTrasRender } from './estado';

const VACIO: EntrenamientoForm = {
  nombre: '',
  descripcion: '',
  categoria: 'FUERZA_TOTAL',
  nivel: 'PRINCIPIANTE',
  duracionEnMinutos: 30,
};

type Campo = 'nombre' | 'descripcion' | 'duracionEnMinutos';

/** Formulario de creación y edición. La descripción se limita a 1000: es lo que admite la columna en BD (el DTO admite 1500). */
@Component({
  selector: 'app-formulario-entrenamiento',
  imports: [FormsModule, ButtonComponent, CardComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().entrenamientos;
    <app-card>
      <form class="formulario" (ngSubmit)="enviar()" novalidate [attr.aria-labelledby]="idPrefijo() + '-titulo'">
        <h2 class="titulo" [id]="idPrefijo() + '-titulo'">{{ titulo() }}</h2>

        <div class="rejilla">
          <div class="campo campo-ancho">
            <label [for]="idPrefijo() + '-nombre'">{{ t.campoNombre }}</label>
            <input df-input [id]="idPrefijo() + '-nombre'" name="nombre" maxlength="100" required
              [(ngModel)]="modelo.nombre" [error]="errores().includes('nombre')"
              [attr.aria-invalid]="errores().includes('nombre')"
              [attr.aria-describedby]="errores().includes('nombre') ? idPrefijo() + '-e-nombre' : null" />
            @if (errores().includes('nombre')) {
              <p class="error" [id]="idPrefijo() + '-e-nombre'">{{ t.errorNombre }}</p>
            }
          </div>

          <div class="campo">
            <label [for]="idPrefijo() + '-categoria'">{{ t.campoCategoria }}</label>
            <select df-input [id]="idPrefijo() + '-categoria'" name="categoria" [(ngModel)]="modelo.categoria">
              @for (c of categorias; track c) {
                <option [value]="c">{{ t.categorias[c] }}</option>
              }
            </select>
          </div>

          <div class="campo">
            <label [for]="idPrefijo() + '-nivel'">{{ t.campoNivel }}</label>
            <select df-input [id]="idPrefijo() + '-nivel'" name="nivel" [(ngModel)]="modelo.nivel">
              @for (n of niveles; track n) {
                <option [value]="n">{{ t.niveles[n] }}</option>
              }
            </select>
          </div>

          <div class="campo">
            <label [for]="idPrefijo() + '-duracion'">{{ t.campoDuracion }}</label>
            <input df-input [id]="idPrefijo() + '-duracion'" name="duracion" type="number" min="1" inputmode="numeric" required
              [(ngModel)]="modelo.duracionEnMinutos" [error]="errores().includes('duracionEnMinutos')"
              [attr.aria-invalid]="errores().includes('duracionEnMinutos')"
              [attr.aria-describedby]="errores().includes('duracionEnMinutos') ? idPrefijo() + '-e-duracion' : null" />
            @if (errores().includes('duracionEnMinutos')) {
              <p class="error" [id]="idPrefijo() + '-e-duracion'">{{ t.errorDuracion }}</p>
            }
          </div>

          <div class="campo campo-completo">
            <label [for]="idPrefijo() + '-descripcion'">{{ t.campoDescripcion }}</label>
            <textarea df-input [id]="idPrefijo() + '-descripcion'" name="descripcion" rows="4" maxlength="1000" required
              [(ngModel)]="modelo.descripcion" [error]="errores().includes('descripcion')"
              [attr.aria-invalid]="errores().includes('descripcion')"
              [attr.aria-describedby]="errores().includes('descripcion') ? idPrefijo() + '-e-descripcion' : null"></textarea>
            @if (errores().includes('descripcion')) {
              <p class="error" [id]="idPrefijo() + '-e-descripcion'">{{ t.errorDescripcion }}</p>
            }
          </div>
        </div>

        <div class="acciones">
          <button df-button variant="primary" type="submit" [loading]="guardando()" [disabled]="guardando()">
            {{ guardando() ? t.guardando : textoEnviar() }}
          </button>
          <button df-button variant="ghost" type="button" [disabled]="guardando()" (click)="cancelar.emit()">
            {{ inicial() ? t.cancelarEdicion : t.cerrarFormulario }}
          </button>
        </div>
      </form>
    </app-card>
  `,
  styles: [`
    .formulario { display: flex; flex-direction: column; gap: 20px; }
    .titulo { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
    .rejilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .campo { display: flex; flex-direction: column; gap: 6px; }
    .campo-ancho { grid-column: span 2; }
    .campo-completo { grid-column: 1 / -1; }
    @media (max-width: 480px) { .campo-ancho { grid-column: 1 / -1; } }
    label { font-size: 13px; font-weight: 600; color: var(--df-text-muted); }
    .error { margin: 0; font-size: 12px; color: var(--df-danger); }
    .acciones { display: flex; flex-wrap: wrap; gap: 8px; }
  `],
})
export class FormularioEntrenamientoComponent {
  readonly i18n = inject(I18nService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  readonly titulo = input.required<string>();
  readonly textoEnviar = input.required<string>();
  readonly idPrefijo = input('form-entrenamiento');
  /** Datos a editar; `null` para crear. */
  readonly inicial = input<EntrenamientoForm | null>(null);
  readonly guardando = input(false);
  readonly guardar = output<EntrenamientoForm>();
  readonly cancelar = output<void>();

  readonly categorias = CATEGORIAS;
  readonly niveles = NIVELES;
  readonly errores = signal<Campo[]>([]);
  modelo: EntrenamientoForm = { ...VACIO };

  constructor() {
    effect(() => {
      const inicial = this.inicial();
      this.modelo = inicial ? { ...inicial } : { ...VACIO };
      this.errores.set([]);
    });
    // Al abrirse (crear o editar), lleva la vista y el foco al formulario.
    afterNextRender(() => {
      this.host.nativeElement.scrollIntoView({ block: 'start', behavior: 'auto' });
      this.host.nativeElement.querySelector<HTMLElement>('input')?.focus();
    });
  }

  enviar(): void {
    const datos: EntrenamientoForm = {
      ...this.modelo,
      nombre: this.modelo.nombre.trim(),
      descripcion: this.modelo.descripcion.trim(),
      duracionEnMinutos: Number(this.modelo.duracionEnMinutos),
    };
    const errores: Campo[] = [];
    if (!datos.nombre || datos.nombre.length > 100) errores.push('nombre');
    if (!datos.descripcion || datos.descripcion.length > 1000) errores.push('descripcion');
    if (!Number.isInteger(datos.duracionEnMinutos) || datos.duracionEnMinutos < 1) errores.push('duracionEnMinutos');
    this.errores.set(errores);
    if (errores.length === 0) {
      this.guardar.emit(datos);
    } else {
      enfocarTrasRender(this.injector, '[aria-invalid="true"]', () => this.host.nativeElement);
    }
  }
}
