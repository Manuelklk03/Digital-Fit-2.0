import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, Injector, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, map, Observable, of, Subscription } from 'rxjs';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AlertComponent, BadgeComponent, ButtonComponent, CardComponent, InputDirective } from '../../components/ui';
import { I18nService } from '../../i18n/i18n.service';
import { fechaLegible, UsuarioSesion } from '../../models/entrenamiento';
import { AuthService } from '../../services/auth-service';
import {
  CATEGORIAS_VALORACION,
  CategoriaValoracion,
  categoriaDeTipo,
  TipoValoracion,
  Valoracion,
} from '../../models/progreso';
import { ValoracionesService } from '../../services/valoraciones/valoraciones-service';
import { EntrenamientosService } from '../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../services/entrenamientos/mis-entrenamientos-service';
import { HistorialEntrenamientosService } from '../../services/entrenamientos/historial-entrenamientos';
import { EntrenamientosComunidadService } from '../../services/entrenamientos/entrenamiento-comunidad-service';
import { PrivadosService } from '../../services/centros/privados-service';
import { MisCentrosService } from '../../services/centros/mis-centros-service';
import { PublicosService } from '../../services/publicos/publicos-service';
import { MisLugaresService } from '../../services/publicos/mis-lugares';
import { Aviso, ejecutarAccion, enfocarTrasRender, ListadoPaginado } from '../entrenamientos/compartido/estado';
import { EncabezadoPaginaComponent } from '../entrenamientos/compartido/encabezado-pagina';
import { EstadoListadoComponent } from '../entrenamientos/compartido/estado-listado';

/** Un contenido que se puede valorar, ya con el texto que se muestra en el select. */
export interface OpcionValoracion {
  tipo: TipoValoracion;
  id: number;
  texto: string;
}

interface GrupoOpciones {
  tipo: TipoValoracion;
  opciones: OpcionValoracion[];
}

