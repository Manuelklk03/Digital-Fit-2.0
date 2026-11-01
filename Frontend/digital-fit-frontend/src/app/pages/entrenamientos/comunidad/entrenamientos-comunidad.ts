import { HeaderComponent } from './../../../components/header/header';
import { Footer } from './../../../components/footer/footer';
import { AuthService } from './../../../services/auth-service';
import { EntrenamientosComunidadService } from './../../../services/entrenamientos/entrenamiento-comunidad-service';
import { MisEntrenamientosService } from './../../../services/entrenamientos/mis-entrenamientos-service';
import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-entrenamientos-comunidad',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink],
  templateUrl: './entrenamientos-comunidad.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './entrenamientos-comunidad.css',
})
export class EntrenamientosComunidadComponent {
  private entrenamientosComunidadService = inject(EntrenamientosComunidadService);
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  entrenamientos: any[] = [];
  misEntrenamientosSubidos: any[] = [];
  entrenamientosRestoComunidad: any[] = [];

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
        this.cargarEntrenamientosComunidad();
      },
      error: () => {
        this.cargarEntrenamientosComunidad();
      },
    });
  }

  cargarEntrenamientosComunidad(): void {
    this.entrenamientosComunidadService.getEntrenamientosComunidad().subscribe({
      next: (data: any[]) => {
        this.entrenamientos = data;
        this.separarEntrenamientos();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR ENTRENAMIENTOS COMUNIDAD:', err);
        this.abrirPopup('No se pudieron cargar los entrenamientos de comunidad.', 'error');
      },
    });
  }

  separarEntrenamientos(): void {
    this.misEntrenamientosSubidos = this.entrenamientos.filter((entrenamiento: any) =>
      this.esMio(entrenamiento),
    );

    this.entrenamientosRestoComunidad = this.entrenamientos.filter(
      (entrenamiento: any) => !this.esMio(entrenamiento),
    );
  }

  buscarEntrenamientos(): void {
    const texto = this.valorBusqueda.trim();

    if (!texto) {
      this.cargarEntrenamientosComunidad();
      return;
    }

    if (this.tipoBusqueda === 'categoria') {
      this.entrenamientosComunidadService
        .getEntrenamientosComunidadFiltrados(texto, undefined, undefined, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.separarEntrenamientos();
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO CATEGORIA COMUNIDAD:', err),
        });
      return;
    }

    if (this.tipoBusqueda === 'nivel') {
      this.entrenamientosComunidadService
        .getEntrenamientosComunidadFiltrados(undefined, texto, undefined, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.separarEntrenamientos();
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO NIVEL COMUNIDAD:', err),
        });
      return;
    }

    if (this.tipoBusqueda === 'duracionEnMinutos') {
      const duracion = Number(texto);

      if (isNaN(duracion)) {
        this.entrenamientos = [];
        this.separarEntrenamientos();
        return;
      }

      this.entrenamientosComunidadService
        .getEntrenamientosComunidadFiltrados(undefined, undefined, duracion, undefined)
        .subscribe({
          next: (data: any[]) => {
            this.entrenamientos = data;
            this.separarEntrenamientos();
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('ERROR FILTRO DURACION COMUNIDAD:', err),
        });
      return;
    }

    this.entrenamientosComunidadService
      .getEntrenamientosComunidadFiltrados(undefined, undefined, undefined, texto)
      .subscribe({
        next: (data: any[]) => {
          this.entrenamientos = data;
          this.separarEntrenamientos();
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO NOMBRE COMUNIDAD:', err),
      });
  }

  alCambiarBusqueda(): void {
    this.buscarEntrenamientos();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'nombre';
    this.valorBusqueda = '';
    this.cargarEntrenamientosComunidad();
  }

  esMio(entrenamiento: any): boolean {
    return this.usuarioActual?.username === entrenamiento.usuario;
  }

  guardarEntrenamiento(): void {
    const payload = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      categoria: this.categoria,
      nivel: this.nivel,
      duracionEnMinutos: this.duracionEnMinutos,
    };

    if (this.editandoId !== null) {
      this.entrenamientosComunidadService
        .actualizarEntrenamientoComunidad(this.editandoId, payload)
        .subscribe({
          next: () => {
            this.abrirPopup('Entrenamiento actualizado correctamente.', 'exito');
            this.limpiarFormulario();
            this.cargarEntrenamientosComunidad();
          },
          error: () => {
            this.abrirPopup('No se pudo actualizar el entrenamiento.', 'error');
          },
        });
    } else {
      this.entrenamientosComunidadService.crearEntrenamientoComunidad(payload).subscribe({
        next: () => {
          this.abrirPopup('Entrenamiento de comunidad creado correctamente.', 'exito');
          this.limpiarFormulario();
          this.cargarEntrenamientosComunidad();
        },
        error: () => {
          this.abrirPopup('No se pudo crear el entrenamiento de comunidad.', 'error');
        },
      });
    }
  }

  editarEntrenamiento(entrenamiento: any): void {
    this.editandoId = entrenamiento.id;
    this.nombre = entrenamiento.nombre;
    this.descripcion = entrenamiento.descripcion;
    this.categoria = entrenamiento.categoria;
    this.nivel = entrenamiento.nivel;
    this.duracionEnMinutos = entrenamiento.duracionEnMinutos;
  }

  borrarEntrenamiento(id: number): void {
    this.entrenamientosComunidadService.borrarEntrenamientoComunidad(id).subscribe({
      next: () => {
        this.abrirPopup('Entrenamiento borrado correctamente.', 'exito');
        this.cargarEntrenamientosComunidad();
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el entrenamiento.', 'error');
      },
    });
  }

  anadirAMisEntrenamientos(id: number): void {
    this.misEntrenamientosService.anadirDesdeComunidad(id).subscribe({
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
