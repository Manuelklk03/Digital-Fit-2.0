import { ChangeDetectionStrategy, Component, ElementRef, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AlertComponent, ButtonComponent, CardComponent, InputDirective } from '../../../components/ui';
import { I18nService } from '../../../i18n/i18n.service';
import { AdminService } from '../../../services/admin/admin-service';
import { Aviso, ejecutarAccion, enfocarTrasRender } from '../../entrenamientos/compartido/estado';
import { EncabezadoPaginaComponent } from '../../entrenamientos/compartido/encabezado-pagina';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Campo = 'username' | 'email' | 'password';

/** Alta de otra cuenta ADMIN. La ruta ya la protege `adminGuard` y el backend exige rol ADMIN en `/api/admin/**`. */
@Component({
  selector: 'app-crear-admin',
  imports: [FormsModule, HeaderComponent, Footer, AlertComponent, ButtonComponent, CardComponent, InputDirective, EncabezadoPaginaComponent],
  styleUrls: ['../../entrenamientos/compartido/pagina.css', './crear-admin.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let t = i18n.t().admin;
    @let a = i18n.t().auth;
    <app-header />

    <main class="pagina" id="contenido-principal">
      <app-encabezado-pagina [badge]="t.badge" [titulo]="t.titulo" [subtitulo]="t.subtitulo" />

      @if (aviso.actual(); as av) {
        <app-alert [tipo]="av.tipo" (cerrar)="aviso.cerrar()">{{ av.texto }}</app-alert>
      }

      <app-card class="tarjeta-form">
        <form class="formulario" (ngSubmit)="crear()" novalidate aria-labelledby="admin-titulo">
          <h2 id="admin-titulo" class="titulo-form">{{ t.formTitulo }}</h2>

          <div class="campo">
            <label for="admin-username">{{ a.usuarioLabel }}</label>
            <input df-input id="admin-username" name="username" autocomplete="off" required [(ngModel)]="username"
              [error]="errores().includes('username')" [attr.aria-invalid]="errores().includes('username')"
              [attr.aria-describedby]="errores().includes('username') ? 'admin-e-username' : null" />
            @if (errores().includes('username')) {
              <p class="error" id="admin-e-username">{{ t.errorUsuario }}</p>
            }
          </div>

          <div class="campo">
            <label for="admin-email">{{ a.emailLabel }}</label>
            <input df-input id="admin-email" name="email" type="email" autocomplete="off" required [(ngModel)]="email"
              [placeholder]="t.emailPlaceholder" [error]="errores().includes('email')"
              [attr.aria-invalid]="errores().includes('email')"
              [attr.aria-describedby]="errores().includes('email') ? 'admin-e-email' : null" />
            @if (errores().includes('email')) {
              <p class="error" id="admin-e-email">{{ a.errorEmailInvalido }}</p>
            }
          </div>

          <div class="campo">
            <label for="admin-password">{{ a.contrasenaLabel }}</label>
            <input df-input id="admin-password" name="password" type="password" autocomplete="new-password" required
              [(ngModel)]="password" [error]="errores().includes('password')"
              [attr.aria-invalid]="errores().includes('password')"
              [attr.aria-describedby]="errores().includes('password') ? 'admin-h-password admin-e-password' : 'admin-h-password'" />
            <p class="ayuda" id="admin-h-password">{{ t.ayudaContrasena }}</p>
            @if (errores().includes('password')) {
              <p class="error" id="admin-e-password">{{ a.errorContrasenaCorta }}</p>
            }
          </div>

          <button df-button variant="primary" type="submit" [loading]="guardando()" [disabled]="guardando()">
            {{ guardando() ? t.creando : t.crear }}
          </button>
        </form>
      </app-card>
    </main>

    <app-footer />
  `,
})
export class CrearAdminComponent {
  readonly i18n = inject(I18nService);
  private readonly adminService = inject(AdminService);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly aviso = new Aviso();
  readonly guardando = signal(false);
  readonly errores = signal<Campo[]>([]);

  username = '';
  email = '';
  password = '';

  crear(): void {
    const datos = { username: this.username.trim(), email: this.email.trim(), password: this.password };
    const errores: Campo[] = [];
    if (!datos.username) errores.push('username');
    if (!EMAIL_REGEX.test(datos.email)) errores.push('email');
    if (datos.password.length < 6) errores.push('password');
    this.errores.set(errores);
    if (errores.length > 0) {
      enfocarTrasRender(this.injector, '[aria-invalid="true"]', () => this.host.nativeElement);
      return;
    }

    const t = this.i18n.t().admin;
    this.guardando.set(true);
    ejecutarAccion(this.adminService.crearAdmin(datos), {
      aviso: this.aviso,
      exito: t.exito,
      error: t.error,
      alTerminar: () => this.guardando.set(false),
      alExito: () => {
        this.username = '';
        this.email = '';
        this.password = '';
      },
    });
  }
}
