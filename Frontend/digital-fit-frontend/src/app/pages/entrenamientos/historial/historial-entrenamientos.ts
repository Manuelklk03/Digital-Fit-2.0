import { ChangeDetectionStrategy, Component, ElementRef, inject, Injector, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable, of, catchError } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import {
  AlertComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  InputDirective,
} from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import {
  CrearHistorial,
  Entrenamiento,
  fechaLegible,
  HistorialEntrenamiento,
} from '../../../models/entrenamiento';
import { mensajeError } from '../../../models/pagina-response';
import { HistorialEntrenamientosService } from '../../../services/entrenamientos/historial-entrenamientos';
import { EntrenamientosService } from '../../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { PrivadosService } from '../../../services/centros/privados-service';
import { MisCentrosService } from '../../../services/centros/mis-centros-service';
import { PublicosService } from '../../../services/publicos/publicos-service';
import { MisLugaresService } from '../../../services/publicos/mis-lugares';
import { Aviso, enfocarTrasRender, ListadoPaginado } from '../compartido/estado';
import { PaginadorComponent } from '../compartido/paginador';

/** Lo mínimo que el formulario necesita de un centro o lugar (sus modelos se tipan en el recorrido de lugares). */
interface OpcionUbicacion {
  id: number;
  nombre: string;
}

interface Opciones {
  base: Entrenamiento[];
  mios: Entrenamiento[];
  lugaresBase: OpcionUbicacion[];
  misLugares: OpcionUbicacion[];
  centrosBase: OpcionUbicacion[];
  misCentros: OpcionUbicacion[];
}

/** Clave del select a campo del cuerpo `CrearHistorial`. */
const CAMPO_POR_PREFIJO = {
  BASE: 'entrenamientoBaseId',
  MIS: 'entrenamientoUsuarioId',
  LPB: 'lugarPublicoBaseId',
  LPU: 'lugarPublicoUsuarioId',
  CPB: 'centroPrivadoBaseId',
  CPU: 'centroPrivadoUsuarioId',
} as const;

