import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { HistorialEntrenamientosService } from '../../../services/entrenamientos/historial-entrenamientos';
import { EntrenamientosService } from '../../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../../services/entrenamientos/mis-entrenamientos-service';
import { PrivadosService } from '../../../services/centros/privados-service';
import { MisCentrosService } from '../../../services/centros/mis-centros-service';
import { PublicosService } from '../../../services/publicos/publicos-service';
import { MisLugaresService } from '../../../services/publicos/mis-lugares';

@Component({
  selector: 'app-historial-entrenamientos',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink],
  templateUrl: './historial-entrenamientos.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './historial-entrenamientos.css',
})
export class HistorialEntrenamientosComponent implements OnInit {
  private historialService = inject(HistorialEntrenamientosService);
  private entrenamientosService = inject(EntrenamientosService);
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private privadosService = inject(PrivadosService);
  private misCentrosService = inject(MisCentrosService);
  private publicosService = inject(PublicosService);
  private misLugaresService = inject(MisLugaresService);
  private cdr = inject(ChangeDetectorRef);

  historial: any[] = [];
  historialFiltrado: any[] = [];

  entrenamientosBase: any[] = [];
  misEntrenamientos: any[] = [];
  centrosBase: any[] = [];
  misCentros: any[] = [];
  lugaresBase: any[] = [];
  misLugares: any[] = [];

  entrenamientoSeleccionado = '';
  ubicacionSeleccionada = '';

  fecha = '';
  duracionEnMinutos = 30;
  notas = '';

  tipoBusqueda = 'general';
  busqueda = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarOpcionesFormulario();
  }

  cargarHistorial(): void {
    this.historialService.getHistorial().subscribe({
      next: (data: any[]) => {
        this.historial = data;
        this.aplicarFiltroBusqueda();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR HISTORIAL:', err);
        this.abrirPopup('No se pudo cargar el historial.', 'error');
      },
    });
  }

  cargarOpcionesFormulario(): void {
    this.entrenamientosService.getEntrenamientos().subscribe({
      next: (data: any[]) => {
        this.entrenamientosBase = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR ENTRENAMIENTOS BASE:', err),
    });

    this.misEntrenamientosService.getMisEntrenamientos().subscribe({
      next: (data: any[]) => {
        this.misEntrenamientos = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR MIS ENTRENAMIENTOS:', err),
    });

    this.privadosService.getCentrosPrivados().subscribe({
      next: (data: any[]) => {
        this.centrosBase = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR CENTROS BASE:', err),
    });

    this.misCentrosService.getMisCentros().subscribe({
      next: (data: any[]) => {
        this.misCentros = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR MIS CENTROS:', err),
    });

    this.publicosService.getLugaresPublicos().subscribe({
      next: (data: any[]) => {
        this.lugaresBase = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR LUGARES BASE:', err),
    });

    this.misLugaresService.getMisLugares().subscribe({
      next: (data: any[]) => {
        this.misLugares = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR MIS LUGARES:', err),
    });
  }

  crearRegistro(): void {
    if (!this.entrenamientoSeleccionado) {
      this.abrirPopup('Debes seleccionar un entrenamiento.', 'error');
      return;
    }

    if (!this.fecha) {
      this.abrirPopup('Debes indicar una fecha y hora.', 'error');
      return;
    }

    const payload: any = {
      entrenamientoBaseId: null,
      entrenamientoUsuarioId: null,
      lugarPublicoBaseId: null,
      lugarPublicoUsuarioId: null,
      centroPrivadoBaseId: null,
      centroPrivadoUsuarioId: null,
      fecha: this.formatearFechaParaBackend(this.fecha),
      duracionEnMinutos: this.duracionEnMinutos,
      notas: this.notas,
    };

    const [tipoEntrenamiento, idEntrenamiento] = this.entrenamientoSeleccionado.split('-');

    if (tipoEntrenamiento === 'BASE') {
      payload.entrenamientoBaseId = Number(idEntrenamiento);
    } else if (tipoEntrenamiento === 'MIS') {
      payload.entrenamientoUsuarioId = Number(idEntrenamiento);
    }

    if (this.ubicacionSeleccionada) {
      const [tipoUbicacion, idUbicacion] = this.ubicacionSeleccionada.split('-');

      if (tipoUbicacion === 'LPB') {
        payload.lugarPublicoBaseId = Number(idUbicacion);
      } else if (tipoUbicacion === 'LPU') {
        payload.lugarPublicoUsuarioId = Number(idUbicacion);
      } else if (tipoUbicacion === 'CPB') {
        payload.centroPrivadoBaseId = Number(idUbicacion);
      } else if (tipoUbicacion === 'CPU') {
        payload.centroPrivadoUsuarioId = Number(idUbicacion);
      }
    }

    this.historialService.crearRegistro(payload).subscribe({
      next: () => {
        this.abrirPopup('Registro guardado correctamente.', 'exito');
        this.limpiarFormulario();
        this.cargarHistorial();
      },
      error: () => {
        this.abrirPopup('No se pudo guardar el registro.', 'error');
      },
    });
  }

  borrarRegistro(id: number): void {
    this.historialService.borrarRegistro(id).subscribe({
      next: () => {
        this.abrirPopup('Registro borrado correctamente.', 'exito');
        this.cargarHistorial();
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el registro.', 'error');
      },
    });
  }

  aplicarFiltroBusqueda(): void {
    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.historialFiltrado = [...this.historial];
      return;
    }

    this.historialFiltrado = this.historial.filter((registro: any) => {
      const entrenamiento = (registro.entrenamiento || '').toLowerCase();
      const ubicacion = (registro.ubicacion || '').toLowerCase();
      const tipoEntrenamiento = this.mostrarTipoEntrenamiento(
        registro.tipoEntrenamiento,
      ).toLowerCase();
      const tipoUbicacion = this.mostrarTipoUbicacion(registro.tipoUbicacion).toLowerCase();
      const notas = (registro.notas || '').toLowerCase();
      const fecha = (registro.fecha || '').toLowerCase();
      const duracion = String(registro.duracionEnMinutos || '');

      if (this.tipoBusqueda === 'entrenamiento') {
        return entrenamiento.includes(texto);
      }

      if (this.tipoBusqueda === 'ubicacion') {
        return ubicacion.includes(texto);
      }

      if (this.tipoBusqueda === 'fecha') {
        return fecha.includes(texto);
      }

      if (this.tipoBusqueda === 'notas') {
        return notas.includes(texto);
      }

      return (
        entrenamiento.includes(texto) ||
        ubicacion.includes(texto) ||
        tipoEntrenamiento.includes(texto) ||
        tipoUbicacion.includes(texto) ||
        notas.includes(texto) ||
        fecha.includes(texto) ||
        duracion.includes(texto)
      );
    });
  }

  alCambiarBusqueda(): void {
    this.aplicarFiltroBusqueda();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'general';
    this.busqueda = '';
    this.aplicarFiltroBusqueda();
  }

  limpiarFormulario(): void {
    this.entrenamientoSeleccionado = '';
    this.ubicacionSeleccionada = '';
    this.fecha = '';
    this.duracionEnMinutos = 30;
    this.notas = '';
  }

  formatearFechaParaBackend(fechaLocal: string): string {
    if (!fechaLocal) {
      return '';
    }

    return `${fechaLocal.replace('T', ' ')}:00`;
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
