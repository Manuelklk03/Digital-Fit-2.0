import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-inicio',
  imports: [HeaderComponent, Footer, RouterLink],
  templateUrl: './inicio.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './inicio.css',
})
export class InicioComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usuarioActual: any = null;
  cargando = true;

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario) => {
      if (usuario) {
        this.usuarioActual = usuario;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });

    this.authService
      .me()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (usuario: any) => {
          this.usuarioActual = usuario;
          this.cdr.detectChanges();
        },
        error: () => {
          this.router.navigate(['/login']);
        },
      });
  }

  esAdmin(): boolean {
    return this.usuarioActual?.rol === 'ADMIN';
  }

  esUser(): boolean {
    return this.usuarioActual?.rol === 'USER';
  }
}
