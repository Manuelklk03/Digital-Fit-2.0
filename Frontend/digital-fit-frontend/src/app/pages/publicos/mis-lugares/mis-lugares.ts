import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MisLugaresService } from '../../../services/publicos/mis-lugares';
import { Footer } from '../../../components/footer/footer';
import { HeaderComponent } from '../../../components/header/header';
import { MapaSelectorComponent } from '../../../components/mapa-selector/mapa-selector';

@Component({
  selector: 'app-mis-lugares',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink, MapaSelectorComponent],
  templateUrl: './mis-lugares.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mis-lugares.css',
})
export class MisLugaresComponent implements OnDestroy {
  private misLugaresService = inject(MisLugaresService);
  private cdr = inject(ChangeDetectorRef);

  lugares: any[] = [];

  nombre = '';
  direccion = '';
  descripcion = '';
  telefono = '';
  horario = '';
  latitud = 39.4699;
  longitud = -0.3763;
  tipo = 'PARQUE_PUBLICO';

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
    this.cargarMisLugares();
  }

  ngOnDestroy(): void {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }

    if (this.autocompletadoTimeout) {
      clearTimeout(this.autocompletadoTimeout);
    }
  }

  cargarMisLugares(): void {
    this.misLugaresService.getMisLugares().subscribe({
      next: (data: any[]) => {
        this.lugares = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR MIS LUGARES:', err);
        this.abrirPopup('No se pudieron cargar tus lugares.', 'error');
      },
    });
  }

  buscarLugares(): void {
    const texto = this.valorBusqueda.trim();

    if (!texto) {
      this.cargarMisLugares();
      return;
    }

    if (this.tipoBusqueda === 'direccion') {
      this.misLugaresService.getMisLugaresFiltrados(undefined, texto, undefined).subscribe({
        next: (data: any[]) => {
          this.lugares = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO DIRECCION MIS LUGARES:', err),
      });
      return;
    }

    if (this.tipoBusqueda === 'tipo') {
      this.misLugaresService.getMisLugaresFiltrados(undefined, undefined, texto).subscribe({
        next: (data: any[]) => {
          this.lugares = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO TIPO MIS LUGARES:', err),
      });
      return;
    }

    this.misLugaresService.getMisLugaresFiltrados(texto, undefined, undefined).subscribe({
      next: (data: any[]) => {
        this.lugares = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR FILTRO NOMBRE MIS LUGARES:', err),
    });
  }

  alCambiarBusqueda(): void {
    this.buscarLugares();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'nombre';
    this.valorBusqueda = '';
    this.cargarMisLugares();
  }

  abrirFormularioMapa(): void {
    this.nombre = '';
    this.direccion = '';
    this.descripcion = '';
    this.telefono = '';
    this.horario = '';
    this.latitud = 39.4699;
    this.longitud = -0.3763;
    this.tipo = 'PARQUE_PUBLICO';
    this.autocompletando = false;
    this.textoAutocompletado =
      'Selecciona una ubicación en el mapa para rellenar los datos automáticamente.';
    this.mostrarFormularioMapa = true;
  }

  private limpiarCamposAutocompletables(): void {
    this.direccion = '';
    this.descripcion = '';
    this.telefono = '';
    this.horario = '';
    this.tipo = 'PARQUE_PUBLICO';
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

    this.misLugaresService.autocompletarDatosLugar(this.latitud, this.longitud).subscribe({
      next: (data: any) => {
        this.direccion = data?.direccion ?? '';
        this.descripcion = data?.descripcion ?? '';
        this.telefono = data?.telefono ?? '';
        this.horario = data?.horario ?? '';
        this.tipo = data?.tipo ?? 'PARQUE_PUBLICO';

        this.latitud = data?.latitud ?? this.latitud;
        this.longitud = data?.longitud ?? this.longitud;

        this.autocompletando = false;
        this.textoAutocompletado = data?.datosEncontrados
          ? 'Datos rellenados automáticamente. Solo te queda escribir el nombre y revisar el resto.'
          : 'No se encontraron datos suficientes para esa ubicación. Puedes completar los campos manualmente.';

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR AUTOCOMPLETADO LUGAR:', err);

        this.limpiarCamposAutocompletables();

        this.autocompletando = false;
        this.textoAutocompletado =
          'No se pudo autocompletar la ubicación. Puedes completar los campos manualmente.';
        this.cdr.detectChanges();
      },
    });
  }

  guardarLugarDesdeMapa(): void {
    const payload = {
      nombre: this.nombre,
      direccion: this.direccion,
      descripcion: this.descripcion,
      telefono: this.telefono,
      horario: this.horario,
      latitud: this.latitud,
      longitud: this.longitud,
      tipo: this.tipo,
    };

    this.misLugaresService.crearLugarDesdeMaps(payload).subscribe({
      next: () => {
        this.abrirPopup('Lugar guardado correctamente.', 'exito');
        this.mostrarFormularioMapa = false;
        this.cargarMisLugares();
      },
      error: () => {
        this.abrirPopup('No se pudo guardar el lugar.', 'error');
      },
    });
  }

  cancelarFormularioMapa(): void {
    this.mostrarFormularioMapa = false;
  }

  borrarLugar(id: number): void {
    this.misLugaresService.borrarLugar(id).subscribe({
      next: () => {
        this.abrirPopup('Lugar borrado correctamente.', 'exito');
        this.cargarMisLugares();
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
