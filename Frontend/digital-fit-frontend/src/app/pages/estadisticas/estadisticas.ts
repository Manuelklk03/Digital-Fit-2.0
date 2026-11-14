import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ButtonComponent } from '../../components/ui';
import { I18nService } from '../../i18n/i18n.service';
import { EstadisticasService } from '../../services/estadisticas/estadisticas-service';
import { Detalle } from '../entrenamientos/compartido/estado';
import { EncabezadoPaginaComponent } from '../entrenamientos/compartido/encabezado-pagina';
import { EstadisticaUsuario } from '../../models/progreso';

/** Resumen del historial del usuario: sesiones, minutos, media, sitios distintos y entrenamiento más repetido. */
@Component({
  selector: 'app-estadisticas',
  imports: [RouterLink, HeaderComponent, Footer, ButtonComponent, EncabezadoPaginaComponent],
  styleUrls: ['../entrenamientos/compartido/pagina.css', './estadisticas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().progreso.estadisticas;
    <app-header />

    <main class="pagina" id="contenido-principal">
      <app-encabezado-pagina [badge]="t.badge" [titulo]="t.titulo" [subtitulo]="t.subtitulo">
        <a df-button variant="outline" routerLink="/valoraciones">{{ t.irValoraciones }}</a>
      </app-encabezado-pagina>

      @switch (estadisticas.estado()) {
        @case ('cargando') {
          <div class="kpis" role="status">
            <span class="sr-only">{{ i18n.t().comun.cargando }}</span>
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div
                class="esqueleto esqueleto-kpi"
                [class.kpi-texto]="i === 6"
                aria-hidden="true"
              ></div>
            }
          </div>
        }
        @case ('error') {
          <div class="estado estado-error" role="alert">
            <p>{{ t.errorCarga }}</p>
            <button
              df-button
              variant="outline"
              size="sm"
              type="button"
              (click)="estadisticas.cargar()"
            >
              {{ i18n.t().entrenamientos.reintentar }}
            </button>
          </div>
        }
        @default {
          @if (estadisticas.item(); as e) {
            @if (e.entrenamientosRealizados === 0) {
              <div class="estado">
                <p>{{ t.vacio }}</p>
                <a df-button variant="primary" size="sm" routerLink="/historial-entrenamientos">{{
                  t.irHistorial
                }}</a>
              </div>
            } @else {
              <dl class="kpis">
                <div class="kpi kpi-principal">
                  <dt>{{ t.entrenamientos }}</dt>
                  <dd class="num">{{ e.entrenamientosRealizados }}</dd>
                </div>
                <div class="kpi">
                  <dt>{{ t.minutos }}</dt>
                  <dd class="num">
                    {{ e.minutosEntrenados }} <span class="unidad">{{ t.minutosAbrev }}</span>
                  </dd>
                </div>
                <div class="kpi">
                  <dt>{{ t.promedio }}</dt>
                  <dd class="num">
                    {{ promedio() }} <span class="unidad">{{ t.minutosAbrev }}</span>
                  </dd>
                </div>
                <div class="kpi">
                  <dt>{{ t.centros }}</dt>
                  <dd class="num">{{ e.centrosPrivadosVisitados }}</dd>
                </div>
                <div class="kpi">
                  <dt>{{ t.lugares }}</dt>
                  <dd class="num">{{ e.lugaresPublicosVisitados }}</dd>
                </div>
                <div class="kpi kpi-texto">
                  <dt>{{ t.masRealizado }}</dt>
                  <dd>{{ masRealizado() ?? t.sinDatos }}</dd>
                </div>
              </dl>
            }
          }
        }
      }
    </main>

    <app-footer />
  `,
})
export class EstadisticasComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly estadisticasService = inject(EstadisticasService);

  readonly estadisticas = new Detalle<EstadisticaUsuario>(() =>
    this.estadisticasService.getEstadisticas(),
  );
  /** El backend usa "N/A" cuando no hay un entrenamiento más repetido. */
  readonly masRealizado = computed(() => {
    const valor = this.estadisticas.item()?.entrenamientoMasRealizado?.trim();
    return valor && valor !== 'N/A' ? valor : null;
  });

  /** Con el separador decimal del idioma elegido (12,5 en español; 12.5 en inglés). */
  readonly promedio = computed(() =>
    new Intl.NumberFormat(this.i18n.idiomaActual(), { maximumFractionDigits: 1 }).format(
      this.estadisticas.item()?.promedioMinutosEntrenamiento ?? 0,
    ),
  );

  ngOnInit(): void {
    this.estadisticas.cargar();
  }
}
