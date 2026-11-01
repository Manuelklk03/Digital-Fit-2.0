import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { EstadisticasService } from '../../services/estadisticas/estadisticas-service';

@Component({
  selector: 'app-estadisticas',
  imports: [HeaderComponent, Footer],
  templateUrl: './estadisticas.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './estadisticas.css',
})
export class EstadisticasComponent {
  private estadisticasService = inject(EstadisticasService);
  private cdr = inject(ChangeDetectorRef);

  estadisticas: any = null;

  cargando = true;
  mensajeError = '';

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.estadisticasService.getEstadisticas().subscribe({
      next: (data: any) => {
        this.estadisticas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR ESTADISTICAS:', err);
        this.mensajeError = 'No se pudieron cargar las estadísticas.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  formatearPromedio(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || isNaN(valor)) {
      return '0 min';
    }

    return `${valor.toFixed(1)} min`;
  }

  mostrarTexto(valor: string | null | undefined): string {
    if (!valor || !valor.trim() || valor === 'N/A') {
      return 'Todavía no disponible';
    }

    return valor;
  }
}
