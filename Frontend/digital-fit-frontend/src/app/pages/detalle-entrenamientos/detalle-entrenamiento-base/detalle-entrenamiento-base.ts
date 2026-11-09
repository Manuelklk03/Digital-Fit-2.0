import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, ButtonComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { EntrenamientoBase, UsuarioSesion } from '../../../models/entrenamiento';
import { EntrenamientosService } from '../../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { AdminEntrenamientosBaseService } from '../../../services/admin/admin-entrenamiento-base';
import { AuthService } from '../../../services/auth-service';
import { Aviso, Detalle, ejecutarAccion } from '../../entrenamientos/compartido/estado';
import { DetalleVistaComponent } from '../../entrenamientos/compartido/detalle-vista';

@Component({
  selector: 'app-detalle-entrenamiento-base',
  imports: [HeaderComponent, Footer, AlertComponent, ButtonComponent, DetalleVistaComponent],
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

  readonly detalle = new Detalle<EntrenamientoBase>(() =>
    this.entrenamientosService.getEntrenamientoById(Number(this.route.snapshot.paramMap.get('id'))),
  );
  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly esAdmin = computed(() => this.usuario()?.rol === 'ADMIN');
  readonly ocupado = signal(false);
  readonly aviso = new Aviso();

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (u: UsuarioSesion) => this.usuario.set(u),
      error: () => this.usuario.set(null),
    });
    this.detalle.cargar();
  }

  anadir(e: EntrenamientoBase): void {
    const t = this.i18n.t().entrenamientos;
    this.ocupado.set(true);
    ejecutarAccion(this.misEntrenamientosService.anadirDesdeBase(e.id), {
      aviso: this.aviso,
      exito: t.exitoAnadido,
      error: t.errorAnadir,
      alTerminar: () => this.ocupado.set(false),
    });
  }

  borrar(e: EntrenamientoBase): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(true);
    ejecutarAccion(this.adminService.borrarEntrenamientoBase(e.id), {
      aviso: this.aviso,
      error: t.errorBorrar,
      alTerminar: () => this.ocupado.set(false),
      alExito: () => void this.router.navigate(['/entrenamientos']),
    });
  }
}
