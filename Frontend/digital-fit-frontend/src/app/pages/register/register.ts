import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  InputDirective,
} from '../../components/ui';
import { AuthService } from '../../services/auth-service';
import { I18nService } from '../../i18n/i18n.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    RouterLink,
    HeaderComponent,
    Footer,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    InputDirective,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly i18n = inject(I18nService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  username = '';
  email = '';
  password = '';

  cargando = false;

  mensajeAlerta: string | null = null;
  tipoAlerta: 'exito' | 'error' = 'exito';
  private alertaTimeout: ReturnType<typeof setTimeout> | null = null;

  registrar(): void {
    const usuarioLimpio = this.username.trim();
    const emailLimpio = this.email.trim();
    const passwordLimpia = this.password.trim();

    if (!usuarioLimpio || !emailLimpio || !passwordLimpia) {
      this.mostrarAlerta(this.i18n.t().auth.errorCamposObligatorios, 'error');
      return;
    }

    if (!EMAIL_REGEX.test(emailLimpio)) {
      this.mostrarAlerta(this.i18n.t().auth.errorEmailInvalido, 'error');
      return;
    }

    if (passwordLimpia.length < 6) {
      this.mostrarAlerta(this.i18n.t().auth.errorPasswordCorta, 'error');
      return;
    }

    const nuevoUsuario = {
      username: usuarioLimpio,
      email: emailLimpio,
      password: passwordLimpia,
    };

    this.cargando = true;
    this.cerrarAlerta();

    this.authService.registrar(nuevoUsuario).subscribe({
      next: () => {
        this.mostrarAlerta(this.i18n.t().auth.exitoRegistro, 'exito');
        this.cargando = false;

        this.username = '';
        this.email = '';
        this.password = '';
        this.cdr.markForCheck();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 800);
      },
      error: () => {
        this.cargando = false;
        this.mostrarAlerta(this.i18n.t().auth.errorRegistro, 'error');
        this.cdr.markForCheck();
      },
    });
  }

  mostrarAlerta(texto: string, tipo: 'exito' | 'error'): void {
    this.mensajeAlerta = texto;
    this.tipoAlerta = tipo;
    this.cdr.markForCheck();

    if (this.alertaTimeout) {
      clearTimeout(this.alertaTimeout);
    }

    this.alertaTimeout = setTimeout(() => {
      this.mensajeAlerta = null;
      this.cdr.markForCheck();
    }, 4500);
  }

  cerrarAlerta(): void {
    if (this.alertaTimeout) {
      clearTimeout(this.alertaTimeout);
      this.alertaTimeout = null;
    }
    this.mensajeAlerta = null;
    this.cdr.markForCheck();
  }
}
