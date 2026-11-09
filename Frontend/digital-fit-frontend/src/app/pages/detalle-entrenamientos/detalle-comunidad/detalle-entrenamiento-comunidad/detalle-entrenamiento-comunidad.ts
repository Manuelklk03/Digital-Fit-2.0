import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header';
import { Footer } from '../../../../components/footer/footer';
import { AlertComponent, BadgeComponent, ButtonComponent } from '../../../../components/ui';
import { I18nService } from '../../../../i18n/i18n.service';
import { EntrenamientoComunidad, fechaLegible, UsuarioSesion } from '../../../../models/entrenamiento';
import { AuthService } from '../../../../services/auth-service';
import { EntrenamientosComunidadService } from '../../../../services/entrenamientos/entrenamiento-comunidad-service';
import { MisEntrenamientosService } from '../../../../services/entrenamientos/mis-entrenamientos-service';
import { Aviso, Detalle, ejecutarAccion } from '../../../entrenamientos/compartido/estado';
import { DetalleVistaComponent } from '../../../entrenamientos/compartido/detalle-vista';

@Component({
  selector: 'app-detalle-entrenamiento-comunidad',
  imports: [HeaderComponent, Footer, AlertComponent, BadgeComponent, ButtonComponent, DetalleVistaComponent],
  templateUrl: './detalle-entrenamiento-comunidad.html',
  styleUrl: '../../../entrenamientos/compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleEntrenamientoComunidadComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly comunidadService = inject(EntrenamientosComunidadService);
  private readonly misEntrenamientosService = inject(MisEntrenamientosService);
  private readonly authService = inject(AuthService);

  readonly detalle = new Detalle<EntrenamientoComunidad>(() =>
    this.comunidadService.getEntrenamientoComunidadById(Number(this.route.snapshot.paramMap.get('id'))),
  );
  readonly usuario = signal<UsuarioSesion | null>(null);
  readonly esMio = computed(() => {
    const u = this.usuario();
    return u !== null && u.username === this.detalle.item()?.usuario;
  });
  readonly datosExtra = computed(() => {
    const e = this.detalle.item();
    const t = this.i18n.t().entrenamientos.comunidad;
    return e
      ? [
          { etiqueta: t.autor, valor: e.usuario },
          { etiqueta: t.publicado, valor: fechaLegible(e.fechaPublicacion, this.i18n.idiomaActual()) },
        ]
      : [];
  });
  readonly ocupado = signal(false);
  readonly aviso = new Aviso();

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (u: UsuarioSesion) => this.usuario.set(u),
      error: () => this.usuario.set(null),
    });
    this.detalle.cargar();
  }

  anadir(e: EntrenamientoComunidad): void {
    const t = this.i18n.t().entrenamientos;
    this.ocupado.set(true);
    ejecutarAccion(this.misEntrenamientosService.anadirDesdeComunidad(e.id), {
      aviso: this.aviso,
      exito: t.exitoAnadido,
      error: t.errorAnadir,
      alTerminar: () => this.ocupado.set(false),
    });
  }

  borrar(e: EntrenamientoComunidad): void {
    const t = this.i18n.t().entrenamientos;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(true);
    ejecutarAccion(this.comunidadService.borrarEntrenamientoComunidad(e.id), {
      aviso: this.aviso,
      error: t.errorBorrar,
      alTerminar: () => this.ocupado.set(false),
      alExito: () => void this.router.navigate(['/entrenamientos-comunidad']),
    });
  }
}