@Component({
  selector: 'app-historial-entrenamientos',
  imports: [
    FormsModule,
    RouterLink,
    HeaderComponent,
    Footer,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    InputDirective,
    PaginadorComponent,
  ],
  templateUrl: './historial-entrenamientos.html',
  styleUrls: ['../compartido/pagina.css', './historial-entrenamientos.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialEntrenamientosComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly historialService = inject(HistorialEntrenamientosService);
  private readonly entrenamientosService = inject(EntrenamientosService);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);
  private readonly privadosService = inject(PrivadosService);
  private readonly misCentrosService = inject(MisCentrosService);
  private readonly publicosService = inject(PublicosService);
  private readonly misLugaresService = inject(MisLugaresService);

  readonly listado = new ListadoPaginado<HistorialEntrenamiento>((page) =>
    this.historialService.getPaginaHistorial(page),
  );
  readonly aviso = new Aviso();
  readonly opciones = signal<Opciones | null>(null);
  readonly errorOpciones = signal(false);
  readonly formAbierto = signal(false);
  readonly guardando = signal(false);
  readonly ocupado = signal<number | null>(null);
  readonly errores = signal<('entrenamiento' | 'fecha' | 'duracion')[]>([]);

  entrenamientoSeleccionado = '';
  ubicacionSeleccionada = '';
  fecha = '';
  duracionEnMinutos = 30;
  notas = '';

  ngOnInit(): void {
    this.listado.cargar();
  }

  abrirFormulario(): void {
    this.formAbierto.set(true);
    enfocarTrasRender(this.injector, '#titulo-registro');
    if (this.opciones() && !this.errorOpciones()) {
      return;
    }
    this.cargarOpciones();
  }

  /** Una lista que falle queda vacía y se avisa con opción de reintentar; el resto del formulario sigue siendo útil. */
  cargarOpciones(): void {
    this.opciones.set(null);
    let fallo = false;
    const vacio = <T>(o: Observable<T[]>) =>
      o.pipe(catchError(() => {
        fallo = true;
        return of([] as T[]);
      }));
    forkJoin({
      base: vacio(this.entrenamientosService.getEntrenamientos()),
      mios: vacio(this.misEntrenamientosService.getMisEntrenamientos()),
      lugaresBase: vacio<OpcionUbicacion>(this.publicosService.getLugaresPublicos()),
      misLugares: vacio<OpcionUbicacion>(this.misLugaresService.getMisLugares()),
      centrosBase: vacio<OpcionUbicacion>(this.privadosService.getCentrosPrivados()),
      misCentros: vacio<OpcionUbicacion>(this.misCentrosService.getMisCentros()),
    }).subscribe((o) => {
      this.errorOpciones.set(fallo);
      this.opciones.set(o);
    });
  }

  cerrarFormulario(): void {
    this.formAbierto.set(false);
    this.errores.set([]);
    enfocarTrasRender(this.injector, '#boton-nuevo');
  }

  crearRegistro(): void {
    const t = this.i18n.t().entrenamientos;
    const duracion = Number(this.duracionEnMinutos);
    const errores: ('entrenamiento' | 'fecha' | 'duracion')[] = [];
    if (!this.entrenamientoSeleccionado) errores.push('entrenamiento');
    if (!this.fecha) errores.push('fecha');
    if (!Number.isInteger(duracion) || duracion < 1) errores.push('duracion');
    this.errores.set(errores);
    if (errores.length > 0) {
      enfocarTrasRender(this.injector, '[aria-invalid="true"]', () => this.host.nativeElement);
      return;
    }

    const registro: CrearHistorial = {
      entrenamientoBaseId: null,
      entrenamientoUsuarioId: null,
      lugarPublicoBaseId: null,
      lugarPublicoUsuarioId: null,
      centroPrivadoBaseId: null,
      centroPrivadoUsuarioId: null,
      fecha: `${this.fecha.replace('T', ' ')}:00`,
      duracionEnMinutos: duracion,
      notas: this.notas.trim(),
    };
    for (const clave of [this.entrenamientoSeleccionado, this.ubicacionSeleccionada]) {
      const [prefijo, id] = clave.split('-');
      const campo = CAMPO_POR_PREFIJO[prefijo as keyof typeof CAMPO_POR_PREFIJO];
      if (campo) {
        registro[campo] = Number(id);
      }
    }

    this.guardando.set(true);
    this.historialService.crearRegistro(registro).subscribe({
      next: () => {
        this.guardando.set(false);
        this.limpiarFormulario();
        this.cerrarFormulario();
        this.aviso.mostrar(t.historial.exitoRegistro, 'exito');
        this.listado.cargar(0);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.aviso.mostrar(mensajeError(err, t.historial.errorRegistro), 'error');
      },
    });
  }

  borrarRegistro(registro: HistorialEntrenamiento): void {
    const t = this.i18n.t().entrenamientos.historial;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(registro.id);
    this.historialService.borrarRegistro(registro.id).subscribe({
      next: () => {
        this.ocupado.set(null);
        this.aviso.mostrar(t.exitoBorrado, 'exito');
        this.listado.recargar();
      },
      error: (err: unknown) => {
        this.ocupado.set(null);
        this.aviso.mostrar(mensajeError(err, t.errorBorrar), 'error');
      },
    });
  }

  fechaRegistro(registro: HistorialEntrenamiento): string {
    return fechaLegible(registro.fecha, this.i18n.idiomaActual());
  }

  tipoEntrenamiento(registro: HistorialEntrenamiento): string {
    const t = this.i18n.t().entrenamientos.historial;
    return registro.tipoEntrenamiento === 'ENTRENAMIENTO_BASE' ? t.tipoBase : t.tipoMio;
  }

  private limpiarFormulario(): void {
    this.entrenamientoSeleccionado = '';
    this.ubicacionSeleccionada = '';
    this.fecha = '';
    this.duracionEnMinutos = 30;
    this.notas = '';
  }
}
