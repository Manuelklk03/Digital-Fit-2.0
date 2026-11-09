import { ChangeDetectionStrategy, Component, inject, Injector, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, BadgeComponent, ButtonComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { EntrenamientoForm, EntrenamientoUsuario, FiltroEntrenamiento } from '../../../models/entrenamiento';
import { mensajeError } from '../../../models/pagina-response';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { Aviso, enfocarTrasRender, ListadoPaginado } from '../compartido/estado';
import { FiltroEntrenamientosComponent } from '../compartido/filtro-entrenamientos';
import { FormularioEntrenamientoComponent } from '../compartido/formulario-entrenamiento';
import { PaginadorComponent } from '../compartido/paginador';
import { TarjetaEntrenamientoComponent } from '../compartido/tarjeta-entrenamiento';

@Component({
  selector: 'app-mis-entrenamientos',
  imports: [
    RouterLink,
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
    this.misEntrenamientosService.crearEntrenamiento(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.aviso.mostrar(t.exitoCreado, 'exito');
        this.listado.cargar(0);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.aviso.mostrar(mensajeError(err, t.errorGuardar), 'error');
      },
    });
  }

  borrar(entrenamiento: EntrenamientoUsuario): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(entrenamiento.id);
    this.misEntrenamientosService.borrarEntrenamiento(entrenamiento.id).subscribe({
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
}
