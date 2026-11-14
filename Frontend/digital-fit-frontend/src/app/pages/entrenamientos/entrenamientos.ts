import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AlertComponent, ButtonComponent } from '../../components/ui';
import { I18nService } from '../../i18n/i18n.service';
import {
  EntrenamientoBase,
  EntrenamientoForm,
  FiltroEntrenamiento,
  UsuarioSesion,
} from '../../models/entrenamiento';
import { EntrenamientosService } from '../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../services/entrenamientos/mis-entrenamientos-service';
import { AdminEntrenamientosBaseService } from '../../services/admin/admin-entrenamiento-base';
import { AuthService } from '../../services/auth-service';
import { Aviso, ejecutarAccion, enfocarTrasRender, ListadoPaginado } from './compartido/estado';
import { EncabezadoPaginaComponent } from './compartido/encabezado-pagina';
import { EstadoListadoComponent } from './compartido/estado-listado';
import { FiltroEntrenamientosComponent } from './compartido/filtro-entrenamientos';
import { FormularioEntrenamientoComponent } from './compartido/formulario-entrenamiento';
import { TarjetaEntrenamientoComponent } from './compartido/tarjeta-entrenamiento';

@Component({
  selector: 'app-entrenamientos',
  imports: [
    HeaderComponent,
    Footer,
    AlertComponent,
    ButtonComponent,
    EncabezadoPaginaComponent,
    EstadoListadoComponent,
    FiltroEntrenamientosComponent,
    FormularioEntrenamientoComponent,
    TarjetaEntrenamientoComponent,
  ],
  templateUrl: './entrenamientos.html',
  styleUrl: './compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrenamientosComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly entrenamientosService = inject(EntrenamientosService);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);
  private readonly adminService = inject(AdminEntrenamientosBaseService);
  private readonly authService = inject(AuthService);

  private filtro: FiltroEntrenamiento | null = null;
  readonly listado = new ListadoPaginado<EntrenamientoBase>((page) =>
    this.entrenamientosService.buscar(this.filtro, page),
  );
  readonly aviso = new Aviso();
  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly esAdmin = computed(() => this.usuario()?.rol === 'ADMIN');
  readonly hayFiltro = signal(false);

  /** `undefined`: formulario cerrado; `null`: crear; entrenamiento: editar. */
  readonly enEdicion = signal<EntrenamientoBase | null | undefined>(undefined);
  readonly guardando = signal(false);
  readonly ocupado = signal<number | null>(null);

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (u: UsuarioSesion) => this.usuario.set(u),
      error: () => this.usuario.set(null),
    });
    this.listado.cargar();
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
    ejecutarAccion(
      editando
        ? this.adminService.actualizarEntrenamientoBase(editando.id, datos)
        : this.adminService.crearEntrenamientoBase(datos),
      {
        aviso: this.aviso,
        exito: editando ? t.exitoActualizado : t.exitoCreado,
        error: t.errorGuardar,
        alTerminar: () => this.guardando.set(false),
        alExito: () => {
          this.cerrarFormulario();
          this.listado.recargar();
        },
      },
    );
  }

  borrar(entrenamiento: EntrenamientoBase): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(entrenamiento.id);
    ejecutarAccion(this.adminService.borrarEntrenamientoBase(entrenamiento.id), {
      aviso: this.aviso,
      exito: t.exitoBorrado,
      error: t.errorBorrar,
      alTerminar: () => this.ocupado.set(null),
      alExito: () => this.listado.recargar(),
    });
  }

  anadir(entrenamiento: EntrenamientoBase): void {
    const t = this.i18n.t().entrenamientos;
    this.ocupado.set(entrenamiento.id);
    ejecutarAccion(this.misEntrenamientosService.anadirDesdeBase(entrenamiento.id), {
      aviso: this.aviso,
      exito: t.exitoAnadido,
      error: t.errorAnadir,
      alTerminar: () => this.ocupado.set(null),
    });
  }
}
