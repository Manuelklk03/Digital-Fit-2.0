import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, HeaderComponent, Footer],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './register.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  username = '';
  email = '';
  password = '';

  cargando = false;

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  registrar(): void {
    if (!this.username.trim() || !this.email.trim() || !this.password.trim()) {
      this.abrirPopup('Debes completar todos los campos.', 'error');
      return;
    }

    const nuevoUsuario = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.cargando = true;

    this.authService.registrar(nuevoUsuario).subscribe({
      next: () => {
        this.abrirPopup('Usuario registrado correctamente.', 'exito');
        this.cargando = false;

        this.username = '';
        this.email = '';
        this.password = '';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: () => {
        this.cargando = false;
        this.abrirPopup('No se pudo registrar el usuario.', 'error');
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
