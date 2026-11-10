import { Component, inject, ChangeDetectionStrategy, DestroyRef, ElementRef, HostListener, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioSesion } from '../../models/entrenamiento';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonComponent } from '../ui';
import { AuthService } from '../../services/auth-service';
import { I18nService } from '../../i18n/i18n.service';
import { Idioma } from '../../i18n/i18n.types';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.css',
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly i18n = inject(I18nService);

  usuarioActual: UsuarioSesion | null = null;
  desplegableIdiomaAbierto = false;

  ngOnInit(): void {
    this.authService.usuario$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((usuario) => {
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

  /** Cierra el menú de idiomas; con Escape devuelve el foco al botón que lo abrió. */
  cerrarDesplegableIdioma(devolverFoco = false): void {
    if (!this.desplegableIdiomaAbierto) {
      return;
    }
    this.desplegableIdiomaAbierto = false;
    if (devolverFoco) {
      this.elemento.nativeElement.querySelector<HTMLElement>('.boton-idioma')?.focus();
    }
  }

  @HostListener('keydown.escape')
  alPulsarEscape(): void {
    this.cerrarDesplegableIdioma(true);
  }

  @HostListener('document:click', ['$event'])
  cerrarAlPulsarFuera(evento: Event): void {
    if (!this.elemento.nativeElement.querySelector('.selector-idioma')?.contains(evento.target as Node)) {
      this.cerrarDesplegableIdioma();
    }
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
}
