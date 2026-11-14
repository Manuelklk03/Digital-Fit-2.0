import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, ButtonComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import {
  EntrenamientoForm,
  EntrenamientoUsuario,
  FiltroEntrenamiento,
} from '../../../models/entrenamiento';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { Aviso, ejecutarAccion, enfocarTrasRender, ListadoPaginado } from '../compartido/estado';
import { EncabezadoPaginaComponent } from '../compartido/encabezado-pagina';
import { EstadoListadoComponent } from '../compartido/estado-listado';
import { FiltroEntrenamientosComponent } from '../compartido/filtro-entrenamientos';
import { FormularioEntrenamientoComponent } from '../compartido/formulario-entrenamiento';
import { TarjetaEntrenamientoComponent } from '../compartido/tarjeta-entrenamiento';

@Component({
  selector: 'app-mis-entrenamientos',
  imports: [
    RouterLink,
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
  templateUrl: './mis-entrenamientos.html',
  styleUrl: '../compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisEntrenamientosComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);

  private filtro: FiltroEntrenamiento | null = null;
  readonly listado = new ListadoPaginado<EntrenamientoUsuario>((page) =>
    this.misEntrenamientosService.buscar(this.filtro, page),
  );
  readonly aviso = new Aviso();
  readonly hayFiltro = signal(false);
  readonly formAbierto = signal(false);
  readonly guardando = signal(false);
  readonly ocupado = signal<number | null>(null);

  ngOnInit(): void {
    this.listado.cargar();
  }

  cerrarFormulario(): void {
    this.formAbierto.set(false);
    enfocarTrasRender(this.injector, '#boton-nuevo');
  }

  filtrar(filtro: FiltroEntrenamiento | null): void {
    this.filtro = filtro;
    this.hayFiltro.set(filtro !== null);
    this.listado.cargar(0);
  }

  crear(datos: EntrenamientoForm): void {
    const t = this.i18n.t().entrenamientos;
    this.guardando.set(true);
    ejecutarAccion(this.misEntrenamientosService.crearEntrenamiento(datos), {
      aviso: this.aviso,
      exito: t.exitoCreado,
      error: t.errorGuardar,
      alTerminar: () => this.guardando.set(false),
      alExito: () => {
        this.cerrarFormulario();
        this.listado.cargar(0);
      },
    });
  }

  borrar(entrenamiento: EntrenamientoUsuario): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(entrenamiento.id);
    ejecutarAccion(this.misEntrenamientosService.borrarEntrenamiento(entrenamiento.id), {
      aviso: this.aviso,
      exito: t.exitoBorrado,
      error: t.errorBorrar,
      alTerminar: () => this.ocupado.set(null),
      alExito: () => this.listado.recargar(),
    });
  }
}
