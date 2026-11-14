import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, ButtonComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { EntrenamientoUsuario } from '../../../models/entrenamiento';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { HistorialEntrenamientosService } from '../../../services/entrenamientos/historial-entrenamientos';
import { Aviso, Detalle, ejecutarAccion } from '../../entrenamientos/compartido/estado';
import { DetalleVistaComponent } from '../../entrenamientos/compartido/detalle-vista';

@Component({
  selector: 'app-detalle-mi-entrenamiento',
  imports: [
    RouterLink,
    HeaderComponent,
    Footer,
    AlertComponent,
    ButtonComponent,
    DetalleVistaComponent,
  ],
  templateUrl: './detalle-mis-entrenamientos.html',
  styleUrl: '../../entrenamientos/compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleMiEntrenamientoComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);
  private readonly historialService = inject(HistorialEntrenamientosService);

  readonly detalle = new Detalle<EntrenamientoUsuario>(() =>
    this.misEntrenamientosService.getMiEntrenamientoById(
      Number(this.route.snapshot.paramMap.get('id')),
    ),
  );
  readonly guardandoHistorial = signal(false);
  readonly borrando = signal(false);
  readonly realizado = signal(false);
  readonly aviso = new Aviso();

  ngOnInit(): void {
    this.detalle.cargar();
  }

  marcarComoRealizado(e: EntrenamientoUsuario): void {
    const t = this.i18n.t().entrenamientos.mis;
    this.guardandoHistorial.set(true);
    ejecutarAccion(this.historialService.crearRegistroDesdeMiEntrenamiento(e), {
      aviso: this.aviso,
      exito: t.exitoRealizado,
      error: t.errorRealizado,
      alTerminar: () => this.guardandoHistorial.set(false),
      alExito: () => this.realizado.set(true),
    });
  }

  borrar(e: EntrenamientoUsuario): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.borrando.set(true);
    ejecutarAccion(this.misEntrenamientosService.borrarEntrenamiento(e.id), {
      aviso: this.aviso,
      error: t.errorBorrar,
      alTerminar: () => this.borrando.set(false),
      alExito: () => void this.router.navigate(['/mis-entrenamientos']),
    });
  }
}
