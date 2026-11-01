import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, HeaderComponent, Footer],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  username = '';
  password = '';

  cargando = false;

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  iniciarSesion(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.abrirPopup('Debes completar todos los campos.', 'error');
      return;
    }

    this.cargando = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.authService.me().subscribe({
          next: () => {
            this.abrirPopup('Sesión iniciada correctamente.', 'exito');
            this.cargando = false;
            this.cdr.detectChanges();

            setTimeout(() => {
              this.router.navigate(['/inicio']);
            }, 700);
          },
          error: () => {
            this.cargando = false;
            this.abrirPopup('Error al recuperar la sesión.', 'error');
          },
        });
      },
      error: () => {
        this.cargando = false;
        this.abrirPopup('Usuario o contraseña incorrectos.', 'error');
      },
    });
  }

  abrirPopup(texto: string, tipo: 'exito' | 'error'): void {
    this.textoPopup = texto;
    this.tipoPopup = tipo;
    this.mostrarPopup = true;
    this.cdr.detectChanges();

    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }

    this.popupTimeout = setTimeout(() => {
      this.mostrarPopup = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
    this.cdr.detectChanges();
  }
}
