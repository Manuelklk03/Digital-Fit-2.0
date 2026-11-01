import { MisEntrenamientosService } from './../../../services/entrenamientos/mis-entrenamientos-service';
import { Footer } from './../../../components/footer/footer';
import { HeaderComponent } from './../../../components/header/header';
import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-entrenamientos',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink],
  templateUrl: './mis-entrenamientos.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mis-entrenamientos.css',
})
export class MisEntrenamientosComponent {
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private cdr = inject(ChangeDetectorRef);

  entrenamientos: any[] = [];

  nombre = '';
  descripcion = '';
  categoria = 'FUERZA_TOTAL';
  nivel = 'PRINCIPIANTE';
  duracionEnMinutos = 30;

  tipoBusqueda = 'nombre';
  valorBusqueda = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.cargarMisEntrenamientos();
  }

  cargarMisEntrenamientos(): void {
    this.misEntrenamientosService.getMisEntrenamientos().subscribe({
      next: (data: any[]) => {
        this.entrenamientos = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR MIS ENTRENAMIENTOS:', err);
        this.abrirPopup('No se pudieron cargar tus entrenamientos.', 'error');
      },
    });
  }

  buscarEntrenamientos(): void {
    const texto = this.valorBusqueda.trim();

    if (!texto) {
      this.cargarMisEntrenamientos();
      return;
    }

    if (this.tipoBusqueda === 'categoria') {
      this.misEntrenamientosService
        .getMisEntrenamientosFiltrados(texto, undefined, undefined, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO CATEGORIA MIS ENTRENAMIENTOS:', err),
        });
      return;
    }

    if (this.tipoBusqueda === 'nivel') {
      this.misEntrenamientosService
        .getMisEntrenamientosFiltrados(undefined, texto, undefined, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO NIVEL MIS ENTRENAMIENTOS:', err),
        });
      return;
    }

    if (this.tipoBusqueda === 'duracionEnMinutos') {
      const duracion = Number(texto);

      if (isNaN(duracion)) {
        this.entrenamientos = [];
        return;
      }

      this.misEntrenamientosService
        .getMisEntrenamientosFiltrados(undefined, undefined, duracion, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO DURACION MIS ENTRENAMIENTOS:', err),
        });
      return;
    }

    this.misEntrenamientosService
      .getMisEntrenamientosFiltrados(undefined, undefined, undefined, texto)
      .subscribe({
        next: (data: any[]) => {
          this.entrenamientos = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO NOMBRE MIS ENTRENAMIENTOS:', err),
      });
  }

  alCambiarBusqueda(): void {
    this.buscarEntrenamientos();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'nombre';
    this.valorBusqueda = '';
    this.cargarMisEntrenamientos();
  }

  crearEntrenamiento(): void {
    const nuevoEntrenamiento = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      categoria: this.categoria,
      nivel: this.nivel,
      duracionEnMinutos: this.duracionEnMinutos,
    };

    this.misEntrenamientosService.crearEntrenamiento(nuevoEntrenamiento).subscribe({
      next: () => {
        this.abrirPopup('Entrenamiento creado correctamente.', 'exito');
        this.nombre = '';
        this.descripcion = '';
        this.categoria = 'FUERZA_TOTAL';
        this.nivel = 'PRINCIPIANTE';
        this.duracionEnMinutos = 30;
        this.cargarMisEntrenamientos();
      },
      error: () => {
        this.abrirPopup('No se pudo crear el entrenamiento.', 'error');
      },
    });
  }

  borrarEntrenamiento(id: number): void {
    this.misEntrenamientosService.borrarEntrenamiento(id).subscribe({
      next: () => {
        this.abrirPopup('Entrenamiento borrado correctamente.', 'exito');
        this.cargarMisEntrenamientos();
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
}
