import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Detalle } from '../../compartido/estado';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { I18nService } from '../../i18n/i18n.service';
import { EstadisticaUsuario } from '../../models/progreso';
import { EstadisticasService } from '../../services/estadisticas/estadisticas-service';
import { AuthService } from '../../services/auth-service';
import { GuiaInicialService } from '../../services/guia-inicial.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HeaderComponent, Footer],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly estadisticasService = inject(EstadisticasService);
  private readonly auth = inject(AuthService);
  private readonly guia = inject(GuiaInicialService);
  private readonly usuario = toSignal(this.auth.usuario$, { initialValue: null });
  readonly usuarioDisponible = computed(() => this.usuario()?.rol === 'USER');

  readonly mostrarGuia = computed(() => {
    const usuario = this.usuario();
    return usuario?.rol === 'USER' && this.guia.estaVisible(usuario.username);
  });

  readonly estadisticas = new Detalle<EstadisticaUsuario>(() =>
    this.estadisticasService.getEstadisticas(),
  );

  ngOnInit(): void {
    this.estadisticas.cargar();
  }

  alternarGuia(): void {
    const usuario = this.usuario();
    if (usuario?.rol === 'USER') {
      this.guia.establecerVisible(usuario.username, !this.mostrarGuia());
    }
  }
}
