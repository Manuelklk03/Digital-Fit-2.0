import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { PrivadosService } from '../../services/centros/privados-service';
import { MisCentrosService } from '../../services/centros/mis-centros-service';
import { AdminCentrosPrivadosBaseService } from '../../services/admin/admin-centro-base';
import { AuthService } from '../../services/auth-service';
import { MapaSelectorComponent } from '../../components/mapa-selector/mapa-selector';

@Component({
  selector: 'app-detalle-privado',
  imports: [HeaderComponent, Footer, RouterLink, MapaSelectorComponent],
  templateUrl: './detalle-privado.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-privado.css',
})
export class DetallePrivadoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private privadosService = inject(PrivadosService);
  private misCentrosService = inject(MisCentrosService);
  private adminCentrosPrivadosBaseService = inject(AdminCentrosPrivadosBaseService);
  private authService = inject(AuthService);

  centro: any = null;
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

    this.privadosService.getCentroPrivadoById(id).subscribe({
      next: (data: any) => {
        this.centro = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE CENTRO PRIVADO:', err);
        this.abrirPopup('No se pudo cargar el detalle del centro.', 'error');
      },
    });
  }

  esAdmin(): boolean {
    return this.usuarioActual?.rol === 'ADMIN';
  }

  formatearUbicacion(latitud: number, longitud: number): string {
    if (latitud == null || longitud == null) {
      return 'Sin ubicación';
    }

    return `${latitud}, ${longitud}`;
  }

  anadirAMisCentros(): void {
    if (!this.centro?.id) {
      return;
    }

    this.misCentrosService.anadirCentroDesdeApp(this.centro.id).subscribe({
      next: () => {
        this.abrirPopup('Centro añadido a mis centros.', 'exito');
      },
      error: () => {
        this.abrirPopup('No se pudo añadir a mis centros.', 'error');
      },
    });
  }

  borrarCentroBase(): void {
    if (!this.centro?.id) {
      return;
    }

    this.adminCentrosPrivadosBaseService.borrarCentroPrivadoBase(this.centro.id).subscribe({
      next: () => {
        this.abrirPopup('Centro privado base borrado correctamente.', 'exito');

        setTimeout(() => {
          this.router.navigate(['/privados']);
        }, 1200);
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el centro privado base.', 'error');
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
