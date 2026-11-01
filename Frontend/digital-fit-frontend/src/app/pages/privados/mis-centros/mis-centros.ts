import { MisCentrosService } from './../../../services/centros/mis-centros-service';
import { Footer } from './../../../components/footer/footer';
import { HeaderComponent } from './../../../components/header/header';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MapaSelectorComponent } from '../../../components/mapa-selector/mapa-selector';

@Component({
  selector: 'app-mis-centros',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink, MapaSelectorComponent],
  templateUrl: './mis-centros.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mis-centros.css',
})
export class MisCentrosComponent implements OnDestroy {
  private misCentrosService = inject(MisCentrosService);
  private cdr = inject(ChangeDetectorRef);

  centros: any[] = [];

  nombre = '';
  direccion = '';
  telefono = '';
  horario = '';
  precioMensual: number | null = null;
  descripcion = '';
  latitud = 39.4699;
  longitud = -0.3763;

  tipoBusqueda = 'nombre';
  valorBusqueda = '';

  mostrarFormularioMapa = false;

  autocompletando = false;
  textoAutocompletado =
    'Selecciona una ubicación en el mapa para rellenar los datos automáticamente.';
  private autocompletadoTimeout: any;

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.cargarMisCentros();
  }

  ngOnDestroy(): void {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }

    if (this.autocompletadoTimeout) {
      clearTimeout(this.autocompletadoTimeout);
    }
  }

  cargarMisCentros(): void {
    this.misCentrosService.getMisCentros().subscribe({
      next: (data: any[]) => {
        this.centros = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR MIS CENTROS:', err);
        this.abrirPopup('No se pudieron cargar tus centros.', 'error');
      },
    });
  }

  buscarCentros(): void {
    const texto = this.valorBusqueda.trim();

    if (!texto) {
      this.cargarMisCentros();
      return;
    }

    if (this.tipoBusqueda === 'direccion') {
      this.misCentrosService.getMisCentrosFiltrados(undefined, texto, undefined).subscribe({
        next: (data: any[]) => {
          this.centros = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO DIRECCION MIS CENTROS:', err),
      });
      return;
    }

    if (this.tipoBusqueda === 'precioMensual') {
      const precio = Number(texto);

      if (isNaN(precio)) {
        this.centros = [];
        return;
      }

      this.misCentrosService.getMisCentrosFiltrados(undefined, undefined, precio).subscribe({
        next: (data: any[]) => {
          this.centros = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO PRECIO MIS CENTROS:', err),
      });
      return;
    }

    this.misCentrosService.getMisCentrosFiltrados(texto, undefined, undefined).subscribe({
      next: (data: any[]) => {
        this.centros = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR FILTRO NOMBRE MIS CENTROS:', err),
    });
  }

  alCambiarBusqueda(): void {
    this.buscarCentros();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'nombre';
    this.valorBusqueda = '';
    this.cargarMisCentros();
  }

  abrirFormularioMapa(): void {
    this.nombre = '';
    this.direccion = '';
    this.telefono = '';
    this.horario = '';
    this.precioMensual = null;
    this.descripcion = '';
    this.latitud = 39.4699;
    this.longitud = -0.3763;
    this.autocompletando = false;
    this.textoAutocompletado =
      'Selecciona una ubicación en el mapa para rellenar los datos automáticamente.';
    this.mostrarFormularioMapa = true;
  }

  private limpiarCamposAutocompletables(): void {
    this.direccion = '';
    this.telefono = '';
    this.horario = '';
    this.precioMensual = null;
    this.descripcion = '';
  }

  actualizarUbicacion(evento: { latitud: number; longitud: number }): void {
    this.latitud = evento.latitud;
    this.longitud = evento.longitud;

    this.limpiarCamposAutocompletables();

    this.textoAutocompletado = 'Ubicación actualizada. Buscando datos automáticos...';
    this.autocompletando = true;
    this.cdr.detectChanges();

    if (this.autocompletadoTimeout) {
      clearTimeout(this.autocompletadoTimeout);
    }

    this.autocompletadoTimeout = setTimeout(() => {
      this.autocompletarDatosDesdeUbicacion();
    }, 1200);
  }

  autocompletarDatosDesdeUbicacion(): void {
    this.autocompletando = true;
    this.cdr.detectChanges();

    this.misCentrosService.autocompletarDatosCentro(this.latitud, this.longitud).subscribe({
      next: (data: any) => {
        this.direccion = data?.direccion ?? '';
        this.telefono = data?.telefono ?? '';
        this.horario = data?.horario ?? '';
        this.precioMensual = data?.precioMensual ?? null;
        this.descripcion = data?.descripcion ?? '';

        this.latitud = data?.latitud ?? this.latitud;
        this.longitud = data?.longitud ?? this.longitud;

        this.autocompletando = false;
        this.textoAutocompletado = data?.datosEncontrados
          ? 'Datos rellenados automáticamente. Solo te queda escribir el nombre y revisar el resto.'
          : 'No se encontraron datos suficientes para esa ubicación. Puedes completar los campos manualmente.';

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR AUTOCOMPLETADO CENTRO:', err);

        this.limpiarCamposAutocompletables();

        this.autocompletando = false;
        this.textoAutocompletado =
          'No se pudo autocompletar la ubicación. Puedes completar los campos manualmente.';
        this.cdr.detectChanges();
      },
    });
  }

  guardarCentroDesdeMapa(): void {
    const payload = {
      nombre: this.nombre,
      direccion: this.direccion,
      telefono: this.telefono,
      horario: this.horario,
      precioMensual: this.precioMensual,
      descripcion: this.descripcion,
      latitud: this.latitud,
      longitud: this.longitud,
    };

    this.misCentrosService.crearCentroDesdeMaps(payload).subscribe({
      next: () => {
        this.abrirPopup('Centro guardado correctamente.', 'exito');
        this.mostrarFormularioMapa = false;
        this.cargarMisCentros();
      },
      error: () => {
        this.abrirPopup('No se pudo guardar el centro.', 'error');
      },
    });
  }

  cancelarFormularioMapa(): void {
    this.mostrarFormularioMapa = false;
  }

  borrarCentro(id: number): void {
    this.misCentrosService.borrarCentro(id).subscribe({
      next: () => {
        this.abrirPopup('Centro borrado correctamente.', 'exito');
        this.cargarMisCentros();
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el centro.', 'error');
      },
    });
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
