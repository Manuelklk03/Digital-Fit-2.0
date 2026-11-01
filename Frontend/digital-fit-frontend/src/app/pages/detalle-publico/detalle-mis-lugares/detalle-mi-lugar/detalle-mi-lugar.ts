import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header';
import { Footer } from '../../../../components/footer/footer';
import { MisLugaresService } from '../../../../services/publicos/mis-lugares';
import { MapaSelectorComponent } from '../../../../components/mapa-selector/mapa-selector';

@Component({
  selector: 'app-detalle-mi-lugar',
  imports: [HeaderComponent, Footer, RouterLink, MapaSelectorComponent],
  templateUrl: './detalle-mi-lugar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-mi-lugar.css',
})
export class DetalleMiLugarComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private misLugaresService = inject(MisLugaresService);
  private cdr = inject(ChangeDetectorRef);

  lugar: any = null;

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.misLugaresService.getMiLugarById(id).subscribe({
      next: (data: any) => {
        this.lugar = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE MI LUGAR:', err);
        this.abrirPopup('No se pudo cargar el detalle del lugar.', 'error');
      },
    });
  }

  borrarLugar(): void {
    if (!this.lugar?.id) {
      return;
    }

    this.misLugaresService.borrarLugar(this.lugar.id).subscribe({
      next: () => {
        this.abrirPopup('Lugar borrado correctamente.', 'exito');

        setTimeout(() => {
          this.router.navigate(['/mis-lugares']);
        }, 1200);
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el lugar.', 'error');
      },
    });
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
