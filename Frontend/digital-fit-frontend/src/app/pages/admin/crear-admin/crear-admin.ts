import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { AuthService } from '../../../services/auth-service';
import { AdminService } from '../../../services/admin/admin-service';

@Component({
  selector: 'app-crear-admin',
  imports: [HeaderComponent, Footer, FormsModule],
  templateUrl: './crear-admin.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './crear-admin.css',
})
export class CrearAdminComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario: any) => {
        if (usuario?.rol !== 'ADMIN') {
          this.router.navigate(['/inicio']);
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  crearAdmin(): void {
    if (!this.username.trim() || !this.email.trim() || !this.password.trim()) {
      this.abrirPopup('Debes completar todos los campos.', 'error');
      return;
    }

    const nuevoAdmin = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.adminService.crearAdmin(nuevoAdmin).subscribe({
      next: (respuesta: string) => {
        this.abrirPopup(respuesta || 'Admin creado correctamente.', 'exito');
        this.username = '';
        this.email = '';
        this.password = '';
      },
      error: () => {
        this.abrirPopup('No se pudo crear el admin.', 'error');
      },
    });
  }

  abrirPopup(texto: string, tipo: 'exito' | 'error'): void {
    this.textoPopup = texto;
    this.tipoPopup = tipo;
    this.mostrarPopup = true;

    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }

    this.popupTimeout = setTimeout(() => {
      this.mostrarPopup = false;
    }, 3000);
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }
}
