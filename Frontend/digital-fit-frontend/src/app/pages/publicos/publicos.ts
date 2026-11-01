import { MisLugaresService } from './../../services/publicos/mis-lugares';
import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { PublicosService } from '../../services/publicos/publicos-service';
import { AdminLugaresPublicosBaseService } from '../../services/admin/admin-lugarespublicos-base';
import { AuthService } from '../../services/auth-service';
import { MapaSelectorComponent } from '../../components/mapa-selector/mapa-selector';

@Component({
  selector: 'app-publicos',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink, MapaSelectorComponent],
  templateUrl: './publicos.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './publicos.css',
})
export class PublicosComponent {
  private publicosService = inject(PublicosService);
  private misLugaresService = inject(MisLugaresService);
  private adminLugaresPublicosBaseService = inject(AdminLugaresPublicosBaseService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  lugares: any[] = [];
  usuarioActual: any = null;

  nombre = '';
  direccion = '';
  descripcion = '';
  telefono = '';
  horario = '';

  latitud = 39.4699;
  longitud = -0.3763;

  tipo = 'PARQUE_PUBLICO';

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
        this.cargarLugares();
      },
      error: () => {
        this.cargarLugares();
      },
    });
  }

  cargarLugares(): void {
    this.publicosService.getLugaresPublicos().subscribe({
      next: (data: any[]) => {
        this.lugares = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR LUGARES PUBLICOS BASE:', err);
        this.abrirPopup('No se pudieron cargar los lugares públicos base.', 'error');
      },
    });
  }

  esAdmin(): boolean {
    return this.usuarioActual?.rol === 'ADMIN';
  }

  buscarLugares(): void {
    const texto = this.valorBusqueda.trim();

    if (!texto) {
      this.cargarLugares();
      return;
    }

    if (this.tipoBusqueda === 'direccion') {
      this.publicosService.getLugaresPublicosFiltrados(undefined, texto, undefined).subscribe({
        next: (data: any[]) => {
          this.lugares = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO DIRECCION LUGARES BASE:', err),
      });
      return;
    }

    if (this.tipoBusqueda === 'tipo') {
      this.publicosService.getLugaresPublicosFiltrados(undefined, undefined, texto).subscribe({
        next: (data: any[]) => {
          this.lugares = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => console.error('ERROR FILTRO TIPO LUGARES BASE:', err),
      });
      return;
    }

    this.publicosService.getLugaresPublicosFiltrados(texto, undefined, undefined).subscribe({
      next: (data: any[]) => {
        this.lugares = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR FILTRO NOMBRE LUGARES BASE:', err),
    });
  }

  alCambiarBusqueda(): void {
    this.buscarLugares();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'nombre';
    this.valorBusqueda = '';
    this.cargarLugares();
  }

  actualizarUbicacion(evento: { latitud: number; longitud: number }): void {
    this.latitud = evento.latitud;
    this.longitud = evento.longitud;
  }

  guardarLugarBase(): void {
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

    if (this.editandoId !== null) {
      this.adminLugaresPublicosBaseService
        .actualizarLugarPublicoBase(this.editandoId, payload)
        .subscribe({
          next: () => {
            this.abrirPopup('Lugar público base actualizado correctamente.', 'exito');
            this.limpiarFormulario();
            this.cargarLugares();
          },
          error: (err: any) => {
            this.abrirPopup(
              this.obtenerMensajeError(err, 'No se pudo actualizar el lugar público base.'),
              'error',
            );
          },
        });
    } else {
      this.adminLugaresPublicosBaseService.crearLugarPublicoBase(payload).subscribe({
        next: () => {
          this.abrirPopup('Lugar público base creado correctamente.', 'exito');
          this.limpiarFormulario();
          this.cargarLugares();
        },
        error: (err: any) => {
          this.abrirPopup(
            this.obtenerMensajeError(err, 'No se pudo crear el lugar público base.'),
            'error',
          );
        },
      });
    }
  }

  editarLugarBase(lugar: any): void {
    this.editandoId = lugar.id;
    this.nombre = lugar.nombre;
    this.direccion = lugar.direccion;
    this.descripcion = lugar.descripcion;
    this.telefono = lugar.telefono;
    this.horario = lugar.horario;
    this.latitud = lugar.latitud ?? 39.4699;
    this.longitud = lugar.longitud ?? -0.3763;
    this.tipo = lugar.tipo;
  }

  borrarLugarBase(id: number): void {
    this.adminLugaresPublicosBaseService.borrarLugarPublicoBase(id).subscribe({
      next: () => {
        this.abrirPopup('Lugar público base borrado correctamente.', 'exito');
        this.cargarLugares();
      },
      error: (err: any) => {
        this.abrirPopup(
          this.obtenerMensajeError(err, 'No se pudo borrar el lugar público base.'),
          'error',
        );
      },
    });
  }

  anadirAMisLugares(id: number): void {
    this.misLugaresService.anadirLugarDesdeBase(id).subscribe({
      next: () => {
        this.abrirPopup('Lugar añadido a mis lugares.', 'exito');
      },
      error: () => {
        this.abrirPopup('No se pudo añadir a mis lugares.', 'error');
      },
    });
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.editandoId = null;
    this.nombre = '';
    this.direccion = '';
    this.descripcion = '';
    this.telefono = '';
    this.horario = '';
    this.latitud = 39.4699;
    this.longitud = -0.3763;
    this.tipo = 'PARQUE_PUBLICO';
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

  private obtenerMensajeError(err: any, mensajePorDefecto: string): string {
    if (typeof err?.error === 'string' && err.error.trim() !== '') {
      return err.error;
    }

    if (err?.error && typeof err.error === 'object') {
      const primerValor = Object.values(err.error)[0];
      if (typeof primerValor === 'string' && primerValor.trim() !== '') {
        return primerValor;
      }
    }

    return mensajePorDefecto;
  }
}