@Component({
  selector: 'app-valoraciones',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    HeaderComponent,
    Footer,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    InputDirective,
    EncabezadoPaginaComponent,
    EstadoListadoComponent,
  ],
  templateUrl: './valoraciones.html',
  styleUrls: ['../entrenamientos/compartido/pagina.css', './valoraciones.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValoracionesComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly valoracionesService = inject(ValoracionesService);
  private readonly entrenamientosService = inject(EntrenamientosService);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);
  private readonly historialService = inject(HistorialEntrenamientosService);
  private readonly comunidadService = inject(EntrenamientosComunidadService);
  private readonly privadosService = inject(PrivadosService);
  private readonly misCentrosService = inject(MisCentrosService);
  private readonly publicosService = inject(PublicosService);
  private readonly misLugaresService = inject(MisLugaresService);
  private readonly authService = inject(AuthService);
  /** Carga de opciones en curso: se cancela al cambiar de categoría para no mezclar listas. */
  private opcionesSub?: Subscription;

  readonly categorias = CATEGORIAS_VALORACION;
  readonly estrellas = [1, 2, 3, 4, 5];

  readonly mias = new ListadoPaginado<Valoracion>((page) => this.valoracionesService.getPaginaMisValoraciones(page));
  readonly filtroComunidad = signal<CategoriaValoracion | null>(null);
  readonly comunidad = new ListadoPaginado<Valoracion>((page) =>
    this.valoracionesService.getPaginaPublicas(this.filtroComunidad(), page),
  );
  readonly aviso = new Aviso();

  /** `undefined`: formulario cerrado; `null`: nueva; valoración: editar la propia. */
  readonly enEdicion = signal<Valoracion | null | undefined>(undefined);
  readonly guardando = signal(false);
  readonly ocupado = signal<number | null>(null);
  readonly grupos = signal<GrupoOpciones[] | null>(null);
  readonly errorOpciones = signal(false);
  readonly errores = signal<('contenido' | 'comentario')[]>([]);
  readonly usuario = signal<UsuarioSesion | null>(null);

  categoria: CategoriaValoracion = 'ENTRENAMIENTOS';
  /** Valor del select: `TIPO|id`. */
  seleccion = '';
  puntuacion = 5;
  comentario = '';

  constructor() {
    inject(DestroyRef).onDestroy(() => this.opcionesSub?.unsubscribe());
  }

  ngOnInit(): void {
    this.authService.me().subscribe({ next: (u: UsuarioSesion) => this.usuario.set(u), error: () => this.usuario.set(null) });
    this.mias.cargar();
    this.comunidad.cargar();
  }

  abrirNueva(): void {
    this.enEdicion.set(null);
    this.seleccion = '';
    this.puntuacion = 5;
    this.comentario = '';
    this.errores.set([]);
    this.cargarOpciones();
    enfocarTrasRender(this.injector, '#val-categoria');
  }

  editar(v: Valoracion): void {
    this.enEdicion.set(v);
    this.puntuacion = v.puntuacion;
    this.comentario = v.comentario ?? '';
    this.errores.set([]);
    enfocarTrasRender(this.injector, '#val-titulo');
  }

  cerrarFormulario(): void {
    this.enEdicion.set(undefined);
    enfocarTrasRender(this.injector, '#boton-nuevo');
  }

  cambiarCategoria(categoria: CategoriaValoracion): void {
    this.categoria = categoria;
    this.seleccion = '';
    this.cargarOpciones();
  }

  /** Carga las listas de la categoría; si alguna falla queda vacía y se ofrece reintentar. */
  cargarOpciones(): void {
    this.opcionesSub?.unsubscribe();
    this.grupos.set(null);
    let fallo = false;
    const lista = <T>(tipo: TipoValoracion, fuente: Observable<T[]>, texto: (x: T) => string, id: (x: T) => number) =>
      fuente.pipe(
        map((xs) => ({ tipo, opciones: xs.map((x) => ({ tipo, id: id(x), texto: texto(x) })) })),
        catchError(() => {
          fallo = true;
          return of({ tipo, opciones: [] });
        }),
      );
    const idioma = this.i18n.idiomaActual();
    const porId = (x: { id: number }) => x.id;
    const porNombre = (x: { nombre: string }) => x.nombre;
    const fuentes: Record<CategoriaValoracion, Observable<GrupoOpciones>[]> = {
      ENTRENAMIENTOS: [
        lista('ENTRENAMIENTO_BASE', this.entrenamientosService.getEntrenamientos(), porNombre, porId),
        lista('ENTRENAMIENTO_USUARIO', this.misEntrenamientosService.getMisEntrenamientos(), porNombre, porId),
        lista('HISTORIAL_ENTRENAMIENTO', this.historialService.getHistorial(),
          (h) => `${h.entrenamiento} · ${fechaLegible(h.fecha, idioma)}`, porId),
        lista('ENTRENAMIENTO_COMUNIDAD', this.comunidadService.getEntrenamientosComunidad(),
          (c) => `${c.nombre} · ${c.usuario}`, porId),
      ],
      CENTROS_PRIVADOS: [
        lista('CENTRO_PRIVADO_BASE', this.privadosService.getCentrosPrivados(), porNombre, porId),
        lista('CENTRO_PRIVADO_USUARIO', this.misCentrosService.getMisCentros(), porNombre, porId),
      ],
      LUGARES_PUBLICOS: [
        lista('LUGAR_PUBLICO_BASE', this.publicosService.getLugaresPublicos(), porNombre, porId),
        lista('LUGAR_PUBLICO_USUARIO', this.misLugaresService.getMisLugares(), porNombre, porId),
      ],
    };
    this.opcionesSub = forkJoin(fuentes[this.categoria]).subscribe((grupos) => {
      this.errorOpciones.set(fallo);
      this.grupos.set(grupos);
    });
  }

  guardar(): void {
    const t = this.i18n.t().progreso.valoraciones;
    const editando = this.enEdicion();
    const [tipo, id] = editando
      ? [editando.tipoDeValoracion, editando.contenidoId]
      : [this.seleccion.split('|')[0] as TipoValoracion, Number(this.seleccion.split('|')[1])];
    const comentario = this.comentario.trim();

    const errores: ('contenido' | 'comentario')[] = [];
    if (!editando && !this.seleccion) errores.push('contenido');
    if (comentario.length > 1000) errores.push('comentario');
    this.errores.set(errores);
    if (errores.length > 0) {
      enfocarTrasRender(this.injector, '[aria-invalid="true"]', () => this.host.nativeElement);
      return;
    }

    this.guardando.set(true);
    ejecutarAccion(
      this.valoracionesService.crearOActualizarValoracion(tipo, id, {
        puntuacion: Number(this.puntuacion),
        comentario: comentario || null,
      }),
      {
        aviso: this.aviso,
        exito: t.exitoGuardada,
        error: t.errorGuardar,
        alTerminar: () => this.guardando.set(false),
        alExito: () => {
          this.cerrarFormulario();
          this.mias.cargar(0);
          this.comunidad.recargar();
        },
      },
    );
  }

  borrar(v: Valoracion): void {
    const t = this.i18n.t().progreso.valoraciones;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(v.id);
    ejecutarAccion(this.valoracionesService.borrarValoracion(v.tipoDeValoracion, v.contenidoId), {
      aviso: this.aviso,
      exito: t.exitoBorrada,
      error: t.errorBorrar,
      alTerminar: () => this.ocupado.set(null),
      alExito: () => {
        this.mias.recargar();
        this.comunidad.recargar();
        // La tarjeta desaparece: el foco vuelve al título de la sección para no perderse en el body.
        enfocarTrasRender(this.injector, '#titulo-mias');
      },
    });
  }

  filtrarComunidad(categoria: CategoriaValoracion | null): void {
    this.filtroComunidad.set(categoria);
    this.comunidad.cargar(0);
  }

  esMia(v: Valoracion): boolean {
    return v.username === this.usuario()?.username;
  }

  textoCategoria(v: Valoracion): string {
    return this.i18n.t().progreso.categorias[categoriaDeTipo(v.tipoDeValoracion)];
  }

  fecha(v: Valoracion): string {
    return fechaLegible(v.fecha, this.i18n.idiomaActual());
  }
}
