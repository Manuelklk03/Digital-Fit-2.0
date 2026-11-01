import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { EntrenamientosService } from '../../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { AdminEntrenamientosBaseService } from '../../../services/admin/admin-entrenamiento-base';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-detalle-entrenamiento-base',
  imports: [HeaderComponent, Footer, RouterLink],
  templateUrl: './detalle-entrenamiento-base.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-entrenamiento-base.css',
})
export class DetalleEntrenamientoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private entrenamientosService = inject(EntrenamientosService);
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private adminEntrenamientosBaseService = inject(AdminEntrenamientosBaseService);
  private authService = inject(AuthService);

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
        this.router.navigate(['/login']);
      },
    });
  }

  cargarDetalle(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.entrenamientosService.getEntrenamientoById(id).subscribe({
      next: (data: any) => {
        this.entrenamiento = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE ENTRENAMIENTO BASE:', err);
        this.abrirPopup('No se pudo cargar el detalle del entrenamiento.', 'error');
      },
    });
  }

  esAdmin(): boolean {
    return this.usuarioActual?.rol === 'ADMIN';
  }

  anadirAMisEntrenamientos(): void {
    if (!this.entrenamiento?.id) {
      return;
    }

    this.misEntrenamientosService.anadirDesdeBase(this.entrenamiento.id).subscribe({
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

  borrarEntrenamientoBase(): void {
    if (!this.entrenamiento?.id) {
      return;
    }

    this.adminEntrenamientosBaseService.borrarEntrenamientoBase(this.entrenamiento.id).subscribe({
      next: () => {
        this.abrirPopup('Entrenamiento base borrado correctamente.', 'exito');

        setTimeout(() => {
          this.router.navigate(['/entrenamientos']);
        }, 1200);
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el entrenamiento base.', 'error');
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
