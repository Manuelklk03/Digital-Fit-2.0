import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, BadgeComponent, ButtonComponent, CardComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { EntrenamientoBase, UsuarioSesion } from '../../../models/entrenamiento';
import { mensajeError } from '../../../models/pagina-response';
import { EntrenamientosService } from '../../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { AdminEntrenamientosBaseService } from '../../../services/admin/admin-entrenamiento-base';
import { AuthService } from '../../../services/auth-service';
import { Aviso, EstadoCarga } from '../../entrenamientos/compartido/estado';
import { VARIANTE_NIVEL } from '../../entrenamientos/compartido/tarjeta-entrenamiento';

@Component({
  selector: 'app-detalle-entrenamiento-base',
  imports: [RouterLink, HeaderComponent, Footer, AlertComponent, BadgeComponent, ButtonComponent, CardComponent],
  templateUrl: './detalle-entrenamiento-base.html',
  styleUrl: '../../entrenamientos/compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleEntrenamientoComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly entrenamientosService = inject(EntrenamientosService);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);
  private readonly adminService = inject(AdminEntrenamientosBaseService);
  private readonly authService = inject(AuthService);

  readonly entrenamiento = signal<EntrenamientoBase | null>(null);
  readonly estado = signal<EstadoCarga>('cargando');
  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly esAdmin = computed(() => this.usuario()?.rol === 'ADMIN');
  readonly ocupado = signal(false);
  readonly aviso = new Aviso();
  readonly varianteNivel = VARIANTE_NIVEL;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (u: UsuarioSesion) => this.usuario.set(u),
      error: () => this.usuario.set(null),
    });
    this.cargar();
  }

  cargar(): void {
    this.estado.set('cargando');
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.entrenamientosService.getEntrenamientoById(id).subscribe({
      next: (e) => {
        this.entrenamiento.set(e);
        this.estado.set('listo');
      },
      error: () => this.estado.set('error'),
    });
  }

  anadir(e: EntrenamientoBase): void {
    const t = this.i18n.t().entrenamientos;
    this.ocupado.set(true);
    this.misEntrenamientosService.anadirDesdeBase(e.id).subscribe({
      next: () => {
        this.ocupado.set(false);
        this.aviso.mostrar(t.exitoAnadido, 'exito');
      },
      error: (err: unknown) => {
        this.ocupado.set(false);
        this.aviso.mostrar(mensajeError(err, t.errorAnadir), 'error');
      },
    });
  }

  borrar(e: EntrenamientoBase): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(true);
    this.adminService.borrarEntrenamientoBase(e.id).subscribe({
      next: () => void this.router.navigate(['/entrenamientos']),
      error: (err: unknown) => {
        this.ocupado.set(false);
        this.aviso.mostrar(mensajeError(err, t.errorBorrar), 'error');
      },
    });
  }
}
