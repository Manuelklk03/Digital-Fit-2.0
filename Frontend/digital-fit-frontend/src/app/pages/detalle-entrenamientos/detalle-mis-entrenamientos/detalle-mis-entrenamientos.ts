import { HeaderComponent } from './../../../components/header/header';
import { Footer } from './../../../components/footer/footer';
import { MisEntrenamientosService } from './../../../services/entrenamientos/mis-entrenamientos-service';
import { HistorialEntrenamientosService } from './../../../services/entrenamientos/historial-entrenamientos';
import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-detalle-mi-entrenamiento',
  imports: [HeaderComponent, Footer, RouterLink],
  templateUrl: './detalle-mis-entrenamientos.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-mis-entrenamientos.css',
})
export class DetalleMiEntrenamientoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private historialEntrenamientosService = inject(HistorialEntrenamientosService);
  private cdr = inject(ChangeDetectorRef);

  entrenamiento: any = null;
  guardandoHistorial = false;

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.misEntrenamientosService.getMiEntrenamientoById(id).subscribe({
      next: (data: any) => {
        this.entrenamiento = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE MI ENTRENAMIENTO:', err);
        this.abrirPopup('No se pudo cargar el detalle del entrenamiento.', 'error');
      },
    });
  }

  marcarComoRealizado(): void {
    if (!this.entrenamiento?.id || this.guardandoHistorial) {
      return;
    }

    this.guardandoHistorial = true;

    const payload = {
      entrenamientoBaseId: null,
      entrenamientoUsuarioId: this.entrenamiento.id,
      lugarPublicoBaseId: null,
      lugarPublicoUsuarioId: null,
      centroPrivadoBaseId: null,
      centroPrivadoUsuarioId: null,
      fecha: this.obtenerFechaActualParaBackend(),
      duracionEnMinutos: this.entrenamiento.duracionEnMinutos ?? 0,
      notas: 'Entrenamiento realizado desde el detalle de "Mis entrenamientos".',
    };

    this.historialEntrenamientosService.crearRegistro(payload).subscribe({
      next: () => {
        this.guardandoHistorial = false;
        this.abrirPopup('Entrenamiento marcado como realizado y añadido al historial.', 'exito');
      },
      error: (err: any) => {
        console.error('ERROR CREAR HISTORIAL DESDE DETALLE:', err);
        this.guardandoHistorial = false;
        this.abrirPopup('No se pudo registrar el entrenamiento en el historial.', 'error');
      },
    });
  }

  borrarEntrenamiento(): void {
    if (!this.entrenamiento?.id) {
      return;
    }

    this.misEntrenamientosService.borrarEntrenamiento(this.entrenamiento.id).subscribe({
      next: () => {
        this.abrirPopup('Entrenamiento borrado correctamente.', 'exito');

        setTimeout(() => {
          this.router.navigate(['/mis-entrenamientos']);
        }, 1200);
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el entrenamiento.', 'error');
      },
    });
  }

  obtenerFechaActualParaBackend(): string {
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
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
}
