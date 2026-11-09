import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { BadgeComponent, ButtonComponent, CardComponent } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { fechaLegible, HistorialEntrenamiento } from '../../../models/entrenamiento';
import { HistorialEntrenamientosService } from '../../../services/entrenamientos/historial-entrenamientos';
import { EstadoCarga } from '../../entrenamientos/compartido/estado';

@Component({
  selector: 'app-detalle-historial-entrenamiento',
  imports: [RouterLink, HeaderComponent, Footer, BadgeComponent, ButtonComponent, CardComponent],
  templateUrl: './detalle-historial.html',
  styleUrl: '../../entrenamientos/compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleHistorialEntrenamientoComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly historialService = inject(HistorialEntrenamientosService);

  readonly registro = signal<HistorialEntrenamiento | null>(null);
  readonly estado = signal<EstadoCarga>('cargando');
  readonly fecha = computed(() => fechaLegible(this.registro()?.fecha, this.i18n.idiomaActual()));
  readonly tipoEntrenamiento = computed(() => {
    const h = this.i18n.t().entrenamientos.historial;
    return this.registro()?.tipoEntrenamiento === 'ENTRENAMIENTO_BASE' ? h.tipoBase : h.tipoMio;
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.estado.set('cargando');
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.historialService.getHistorialById(id).subscribe({
      next: (r) => {
        this.registro.set(r);
        this.estado.set('listo');
      },
      error: () => this.estado.set('error'),
    });
  }
}
