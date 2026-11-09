import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { ButtonComponent, CardComponent, InputDirective } from '../../components/ui';
import { MapaSelectorComponent } from '../../components/mapa-selector/mapa-selector';
import { I18nService } from '../../i18n/i18n.service';
import {
  Autocompletado,
  ClaseSitio,
  coordenadasLegibles,
  Coordenadas,
  esLugarPublico,
  Sitio,
  SitioForm,
  TipoLugar,
  TIPOS_LUGAR,
} from '../../models/lugar';
import { enfocarTrasRender } from '../entrenamientos/compartido/estado';

type Campo = 'nombre' | 'direccion' | 'precioMensual' | 'descripcion' | 'ubicacion';
type EstadoAutocompletado = 'inactivo' | 'buscando' | 'ok' | 'sinDatos' | 'error';

/** Espera tras marcar en el mapa antes de autocompletar, por si el usuario sigue moviendo el marcador. */
const ESPERA_AUTOCOMPLETAR_MS = 800;

interface Modelo {
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  descripcion: string;
  precioMensual: number | null;
  tipo: TipoLugar;
}

type CampoAutocompletable = 'direccion' | 'telefono' | 'horario' | 'descripcion' | 'precioMensual';

const VACIO: Modelo = {
  nombre: '',
  direccion: '',
  telefono: '',
  horario: '',
  descripcion: '',
  precioMensual: null,
  tipo: 'PARQUE_PUBLICO',
};

/**
 * Formulario de centro o lugar con selector de mapa. Valida como el backend (nombre, dirección y ubicación
 * obligatorios, precio ≥ 0, descripción ≤ 1500) y, si recibe `autocompletar`, rellena los datos al marcar.
 */
