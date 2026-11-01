import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { HistorialEntrenamientosService } from '../../../services/entrenamientos/historial-entrenamientos';

@Component({
  selector: 'app-detalle-historial-entrenamiento',
  imports: [HeaderComponent, Footer, RouterLink],
  templateUrl: './detalle-historial.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-historial.css',
})
export class DetalleHistorialEntrenamientoComponent {
  private route = inject(ActivatedRoute);
  private historialService = inject(HistorialEntrenamientosService);
  private cdr = inject(ChangeDetectorRef);

  registro: any = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.historialService.getHistorialById(id).subscribe({
      next: (data: any) => {
        this.registro = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE HISTORIAL:', err);
      },
    });
  }

  mostrarTipoEntrenamiento(tipo: string): string {
    switch (tipo) {
      case 'ENTRENAMIENTO_BASE':
        return 'Entrenamiento base';
      case 'MI_ENTRENAMIENTO':
      case 'ENTRENAMIENTO_USUARIO':
        return 'Mi entrenamiento';
      default:
        return 'No indicado';
    }
  }

  mostrarTipoUbicacion(tipo: string): string {
    switch (tipo) {
      case 'LUGAR_PUBLICO_BASE':
        return 'Lugar público base';
      case 'MI_LUGAR_PUBLICO':
      case 'LUGAR_PUBLICO_USUARIO':
        return 'Mi lugar público';
      case 'CENTRO_PRIVADO_BASE':
        return 'Centro privado base';
      case 'MI_CENTRO_PRIVADO':
      case 'CENTRO_PRIVADO_USUARIO':
        return 'Mi centro privado';
      default:
        return 'Sin ubicación';
    }
  }
}
