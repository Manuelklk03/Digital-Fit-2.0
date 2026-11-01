import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { EntrenamientosService } from '../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../services/entrenamientos/mis-entrenamientos-service';
import { AdminEntrenamientosBaseService } from '../../services/admin/admin-entrenamiento-base';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-entrenamientos',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink],
  templateUrl: './entrenamientos.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './entrenamientos.css',
})
export class EntrenamientosComponent implements OnInit {
  private entrenamientosService = inject(EntrenamientosService);
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private adminEntrenamientosBaseService = inject(AdminEntrenamientosBaseService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  entrenamientos: any[] = [];
  usuarioActual: any = null;

  nombre = '';
  descripcion = '';
  categoria = 'FUERZA_TOTAL';
  nivel = 'PRINCIPIANTE';
  duracionEnMinutos = 30;

  editandoId: number | null = null;

  tipoBusqueda = 'nombre';
  valorBusqueda = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario: any) => {
        this.usuarioActual = usuario;
        this.cargarEntrenamientos();
      },
      error: () => {
        this.cargarEntrenamientos();
      },
    });
  }

  cargarEntrenamientos(): void {
    this.entrenamientosService.getEntrenamientos().subscribe({
      next: (data: any[]) => {
        this.entrenamientos = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR ENTRENAMIENTOS BASE:', err);
        this.abrirPopup('No se pudieron cargar los entrenamientos base.', 'error');
      },
    });
  }

  esAdmin(): boolean {
    return this.usuarioActual?.rol === 'ADMIN';
  }

  buscarEntrenamientos(): void {
    const texto = this.valorBusqueda.trim();

    if (!texto) {
      this.cargarEntrenamientos();
      return;
    }

    if (this.tipoBusqueda === 'categoria') {
      this.entrenamientosService
        .getEntrenamientosFiltrados(texto, undefined, undefined, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO CATEGORIA:', err),
        });
      return;
    }

    if (this.tipoBusqueda === 'nivel') {
      this.entrenamientosService
        .getEntrenamientosFiltrados(undefined, texto, undefined, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO NIVEL:', err),
        });
      return;
    }

    if (this.tipoBusqueda === 'duracionEnMinutos') {
      const duracion = Number(texto);

      if (isNaN(duracion)) {
        this.entrenamientos = [];
        return;
      }

      this.entrenamientosService
        .getEntrenamientosFiltrados(undefined, undefined, duracion, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO DURACION:', err),
        });
      return;
    }

    this.entrenamientosService
      .getEntrenamientosFiltrados(undefined, undefined, undefined, texto)
      .subscribe({
        next: (data: any[]) => {
          this.entrenamientos = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO NOMBRE:', err),
      });
  }

  alCambiarBusqueda(): void {
    this.buscarEntrenamientos();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'nombre';
    this.valorBusqueda = '';
    this.cargarEntrenamientos();
  }

  guardarEntrenamientoBase(): void {
    const payload = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      categoria: this.categoria,
      nivel: this.nivel,
      duracionEnMinutos: this.duracionEnMinutos,
    };

    if (this.editandoId !== null) {
      this.adminEntrenamientosBaseService
        .actualizarEntrenamientoBase(this.editandoId, payload)
        .subscribe({
          next: () => {
            this.abrirPopup('Entrenamiento base actualizado correctamente.', 'exito');
            this.limpiarFormulario();
            this.cargarEntrenamientos();
          },
          error: (err: any) => {
            this.abrirPopup(
              this.obtenerMensajeError(err, 'No se pudo actualizar el entrenamiento base.'),
              'error',
            );
          },
        });
    } else {
      this.adminEntrenamientosBaseService.crearEntrenamientoBase(payload).subscribe({
        next: () => {
          this.abrirPopup('Entrenamiento base creado correctamente.', 'exito');
          this.limpiarFormulario();
          this.cargarEntrenamientos();
        },
        error: (err: any) => {
          this.abrirPopup(
            this.obtenerMensajeError(err, 'No se pudo crear el entrenamiento base.'),
            'error',
          );
        },
      });
    }
  }

  editarEntrenamientoBase(entrenamiento: any): void {
    this.editandoId = entrenamiento.id;
    this.nombre = entrenamiento.nombre;
    this.descripcion = entrenamiento.descripcion;
    this.categoria = entrenamiento.categoria;
    this.nivel = entrenamiento.nivel;
    this.duracionEnMinutos = entrenamiento.duracionEnMinutos;
  }

  borrarEntrenamientoBase(id: number): void {
    this.adminEntrenamientosBaseService.borrarEntrenamientoBase(id).subscribe({
      next: () => {
        this.abrirPopup('Entrenamiento base borrado correctamente.', 'exito');
        this.cargarEntrenamientos();
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el entrenamiento base.', 'error');
      },
    });
  }

  anadirAMisEntrenamientos(id: number): void {
    this.misEntrenamientosService.anadirDesdeBase(id).subscribe({
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

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.editandoId = null;
    this.nombre = '';
    this.descripcion = '';
    this.categoria = 'FUERZA_TOTAL';
    this.nivel = 'PRINCIPIANTE';
    this.duracionEnMinutos = 30;
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
