import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import {
  AlertComponent,
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  InputDirective,
} from '../../components/ui';
import { AuthService } from '../../services/auth-service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink,
    HeaderComponent,
    Footer,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    InputDirective,
    AlertComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly i18n = inject(I18nService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  username = '';
  password = '';

  cargando = false;

  readonly alerta = signal<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
  private alertaTimeout: ReturnType<typeof setTimeout> | null = null;

  iniciarSesion(): void {
    const usuarioLimpio = this.username.trim();
    const passwordLimpia = this.password.trim();

    if (!usuarioLimpio || !passwordLimpia) {
      this.mostrarAlerta(this.i18n.t().auth.errorCamposObligatorios, 'error');
      return;
    }

    this.cargando = true;
    this.cerrarAlerta();

    this.authService.login(usuarioLimpio, passwordLimpia).subscribe({
      next: () => {
        this.authService.me().subscribe({
          next: () => {
            this.mostrarAlerta(this.i18n.t().auth.exitoLogin, 'exito');
            this.cargando = false;
            this.cdr.markForCheck();

            setTimeout(() => {
              this.router.navigate(['/inicio']);
            }, 600);
          },
          error: () => {
            this.cargando = false;
            this.mostrarAlerta(this.i18n.t().auth.errorSesion, 'error');
            this.cdr.markForCheck();
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        // Solo el 401 es una clave incorrecta. El 429 es el límite de intentos del backend (la clave puede ser correcta);
        // el resto (sin conexión, 403 de CSRF, 5xx) no dice nada de las credenciales.
        const a = this.i18n.t().auth;
        const texto =
          err.status === 401
            ? a.errorCredenciales
            : err.status === 429
              ? a.errorDemasiadosIntentos
              : a.errorInesperado;
        this.mostrarAlerta(texto, 'error');
        this.cdr.markForCheck();
      },
    });
  }

  cargarCredencialesDemo(tipo: 'user' | 'admin'): void {
    const credenciales = {
      user: { u: 'usuario1', p: atob('VXN1YXJpbzEyMyE=') },
      admin: { u: 'admin1', p: atob('QWRtaW4xMjMh') },
    };
    const c = credenciales[tipo];
    this.username = c.u;
    this.password = c.p;
    this.cerrarAlerta();
    this.cdr.markForCheck();
  }

  mostrarAlerta(texto: string, tipo: 'exito' | 'error'): void {
    this.alerta.set({ texto, tipo });
    this.cdr.markForCheck();

    if (this.alertaTimeout) {
      clearTimeout(this.alertaTimeout);
    }

    this.alertaTimeout = setTimeout(() => {
      this.alerta.set(null);
      this.cdr.markForCheck();
    }, 4500);
  }

  cerrarAlerta(): void {
    if (this.alertaTimeout) {
      clearTimeout(this.alertaTimeout);
      this.alertaTimeout = null;
    }
    this.alerta.set(null);
    this.cdr.markForCheck();
  }
}
