import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, BadgeComponent, ButtonComponent, CardComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { EntrenamientoUsuario } from '../../../models/entrenamiento';
import { mensajeError } from '../../../models/pagina-response';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { HistorialEntrenamientosService } from '../../../services/entrenamientos/historial-entrenamientos';
import { Aviso, EstadoCarga } from '../../entrenamientos/compartido/estado';
import { VARIANTE_NIVEL } from '../../entrenamientos/compartido/tarjeta-entrenamiento';

@Component({
  selector: 'app-detalle-mi-entrenamiento',
  imports: [RouterLink, HeaderComponent, Footer, AlertComponent, BadgeComponent, ButtonComponent, CardComponent],
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

  readonly entrenamiento = signal<EntrenamientoUsuario | null>(null);
  readonly estado = signal<EstadoCarga>('cargando');
  readonly guardandoHistorial = signal(false);
  readonly borrando = signal(false);
  readonly realizado = signal(false);
  readonly aviso = new Aviso();
  readonly varianteNivel = VARIANTE_NIVEL;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.estado.set('cargando');
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.misEntrenamientosService.getMiEntrenamientoById(id).subscribe({
      next: (e) => {
        this.entrenamiento.set(e);
        this.estado.set('listo');
      },
      error: () => this.estado.set('error'),
    });
  }

  marcarComoRealizado(e: EntrenamientoUsuario): void {
    const t = this.i18n.t().entrenamientos.mis;
    this.guardandoHistorial.set(true);
    this.historialService.crearRegistroDesdeMiEntrenamiento(e).subscribe({
      next: () => {
        this.guardandoHistorial.set(false);
        this.realizado.set(true);
        this.aviso.mostrar(t.exitoRealizado, 'exito');
      },
      error: (err: unknown) => {
        this.guardandoHistorial.set(false);
        this.aviso.mostrar(mensajeError(err, t.errorRealizado), 'error');
      },
    });
  }

  borrar(e: EntrenamientoUsuario): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.borrando.set(true);
    this.misEntrenamientosService.borrarEntrenamiento(e.id).subscribe({
      next: () => void this.router.navigate(['/mis-entrenamientos']),
      error: (err: unknown) => {
        this.borrando.set(false);
        this.aviso.mostrar(mensajeError(err, t.errorBorrar), 'error');
      },
    });
  }
}
