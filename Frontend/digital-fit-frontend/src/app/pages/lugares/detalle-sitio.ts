import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { MigasComponent } from '../../components/migas/migas';
import { Footer } from '../../components/footer/footer';
import { AlertComponent, BadgeComponent, ButtonComponent, CardComponent } from '../../components/ui';
import { MapaSelectorComponent } from '../../components/mapa-selector/mapa-selector';
import { I18nService } from '../../i18n/i18n.service';
import { UsuarioSesion } from '../../models/entrenamiento';
import { coordenadasLegibles, esLugarPublico, Sitio } from '../../models/lugar';
import { AuthService } from '../../services/auth-service';
import { Aviso, Detalle, ejecutarAccion } from '../entrenamientos/compartido/estado';
import { ConfigDetalle } from './config';

/** Detalle de un centro o lugar: ficha, mapa de solo lectura y acciones según permisos. */
@Component({
  selector: 'app-detalle-sitio',
  imports: [RouterLink, HeaderComponent, Footer, AlertComponent, BadgeComponent, ButtonComponent, CardComponent, MapaSelectorComponent, MigasComponent],
  styleUrl: '../entrenamientos/compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = config();
    @let t = i18n.t().lugares;
    @let te = i18n.t().entrenamientos;
    <app-header />

    <main class="pagina" id="contenido-principal">
      <app-migas />
      <a df-button variant="ghost" size="sm" class="volver" [routerLink]="c.rutaListado"><span aria-hidden="true">←</span> {{ t.volverListado }}</a>

      @if (aviso.actual(); as a) {
        <app-alert [tipo]="a.tipo" (cerrar)="aviso.cerrar()">{{ a.texto }}</app-alert>
      }

      @switch (detalle.estado()) {
        @case ('cargando') {
          <div role="status">
            <span class="sr-only">{{ i18n.t().comun.cargando }}</span>
            <div class="esqueleto" aria-hidden="true"></div>
          </div>
        }
        @case ('error') {
          <div class="estado estado-error" role="alert">
            <p>{{ t.errorDetalle }}</p>
            <button df-button variant="outline" size="sm" type="button" (click)="detalle.cargar()">{{ te.reintentar }}</button>
          </div>
        }
        @default {
          @if (detalle.item(); as s) {
            <app-card>
              <article class="detalle">
                <div class="chips">
                  <span df-badge variant="primary" [dot]="true">{{ t[c.seccion].detalle }}</span>
                  @if (esLugar(s)) {
                    <span df-badge badgeStyle="outline">{{ t.tipos[s.tipo] }}</span>
                  }
                </div>
                <h1 class="cabecera-detalle">{{ s.nombre }}</h1>
                <dl class="datos">
                  <div class="dato"><dt>{{ t.campoDireccion }}</dt><dd>{{ s.direccion }}</dd></div>
                  @if (!esLugar(s)) {
                    <div class="dato"><dt>{{ t.campoPrecio }}</dt>
                      <dd class="num">{{ s.precioMensual != null ? s.precioMensual + ' ' + t.porMes : t.sinPrecio }}</dd></div>
                  }
                  <div class="dato"><dt>{{ t.campoHorario }}</dt><dd>{{ s.horario || t.noDisponible }}</dd></div>
                  <div class="dato"><dt>{{ t.campoTelefono }}</dt><dd>{{ s.telefono || t.noDisponible }}</dd></div>
                  <div class="dato"><dt>{{ t.campoUbicacion }}</dt><dd class="num">{{ coordenadas() ?? t.sinUbicacion }}</dd></div>
                </dl>
                <section>
                  <h2 class="subtitulo">{{ t.campoDescripcion }}</h2>
                  <p class="texto-largo">{{ s.descripcion || t.sinDescripcion }}</p>
                </section>
                @if (s.latitud != null && s.longitud != null) {
                  <app-mapa-selector [latitud]="s.latitud" [longitud]="s.longitud" [soloVista]="true" />
                }
                <div class="acciones">
                  @if (!sesionResuelta()) {
                    <!-- Catálogo: sin acciones hasta saber si es ADMIN. -->
                  } @else if (puedeGestionar()) {
                    <button df-button variant="danger" type="button" [loading]="ocupado()" [disabled]="ocupado()" (click)="borrar(s)">{{ te.borrar }}</button>
                  } @else if (c.anadirAMis) {
                    <button df-button variant="primary" type="button" [loading]="ocupado()" [disabled]="ocupado()" (click)="anadir(s)">{{ t[c.seccion].anadirAMis }}</button>
                  }
                </div>
              </article>
            </app-card>
          }
        }
      }
    </main>

    <app-footer />
  `,
})
export class DetalleSitioComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly config = input.required<ConfigDetalle>();

  readonly detalle = new Detalle<Sitio>(() => this.config().cargar(Number(this.route.snapshot.paramMap.get('id'))));
  readonly aviso = new Aviso();
  /** undefined mientras se consulta la sesión (solo en el catálogo). */
  readonly usuario = signal<UsuarioSesion | null | undefined>(undefined);
  readonly sesionResuelta = computed(() => !this.config().catalogo || this.usuario() !== undefined);
  readonly puedeGestionar = computed(() => !this.config().catalogo || this.usuario()?.rol === 'ADMIN');
  readonly ocupado = signal(false);
  readonly coordenadas = computed(() => {
    const s = this.detalle.item();
    return s ? coordenadasLegibles(s.latitud, s.longitud) : null;
  });
  readonly esLugar = esLugarPublico;

  ngOnInit(): void {
    if (this.config().catalogo) {
      this.authService.me().subscribe({
        next: (u: UsuarioSesion) => this.usuario.set(u),
        error: () => this.usuario.set(null),
      });
    }
    this.detalle.cargar();
  }

  borrar(sitio: Sitio): void {
    const t = this.i18n.t().lugares;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(true);
    ejecutarAccion(this.config().borrar(sitio.id), {
      aviso: this.aviso,
      error: t.errorBorrar,
      alTerminar: () => this.ocupado.set(false),
      alExito: () => this.router.navigate([this.config().rutaListado]),
    });
  }

  anadir(sitio: Sitio): void {
    const anadirAMis = this.config().anadirAMis;
    if (!anadirAMis) {
      return;
    }
    const t = this.i18n.t().lugares;
    this.ocupado.set(true);
    ejecutarAccion(anadirAMis(sitio.id), {
      aviso: this.aviso,
      exito: t.exitoAnadido,
      error: t.errorAnadir,
      alTerminar: () => this.ocupado.set(false),
    });
  }
}
