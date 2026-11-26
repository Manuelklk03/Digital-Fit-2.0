import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Detalle } from '../../compartido/estado';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { I18nService } from '../../i18n/i18n.service';
import { EstadisticaUsuario } from '../../models/progreso';
import { EstadisticasService } from '../../services/estadisticas/estadisticas-service';

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

  readonly estadisticas = new Detalle<EstadisticaUsuario>(() =>
    this.estadisticasService.getEstadisticas(),
  );

  ngOnInit(): void {
    this.estadisticas.cargar();
  }
}
