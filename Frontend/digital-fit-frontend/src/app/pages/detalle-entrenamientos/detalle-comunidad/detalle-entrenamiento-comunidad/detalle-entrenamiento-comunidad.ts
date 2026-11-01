import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EntrenamientosComunidadService } from '../../../../services/entrenamientos/entrenamiento-comunidad-service';
import { MisEntrenamientosService } from '../../../../services/entrenamientos/mis-entrenamientos-service';
import { AuthService } from '../../../../services/auth-service';
import { HeaderComponent } from '../../../../components/header/header';
import { Footer } from '../../../../components/footer/footer';

@Component({
  selector: 'app-detalle-entrenamiento-comunidad',
  imports: [HeaderComponent, Footer, RouterLink],
  templateUrl: './detalle-entrenamiento-comunidad.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-entrenamiento-comunidad.css',
})
export class DetalleEntrenamientoComunidadComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private entrenamientosComunidadService = inject(EntrenamientosComunidadService);
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  entrenamiento: any = null;
  usuarioActual: any = null;

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario: any) => {
        this.usuarioActual = usuario;
        this.cargarDetalle();
      },
      error: () => {
        this.cargarDetalle();
      },
    });
  }

  cargarDetalle(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.entrenamientosComunidadService.getEntrenamientoComunidadById(id).subscribe({
      next: (data: any) => {
        this.entrenamiento = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE ENTRENAMIENTO COMUNIDAD:', err);
        this.abrirPopup('No se pudo cargar el detalle del entrenamiento.', 'error');
      },
    });
  }

  esMio(): boolean {
    return this.usuarioActual?.username === this.entrenamiento?.usuario;
  }

  anadirAMisEntrenamientos(): void {
    if (!this.entrenamiento?.id) {
      return;
    }

    this.misEntrenamientosService.anadirDesdeComunidad(this.entrenamiento.id).subscribe({
      next: () => {
        this.abrirPopup('Entrenamiento añadido a mis entrenamientos.', 'exito');
      },
      error: (err: any) => {
        this.abrirPopup(
          this.obtenerMensajeError(err, 'No se pudo añadir a mis entrenamientos.'),
          'error',
        );
      },
    });
  }

  borrarEntrenamiento(): void {
    if (!this.entrenamiento?.id) {
      return;
    }

    this.entrenamientosComunidadService
      .borrarEntrenamientoComunidad(this.entrenamiento.id)
      .subscribe({
        next: () => {
          this.abrirPopup('Entrenamiento borrado correctamente.', 'exito');

          setTimeout(() => {
            this.router.navigate(['/entrenamientos-comunidad']);
          }, 1200);
        },
        error: () => {
          this.abrirPopup('No se pudo borrar el entrenamiento.', 'error');
        },
      });
  }

  mostrarCategoriaLegible(categoria: string): string {
    if (!categoria) {
      return 'Sin categoría';
    }

    return categoria
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letra) => letra.toUpperCase());
  }

  mostrarNivelLegible(nivel: string): string {
    if (!nivel) {
      return 'Sin nivel';
    }

    return nivel
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letra) => letra.toUpperCase());
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

  private obtenerMensajeError(err: any, mensajePorDefecto: string): string {
    if (typeof err?.error === 'string' && err.error.trim() !== '') {
      return err.error;
    }

    return mensajePorDefecto;
  }
}