@Component({
  selector: 'app-formulario-sitio',
  imports: [FormsModule, ButtonComponent, CardComponent, InputDirective, MapaSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().lugares;
    @let te = i18n.t().entrenamientos;
    <app-card>
      <form class="formulario" (ngSubmit)="enviar()" novalidate aria-labelledby="form-sitio-titulo">
        <h2 class="titulo" id="form-sitio-titulo">{{ titulo() }}</h2>

        <section class="ubicacion-sitio" aria-labelledby="form-sitio-ubicacion">
          <div class="cabecera-mapa">
            <h3 id="form-sitio-ubicacion">{{ t.campoUbicacion }}</h3>
            <span class="coordenadas num">{{ coordenadas() ?? t.sinUbicacion }}</span>
          </div>
          <p class="ayuda" aria-live="polite">{{ textoAyuda() }}</p>
          <app-mapa-selector [latitud]="ubicacion()?.latitud ?? null" [longitud]="ubicacion()?.longitud ?? null"
            (ubicacionSeleccionada)="marcar($event)" />
          @if (errores().includes('ubicacion')) {
            <p class="error" role="alert">{{ t.errorUbicacion }}</p>
          }
        </section>

        <div class="rejilla">
          <div class="campo">
            <label for="sitio-nombre">{{ t.campoNombre }}</label>
            <input df-input id="sitio-nombre" name="nombre" required autocomplete="off" [(ngModel)]="modelo.nombre"
              [error]="errores().includes('nombre')" [attr.aria-invalid]="errores().includes('nombre')"
              [attr.aria-describedby]="errores().includes('nombre') ? 'sitio-e-nombre' : null" />
            @if (errores().includes('nombre')) {
              <p class="error" id="sitio-e-nombre">{{ t.errorNombre }}</p>
            }
          </div>

          <div class="campo">
            <label for="sitio-direccion">{{ t.campoDireccion }}</label>
            <input df-input id="sitio-direccion" name="direccion" required autocomplete="off"
              [(ngModel)]="modelo.direccion" [error]="errores().includes('direccion')"
              [attr.aria-invalid]="errores().includes('direccion')"
              [attr.aria-describedby]="errores().includes('direccion') ? 'sitio-e-direccion' : null" />
            @if (errores().includes('direccion')) {
              <p class="error" id="sitio-e-direccion">{{ t.errorDireccion }}</p>
            }
          </div>

          @if (clase() === 'centro') {
            <div class="campo">
              <label for="sitio-precio">{{ t.campoPrecio }}</label>
              <input df-input id="sitio-precio" name="precioMensual" type="number" min="0" step="any" inputmode="decimal"
                [(ngModel)]="modelo.precioMensual" [placeholder]="t.precioPlaceholder"
                [error]="errores().includes('precioMensual')" [attr.aria-invalid]="errores().includes('precioMensual')"
                [attr.aria-describedby]="errores().includes('precioMensual') ? 'sitio-e-precio' : null" />
              @if (errores().includes('precioMensual')) {
                <p class="error" id="sitio-e-precio">{{ t.errorPrecio }}</p>
              }
            </div>
          } @else {
            <div class="campo">
              <label for="sitio-tipo">{{ t.campoTipo }}</label>
              <select df-input id="sitio-tipo" name="tipo" [(ngModel)]="modelo.tipo">
                @for (tipo of tipos; track tipo) {
                  <option [value]="tipo">{{ t.tipos[tipo] }}</option>
                }
              </select>
            </div>
          }

          <div class="campo">
            <label for="sitio-telefono">{{ t.campoTelefono }}</label>
            <input df-input id="sitio-telefono" name="telefono" type="tel" autocomplete="off" [(ngModel)]="modelo.telefono" />
          </div>

          <div class="campo">
            <label for="sitio-horario">{{ t.campoHorario }}</label>
            <input df-input id="sitio-horario" name="horario" autocomplete="off" [(ngModel)]="modelo.horario" />
          </div>

          <div class="campo campo-completo">
            <label for="sitio-descripcion">{{ t.campoDescripcion }}</label>
            <textarea df-input id="sitio-descripcion" name="descripcion" rows="3" maxlength="1500"
              [(ngModel)]="modelo.descripcion" [error]="errores().includes('descripcion')"
              [attr.aria-invalid]="errores().includes('descripcion')"
              [attr.aria-describedby]="errores().includes('descripcion') ? 'sitio-e-descripcion' : null"></textarea>
            @if (errores().includes('descripcion')) {
              <p class="error" id="sitio-e-descripcion">{{ t.errorDescripcion }}</p>
            }
          </div>
        </div>

        <div class="acciones">
          <button df-button variant="primary" type="submit" [loading]="guardando()" [disabled]="guardando()">
            {{ guardando() ? te.guardando : textoEnviar() }}
          </button>
          <button df-button variant="ghost" type="button" [disabled]="guardando()" (click)="cancelar.emit()">
            {{ inicial() ? te.cancelarEdicion : te.cerrarFormulario }}
          </button>
        </div>
      </form>
    </app-card>
  `,
  styles: [`
    .formulario { display: flex; flex-direction: column; gap: 20px; }
    .titulo { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; }
    .ubicacion-sitio { display: flex; flex-direction: column; gap: 8px; }
    .cabecera-mapa { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 8px; }
    .cabecera-mapa h3 { margin: 0; font-size: 13px; font-weight: 600; color: var(--df-text-muted); }
    .coordenadas { font-size: 13px; color: var(--df-text-muted); }
    .num { font-family: var(--df-font-mono); font-variant-numeric: tabular-nums; }
    .ayuda { margin: 0; font-size: 13px; color: var(--df-text-muted); }
    .rejilla { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .campo { display: flex; flex-direction: column; gap: 6px; }
    .campo-completo { grid-column: 1 / -1; }
    label { font-size: 13px; font-weight: 600; color: var(--df-text-muted); }
    .error { margin: 0; font-size: 12px; color: var(--df-danger); }
    .acciones { display: flex; flex-wrap: wrap; gap: 8px; }
  `],
})
export class FormularioSitioComponent {
  readonly i18n = inject(I18nService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly clase = input.required<ClaseSitio>();
  readonly titulo = input.required<string>();
  readonly textoEnviar = input.required<string>();
  /** Sitio a editar; `null` para crear. */
  readonly inicial = input<Sitio | null>(null);
  readonly guardando = input(false);
  readonly autocompletar = input<((latitud: number, longitud: number) => Observable<Autocompletado>) | null>(null);
  readonly guardar = output<SitioForm>();
  readonly cancelar = output<void>();

  readonly tipos = TIPOS_LUGAR;
  readonly errores = signal<Campo[]>([]);
  readonly ubicacion = signal<Coordenadas | null>(null);
  readonly estadoAutocompletado = signal<EstadoAutocompletado>('inactivo');
  modelo: Modelo = { ...VACIO };

  private readonly marcas = new Subject<Coordenadas>();
  /** Últimos valores puestos por el autocompletado: se pueden sustituir; lo escrito a mano, no. */
  private autocompletados: Partial<Record<CampoAutocompletable, string | number>> = {};
  /** Tipo elegido al marcar: si el usuario lo cambia mientras llega la respuesta, se respeta. */
  private tipoAlMarcar: TipoLugar = VACIO.tipo;
  private consulta?: Subscription;

  constructor() {
    effect(() => {
      const s = this.inicial();
      this.modelo = s
        ? {
            nombre: s.nombre,
            direccion: s.direccion,
            telefono: s.telefono ?? '',
            horario: s.horario ?? '',
            descripcion: s.descripcion ?? '',
            precioMensual: esLugarPublico(s) ? null : s.precioMensual,
            tipo: esLugarPublico(s) ? s.tipo : VACIO.tipo,
          }
        : { ...VACIO };
      this.ubicacion.set(s?.latitud != null && s.longitud != null ? { latitud: s.latitud, longitud: s.longitud } : null);
      this.errores.set([]);
    });

    const sub = this.marcas.pipe(debounceTime(ESPERA_AUTOCOMPLETAR_MS)).subscribe((c) => this.consultar(c));
    inject(DestroyRef).onDestroy(() => {
      sub.unsubscribe();
      this.consulta?.unsubscribe();
    });

    // Al abrirse (crear o editar), lleva la vista y el foco al formulario.
    afterNextRender(() => {
      this.host.nativeElement.scrollIntoView({ block: 'start', behavior: 'auto' });
      this.host.nativeElement.querySelector<HTMLElement>('#sitio-nombre')?.focus();
    });
  }

  coordenadas(): string | null {
    const u = this.ubicacion();
    return u ? coordenadasLegibles(u.latitud, u.longitud) : null;
  }

  textoAyuda(): string {
    const t = this.i18n.t().lugares;
    switch (this.estadoAutocompletado()) {
      case 'buscando':
        return t.autocompletando;
      case 'ok':
        return t.autocompletadoOk;
      case 'sinDatos':
        return t.autocompletadoSinDatos;
      case 'error':
        return t.autocompletadoError;
      default:
        return t.ayudaUbicacion;
    }
  }

  marcar(c: Coordenadas): void {
    this.ubicacion.set(c);
    this.errores.update((e) => e.filter((campo) => campo !== 'ubicacion'));
    if (this.autocompletar()) {
      this.consulta?.unsubscribe();
      this.estadoAutocompletado.set('buscando');
      this.tipoAlMarcar = this.modelo.tipo;
      this.marcas.next(c);
    }
  }

  private consultar(c: Coordenadas): void {
    const autocompletar = this.autocompletar();
    if (!autocompletar) {
      return;
    }
    this.consulta = autocompletar(c.latitud, c.longitud).subscribe({
      next: (datos) => {
        this.aplicarAutocompletado(datos);
        this.estadoAutocompletado.set(datos.datosEncontrados ? 'ok' : 'sinDatos');
      },
      error: () => this.estadoAutocompletado.set('error'),
    });
  }

  /**
   * Rellena los campos vacíos o los que puso un autocompletado anterior (al mover el marcador), sin pisar
   * lo que escribió el usuario, ni siquiera durante la espera. El backend manda "" en lo que no encuentra.
   * El nombre siempre lo escribe el usuario.
   */
  private aplicarAutocompletado(d: Autocompletado): void {
    const m: Modelo = { ...this.modelo };
    const nuevos: Partial<Record<CampoAutocompletable, string | number>> = {};
    const rellenar = <K extends CampoAutocompletable>(campo: K, valor: Modelo[K] | null | undefined) => {
      const vacio = valor == null || (typeof valor === 'string' && valor.trim() === '');
      const actual = m[campo];
      const libre = actual === null || actual === '' || actual === this.autocompletados[campo];
      if (!vacio && libre) {
        m[campo] = valor as Modelo[K];
        nuevos[campo] = valor as string | number;
      }
    };
    rellenar('direccion', d.direccion);
    rellenar('telefono', d.telefono);
    rellenar('horario', d.horario);
    rellenar('descripcion', d.descripcion);
    rellenar('precioMensual', d.precioMensual);
    if (d.tipo && m.tipo === this.tipoAlMarcar) {
      m.tipo = d.tipo;
    }
    this.autocompletados = nuevos;
    this.modelo = m;
  }

  enviar(): void {
    const m = this.modelo;
    const u = this.ubicacion();
    const precioTexto = m.precioMensual as number | string | null;
    const precio = precioTexto === null || precioTexto === '' ? null : Number(precioTexto);
    const comunes = {
      nombre: m.nombre.trim(),
      direccion: m.direccion.trim(),
      telefono: m.telefono.trim() || null,
      horario: m.horario.trim() || null,
      descripcion: m.descripcion.trim() || null,
    };

    const errores: Campo[] = [];
    if (!u) errores.push('ubicacion');
    if (!comunes.nombre) errores.push('nombre');
    if (!comunes.direccion) errores.push('direccion');
    if (this.clase() === 'centro' && precio !== null && (Number.isNaN(precio) || precio < 0)) errores.push('precioMensual');
    if ((comunes.descripcion?.length ?? 0) > 1500) errores.push('descripcion');
    this.errores.set(errores);
    if (errores.length > 0 || !u) {
      const selector = errores.includes('ubicacion') ? '#mapa-busqueda' : '[aria-invalid="true"]';
      enfocarTrasRender(this.injector, selector, () => this.host.nativeElement);
      return;
    }

    this.guardar.emit(
      this.clase() === 'centro'
        ? { ...comunes, ...u, precioMensual: precio }
        : { ...comunes, ...u, tipo: m.tipo },
    );
  }
}
