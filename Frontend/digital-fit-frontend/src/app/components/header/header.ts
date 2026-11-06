import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { I18nService } from '../../i18n/i18n.service';
import { Idioma } from '../../i18n/i18n.types';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly i18n = inject(I18nService);

  usuarioActual: any = null;
  desplegableIdiomaAbierto = false;

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario) => {
      this.usuarioActual = usuario;
    });

    this.authService.me().subscribe({
      next: (usuario) => {
        this.usuarioActual = usuario;
      },
      error: () => {
        this.usuarioActual = null;
      },
    });
  }

  alternarDesplegableIdioma(): void {
    this.desplegableIdiomaAbierto = !this.desplegableIdiomaAbierto;
  }

  seleccionarIdioma(idioma: Idioma): void {
    this.i18n.cambiarIdioma(idioma);
    this.desplegableIdiomaAbierto = false;
  }

  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  esAdmin(): boolean {
    return this.usuarioActual?.rol === 'ADMIN';
  }

  iconoUsuario(): string {
    return this.esAdmin() ? '🛡️' : '👤';
  }
}
