import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { PublicosService } from '../../../services/publicos/publicos-service';
import { MisLugaresService } from '../../../services/publicos/mis-lugares';
import { AdminLugaresPublicosBaseService } from '../../../services/admin/admin-lugarespublicos-base';
import { AuthService } from '../../../services/auth-service';
import { MapaSelectorComponent } from '../../../components/mapa-selector/mapa-selector';

@Component({
  selector: 'app-detalle-publico',
  imports: [HeaderComponent, Footer, RouterLink, MapaSelectorComponent],
  templateUrl: './detalle-publico.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-publico.css',
})
export class DetallePublicoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private publicosService = inject(PublicosService);
  private misLugaresService = inject(MisLugaresService);
  private adminLugaresPublicosBaseService = inject(AdminLugaresPublicosBaseService);
  private authService = inject(AuthService);

  lugar: any = null;
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

    this.publicosService.getLugarPublicoById(id).subscribe({
      next: (data: any) => {
        this.lugar = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE LUGAR PUBLICO:', err);
        this.abrirPopup('No se pudo cargar el detalle del lugar.', 'error');
      },
    });
  }

  esAdmin(): boolean {
    return this.usuarioActual?.rol === 'ADMIN';
  }

  mostrarTipoLegible(tipo: string): string {
    if (!tipo) {
      return 'Sin tipo';
    }

    return tipo
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letra) => letra.toUpperCase());
  }

  formatearUbicacion(latitud: number, longitud: number): string {
    if (latitud == null || longitud == null) {
      return 'Sin ubicación';
    }

    return `${latitud}, ${longitud}`;
  }

  anadirAMisLugares(): void {
    if (!this.lugar?.id) {
      return;
    }

    this.misLugaresService.anadirLugarDesdeBase(this.lugar.id).subscribe({
      next: () => {
        this.abrirPopup('Lugar añadido a mis lugares.', 'exito');
      },
      error: () => {
        this.abrirPopup('No se pudo añadir a mis lugares.', 'error');
      },
    });
  }

  borrarLugarBase(): void {
    if (!this.lugar?.id) {
      return;
    }

    this.adminLugaresPublicosBaseService.borrarLugarPublicoBase(this.lugar.id).subscribe({
      next: () => {
        this.abrirPopup('Lugar público base borrado correctamente.', 'exito');

        setTimeout(() => {
          this.router.navigate(['/publicos']);
        }, 1200);
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el lugar público base.', 'error');
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
