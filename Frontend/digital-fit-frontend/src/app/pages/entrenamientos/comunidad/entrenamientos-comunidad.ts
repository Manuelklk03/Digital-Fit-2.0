import { ChangeDetectionStrategy, Component, inject, Injector, OnInit, signal } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, BadgeComponent, ButtonComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import {
  EntrenamientoComunidad,
  EntrenamientoForm,
  fechaLegible,
  FiltroEntrenamiento,
  UsuarioSesion,
} from '../../../models/entrenamiento';
import { mensajeError } from '../../../models/pagina-response';
import { AuthService } from '../../../services/auth-service';
import { EntrenamientosComunidadService } from '../../../services/entrenamientos/entrenamiento-comunidad-service';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { Aviso, enfocarTrasRender, ListadoPaginado } from '../compartido/estado';
import { FiltroEntrenamientosComponent } from '../compartido/filtro-entrenamientos';
import { FormularioEntrenamientoComponent } from '../compartido/formulario-entrenamiento';
import { PaginadorComponent } from '../compartido/paginador';
import { TarjetaEntrenamientoComponent } from '../compartido/tarjeta-entrenamiento';

@Component({
  selector: 'app-entrenamientos-comunidad',
  imports: [
    HeaderComponent,
    Footer,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    FiltroEntrenamientosComponent,
    FormularioEntrenamientoComponent,
    PaginadorComponent,
    TarjetaEntrenamientoComponent,
  ],
  templateUrl: './entrenamientos-comunidad.html',
  styleUrl: '../compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrenamientosComunidadComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly comunidadService = inject(EntrenamientosComunidadService);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);
  private readonly authService = inject(AuthService);

  private filtro: FiltroEntrenamiento | null = null;
  readonly listado = new ListadoPaginado<EntrenamientoComunidad>((page) =>
    this.comunidadService.buscar(this.filtro, page),
  );
  readonly aviso = new Aviso();
  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly hayFiltro = signal(false);

  /** `undefined`: formulario cerrado; `null`: publicar; entrenamiento: editar. */
  readonly enEdicion = signal<EntrenamientoComunidad | null | undefined>(undefined);
  readonly guardando = signal(false);
  readonly ocupado = signal<number | null>(null);

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (u: UsuarioSesion) => this.usuario.set(u),
      error: () => this.usuario.set(null),
    });
    this.listado.cargar();
  }

  esMio(entrenamiento: EntrenamientoComunidad): boolean {
    return this.usuario()?.username === entrenamiento.usuario;
  }

  fecha(entrenamiento: EntrenamientoComunidad): string {
    return fechaLegible(entrenamiento.fechaPublicacion, this.i18n.idiomaActual());
  }

  cerrarFormulario(): void {
    this.enEdicion.set(undefined);
    enfocarTrasRender(this.injector, '#boton-nuevo');
  }

  filtrar(filtro: FiltroEntrenamiento | null): void {
    this.filtro = filtro;
    this.hayFiltro.set(filtro !== null);
    this.listado.cargar(0);
  }

  guardar(datos: EntrenamientoForm): void {
    const t = this.i18n.t().entrenamientos;
    const editando = this.enEdicion();
    this.guardando.set(true);
    const peticion = editando
      ? this.comunidadService.actualizarEntrenamientoComunidad(editando.id, datos)
      : this.comunidadService.crearEntrenamientoComunidad(datos);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.aviso.mostrar(editando ? t.exitoActualizado : t.exitoCreado, 'exito');
        this.listado.recargar();
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.aviso.mostrar(mensajeError(err, t.errorGuardar), 'error');
      },
    });
  }

  borrar(entrenamiento: EntrenamientoComunidad): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(entrenamiento.id);
    this.comunidadService.borrarEntrenamientoComunidad(entrenamiento.id).subscribe({
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

  anadir(entrenamiento: EntrenamientoComunidad): void {
    const t = this.i18n.t().entrenamientos;
    this.ocupado.set(entrenamiento.id);
    this.misEntrenamientosService.anadirDesdeComunidad(entrenamiento.id).subscribe({
      next: () => {
        this.ocupado.set(null);
        this.aviso.mostrar(t.exitoAnadido, 'exito');
      },
      error: (err: unknown) => {
        this.ocupado.set(null);
        this.aviso.mostrar(mensajeError(err, t.errorAnadir), 'error');
      },
    });
  }
}
