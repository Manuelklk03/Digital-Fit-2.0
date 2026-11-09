import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AlertComponent, ButtonComponent } from '../../components/ui';
import { I18nService } from '../../i18n/i18n.service';
import { UsuarioSesion } from '../../models/entrenamiento';
import { FiltroSitio, Sitio, SitioForm } from '../../models/lugar';
import { AuthService } from '../../services/auth-service';
import { Aviso, ejecutarAccion, enfocarTrasRender, ListadoPaginado } from '../entrenamientos/compartido/estado';
import { EncabezadoPaginaComponent } from '../entrenamientos/compartido/encabezado-pagina';
import { EstadoListadoComponent } from '../entrenamientos/compartido/estado-listado';
import { ConfigListado } from './config';
import { FiltroSitiosComponent } from './filtro-sitios';
import { FormularioSitioComponent } from './formulario-sitio';
import { TarjetaSitioComponent } from './tarjeta-sitio';

/** Listado paginado de centros o lugares (catálogo base o propios); lo que cambia llega en `config`. */
@Component({
  selector: 'app-listado-sitios',
  imports: [
    RouterLink,
    HeaderComponent,
    Footer,
    AlertComponent,
    ButtonComponent,
    EncabezadoPaginaComponent,
    EstadoListadoComponent,
    FiltroSitiosComponent,
    FormularioSitioComponent,
    TarjetaSitioComponent,
  ],
  styleUrl: '../entrenamientos/compartido/pagina.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = config();
    @let t = i18n.t().lugares;
    @let te = i18n.t().entrenamientos;
    @let s = t[c.seccion];
    <app-header />

    <main class="pagina" id="contenido-principal">
      <app-encabezado-pagina [badge]="s.badge" [titulo]="s.titulo" [subtitulo]="s.subtitulo">
        @if (sesionResuelta() && puedeGestionar() && enEdicion() === undefined) {
          <button id="boton-nuevo" df-button variant="primary" type="button" (click)="enEdicion.set(null)">{{ s.formCrear }}</button>
        }
      </app-encabezado-pagina>

      @if (aviso.actual(); as a) {
        <app-alert [tipo]="a.tipo" (cerrar)="aviso.cerrar()">{{ a.texto }}</app-alert>
      }

      @if (puedeGestionar() && enEdicion() !== undefined) {
        <app-formulario-sitio
          [clase]="c.clase"
          [titulo]="enEdicion() ? s.formEditar : s.formCrear"
          [textoEnviar]="enEdicion() ? te.guardarCambios : t.guardar"
          [inicial]="enEdicion() ?? null"
          [guardando]="guardando()"
          [autocompletar]="c.autocompletar ?? null"
          (guardar)="guardar($event)"
          (cancelar)="cerrarFormulario()" />
      }

      <section class="listado" aria-labelledby="titulo-listado">
        <h2 id="titulo-listado" class="sr-only">{{ s.titulo }}</h2>
        <div class="listado-cabecera">
          <app-filtro-sitios [clase]="c.clase" (filtrar)="filtrar($event)" />
          <p class="total" aria-live="polite">
            @if (listado.pagina(); as p) {
              {{ te.total }}: <strong>{{ p.totalElements }}</strong>
            }
          </p>
        </div>

        <app-estado-listado [listado]="listado" [vacio]="hayFiltro() ? t.vacioFiltro : s.vacio">
          @if (c.rutaCatalogo && !hayFiltro()) {
            <a vacio df-button variant="outline" size="sm" [routerLink]="c.rutaCatalogo">{{ s.irCatalogo }}</a>
          }
          <div class="rejilla" [attr.aria-busy]="listado.recargando()">
            @for (sitio of listado.items(); track sitio.id) {
              <app-tarjeta-sitio [sitio]="sitio" [ruta]="[c.rutaDetalle, sitio.id]">
                @if (!sesionResuelta()) {
                  <!-- Catálogo: sin acciones hasta saber si es ADMIN, para no mostrar un botón que luego cambia. -->
                } @else if (puedeGestionar()) {
                  @if (c.actualizar) {
                    <button df-button variant="outline" size="sm" type="button" [disabled]="guardando()" (click)="enEdicion.set(sitio)">{{ te.editar }}</button>
                  }
                  <button df-button variant="danger" size="sm" type="button"
                    [loading]="ocupado() === sitio.id" [disabled]="ocupado() === sitio.id || enEdicion()?.id === sitio.id" (click)="borrar(sitio)">{{ te.borrar }}</button>
                } @else if (c.anadirAMis) {
                  <button df-button variant="secondary" size="sm" type="button"
                    [loading]="ocupado() === sitio.id" [disabled]="ocupado() === sitio.id" (click)="anadir(sitio)">{{ s.anadirAMis }}</button>
                }
              </app-tarjeta-sitio>
            }
          </div>
        </app-estado-listado>
      </section>
    </main>

    <app-footer />
  `,
})
export class ListadoSitiosComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly authService = inject(AuthService);

  readonly config = input.required<ConfigListado>();

  private filtro: FiltroSitio | null = null;
  readonly listado = new ListadoPaginado<Sitio>((page) => this.config().buscar(this.filtro, page));
  readonly aviso = new Aviso();
  /** undefined mientras se consulta la sesión (solo en el catálogo). */
  readonly usuario = signal<UsuarioSesion | null | undefined>(undefined);
  readonly sesionResuelta = computed(() => !this.config().catalogo || this.usuario() !== undefined);
  /** En el catálogo base solo gestiona un ADMIN; en la lista propia, el usuario. */
  readonly puedeGestionar = computed(() => !this.config().catalogo || this.usuario()?.rol === 'ADMIN');
  readonly hayFiltro = signal(false);
  /** `undefined`: formulario cerrado; `null`: crear; sitio: editar. */
  readonly enEdicion = signal<Sitio | null | undefined>(undefined);
  readonly guardando = signal(false);
  readonly ocupado = signal<number | null>(null);

  ngOnInit(): void {
    if (this.config().catalogo) {
      this.authService.me().subscribe({
        next: (u: UsuarioSesion) => this.usuario.set(u),
        error: () => this.usuario.set(null),
      });
    }
    this.listado.cargar();
  }

  cerrarFormulario(): void {
    this.enEdicion.set(undefined);
    enfocarTrasRender(this.injector, '#boton-nuevo');
  }

  filtrar(filtro: FiltroSitio | null): void {
    this.filtro = filtro;
    this.hayFiltro.set(filtro !== null);
    this.listado.cargar(0);
  }

  guardar(datos: SitioForm): void {
    const t = this.i18n.t().lugares;
    const c = this.config();
    const editando = this.enEdicion();
    const peticion = editando && c.actualizar ? c.actualizar(editando.id, datos) : c.crear(datos);
    this.guardando.set(true);
    ejecutarAccion(peticion, {
      aviso: this.aviso,
      exito: editando ? t.exitoActualizado : t.exitoCreado,
      error: t.errorGuardar,
      alTerminar: () => this.guardando.set(false),
      alExito: () => {
        this.cerrarFormulario();
        if (editando) {
          this.listado.recargar();
        } else {
          this.listado.cargar(0);
        }
      },
    });
  }

  borrar(sitio: Sitio): void {
    const t = this.i18n.t().lugares;
    if (!confirm(t.confirmarBorrado)) {
      return;
    }
    this.ocupado.set(sitio.id);
    ejecutarAccion(this.config().borrar(sitio.id), {
      aviso: this.aviso,
      exito: t.exitoBorrado,
      error: t.errorBorrar,
      alTerminar: () => this.ocupado.set(null),
      alExito: () => this.listado.recargar(),
    });
  }

  anadir(sitio: Sitio): void {
    const anadirAMis = this.config().anadirAMis;
    if (!anadirAMis) {
      return;
    }
    const t = this.i18n.t().lugares;
    this.ocupado.set(sitio.id);
    ejecutarAccion(anadirAMis(sitio.id), {
      aviso: this.aviso,
      exito: t.exitoAnadido,
      error: t.errorAnadir,
      alTerminar: () => this.ocupado.set(null),
    });
  }
}
