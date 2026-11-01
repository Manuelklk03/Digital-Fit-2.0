import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.css',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuarioActual: any = null;

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
