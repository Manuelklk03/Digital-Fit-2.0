import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

import { ValoracionesService } from '../../services/valoraciones/valoraciones-service';
import { EntrenamientosService } from '../../services/entrenamientos/entrenamientos-service';
import { MisEntrenamientosService } from '../../services/entrenamientos/mis-entrenamientos-service';
import { HistorialEntrenamientosService } from '../../services/entrenamientos/historial-entrenamientos';
import { EntrenamientosComunidadService } from '../../services/entrenamientos/entrenamiento-comunidad-service';
import { PrivadosService } from '../../services/centros/privados-service';
import { MisCentrosService } from '../../services/centros/mis-centros-service';
import { PublicosService } from '../../services/publicos/publicos-service';
import { MisLugaresService } from '../../services/publicos/mis-lugares';

@Component({
  selector: 'app-valoraciones',
  imports: [HeaderComponent, Footer, FormsModule],
  templateUrl: './valoraciones.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './valoraciones.css',
})
export class ValoracionesComponent implements OnInit {
  private valoracionesService = inject(ValoracionesService);
  private entrenamientosService = inject(EntrenamientosService);
  private misEntrenamientosService = inject(MisEntrenamientosService);
  private historialEntrenamientosService = inject(HistorialEntrenamientosService);
  private entrenamientosComunidadService = inject(EntrenamientosComunidadService);
  private privadosService = inject(PrivadosService);
  private misCentrosService = inject(MisCentrosService);
  private publicosService = inject(PublicosService);
  private misLugaresService = inject(MisLugaresService);
  private cdr = inject(ChangeDetectorRef);

  misValoraciones: any[] = [];
  misValoracionesFiltradas: any[] = [];
  valoracionesPublicas: any[] = [];

  entrenamientosBase: any[] = [];
  misEntrenamientos: any[] = [];
  historialEntrenamientos: any[] = [];
  entrenamientosComunidad: any[] = [];

  centrosBase: any[] = [];
  misCentros: any[] = [];

  lugaresBase: any[] = [];
  misLugares: any[] = [];

  categoriaContenido = 'ENTRENAMIENTOS';
  tipoContenidoReal = 'ENTRENAMIENTO_BASE';
  contenidoSeleccionadoId: number | null = null;

  filtroValoracionesPublicas = 'TODOS';

  puntuacion = 5;
  comentario = '';

  estrellas = [1, 2, 3, 4, 5];
  hoveredPuntuacion = 0;

  tipoBusquedaMisValoraciones = 'general';
  busquedaMisValoraciones = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.cargarMisValoraciones();
    this.cargarOpciones();
    this.cargarValoracionesPublicas();
    this.sincronizarTipoReal();
  }

  cargarMisValoraciones(): void {
    this.valoracionesService.getMisValoraciones().subscribe({
      next: (data: any[]) => {
        this.misValoraciones = data;
        this.aplicarBusquedaMisValoraciones();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR MIS VALORACIONES:', err);
        this.abrirPopup(
          this.obtenerMensajeError(err, 'No se pudieron cargar tus valoraciones.'),
          'error',
        );
      },
    });
  }

  cargarValoracionesPublicas(): void {
    const categoria =
      this.filtroValoracionesPublicas === 'TODOS' ? null : this.filtroValoracionesPublicas;

    this.valoracionesService.getValoracionesPublicas(categoria).subscribe({
      next: (data: any[]) => {
        this.valoracionesPublicas = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR VALORACIONES PUBLICAS:', err);
        this.valoracionesPublicas = [];
      },
    });
  }

  cambiarFiltroValoracionesPublicas(): void {
    this.cargarValoracionesPublicas();
  }

  cargarOpciones(): void {
    this.entrenamientosService.getEntrenamientos().subscribe({
      next: (data: any[]) => {
        this.entrenamientosBase = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR ENTRENAMIENTOS BASE:', err),
    });

    this.misEntrenamientosService.getMisEntrenamientos().subscribe({
      next: (data: any[]) => {
        this.misEntrenamientos = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR MIS ENTRENAMIENTOS:', err),
    });

    this.historialEntrenamientosService.getHistorial().subscribe({
      next: (data: any[]) => {
        this.historialEntrenamientos = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR HISTORIAL:', err),
    });

    this.entrenamientosComunidadService.getEntrenamientosComunidad().subscribe({
      next: (data: any[]) => {
        this.entrenamientosComunidad = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR ENTRENAMIENTOS COMUNIDAD:', err),
    });

    this.privadosService.getCentrosPrivados().subscribe({
      next: (data: any[]) => {
        this.centrosBase = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR CENTROS BASE:', err),
    });

    this.misCentrosService.getMisCentros().subscribe({
      next: (data: any[]) => {
        this.misCentros = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR MIS CENTROS:', err),
    });

    this.publicosService.getLugaresPublicos().subscribe({
      next: (data: any[]) => {
        this.lugaresBase = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR LUGARES BASE:', err),
    });

    this.misLugaresService.getMisLugares().subscribe({
      next: (data: any[]) => {
        this.misLugares = data;
        this.intentarSeleccionAutomatica();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('ERROR MIS LUGARES:', err),
    });
  }

  cambiarCategoriaContenido(): void {
    this.contenidoSeleccionadoId = null;
    this.sincronizarTipoReal();
    this.seleccionarPrimerContenidoDisponible();
  }

  sincronizarTipoReal(): void {
    if (this.categoriaContenido === 'ENTRENAMIENTOS') {
      this.tipoContenidoReal = 'ENTRENAMIENTO_BASE';
    } else if (this.categoriaContenido === 'CENTROS_PRIVADOS') {
      this.tipoContenidoReal = 'CENTRO_PRIVADO_BASE';
    } else {
      this.tipoContenidoReal = 'LUGAR_PUBLICO_BASE';
    }
  }

  getOpcionesActuales(): { grupo: string; tipoReal: string; items: any[] }[] {
    if (this.categoriaContenido === 'ENTRENAMIENTOS') {
      return [
        {
          grupo: 'Entrenamientos base',
          tipoReal: 'ENTRENAMIENTO_BASE',
          items: this.entrenamientosBase,
        },
        {
          grupo: 'Mis entrenamientos',
          tipoReal: 'ENTRENAMIENTO_USUARIO',
          items: this.misEntrenamientos,
        },
        {
          grupo: 'Entrenamientos del historial',
          tipoReal: 'HISTORIAL_ENTRENAMIENTO',
          items: this.historialEntrenamientos,
        },
        {
          grupo: 'Entrenamientos comunidad',
          tipoReal: 'ENTRENAMIENTO_COMUNIDAD',
          items: this.entrenamientosComunidad,
        },
      ];
    }

    if (this.categoriaContenido === 'CENTROS_PRIVADOS') {
      return [
        {
          grupo: 'Centros privados base',
          tipoReal: 'CENTRO_PRIVADO_BASE',
          items: this.centrosBase,
        },
        { grupo: 'Mis centros', tipoReal: 'CENTRO_PRIVADO_USUARIO', items: this.misCentros },
      ];
    }

    return [
      { grupo: 'Lugares públicos base', tipoReal: 'LUGAR_PUBLICO_BASE', items: this.lugaresBase },
      { grupo: 'Mis lugares', tipoReal: 'LUGAR_PUBLICO_USUARIO', items: this.misLugares },
    ];
  }

  seleccionarContenido(valor: string): void {
    if (!valor) {
      this.sincronizarTipoReal();
      this.contenidoSeleccionadoId = null;
      return;
    }

    const separador = valor.indexOf('|');
    const tipo = valor.substring(0, separador);
    const id = Number(valor.substring(separador + 1));

    this.tipoContenidoReal = tipo;
    this.contenidoSeleccionadoId = id;
  }

  getValorSeleccionadoContenido(): string {
    if (!this.contenidoSeleccionadoId) {
      return '';
    }

    return `${this.tipoContenidoReal}|${this.contenidoSeleccionadoId}`;
  }

  seleccionarEstrella(valor: number): void {
    this.puntuacion = valor;
  }

  activarHoverEstrella(valor: number): void {
    this.hoveredPuntuacion = valor;
  }

  quitarHoverEstrella(): void {
    this.hoveredPuntuacion = 0;
  }

  estrellaActiva(valor: number): boolean {
    if (this.hoveredPuntuacion > 0) {
      return valor <= this.hoveredPuntuacion;
    }

    return valor <= this.puntuacion;
  }

  getTextoPuntuacion(): string {
    switch (this.puntuacion) {
      case 1:
        return 'Muy mala';
      case 2:
        return 'Mala';
      case 3:
        return 'Normal';
      case 4:
        return 'Buena';
      case 5:
        return 'Muy buena';
      default:
        return '';
    }
  }

  guardarValoracion(): void {
    if (!this.contenidoSeleccionadoId) {
      this.abrirPopup('Debes seleccionar un contenido.', 'error');
      return;
    }

    const nuevaValoracion = {
      puntuacion: this.puntuacion,
      comentario: this.comentario,
    };

    this.valoracionesService
      .crearOActualizarValoracion(
        this.tipoContenidoReal,
        this.contenidoSeleccionadoId,
        nuevaValoracion,
      )
      .subscribe({
        next: () => {
          this.abrirPopup('Valoración guardada correctamente.', 'exito');
          this.puntuacion = 5;
          this.comentario = '';
          this.hoveredPuntuacion = 0;
          this.cargarMisValoraciones();
          this.cargarValoracionesPublicas();
        },
        error: (err: any) => {
          console.error('ERROR GUARDAR VALORACION:', err);
          this.abrirPopup(
            this.obtenerMensajeError(err, 'No se pudo guardar la valoración.'),
            'error',
          );
        },
      });
  }

  borrarValoracion(tipo: string, contenidoId: number): void {
    this.valoracionesService.borrarValoracion(tipo, contenidoId).subscribe({
      next: () => {
        this.abrirPopup('Valoración borrada correctamente.', 'exito');
        this.cargarMisValoraciones();
        this.cargarValoracionesPublicas();
      },
      error: (err: any) => {
        console.error('ERROR BORRAR VALORACION:', err);
        this.abrirPopup(this.obtenerMensajeError(err, 'No se pudo borrar la valoración.'), 'error');
      },
    });
  }

  aplicarBusquedaMisValoraciones(): void {
    const texto = this.busquedaMisValoraciones.trim().toLowerCase();

    if (!texto) {
      this.misValoracionesFiltradas = [...this.misValoraciones];
      return;
    }

    this.misValoracionesFiltradas = this.misValoraciones.filter((valoracion: any) => {
      const tipo = this.mostrarTipoContenido(valoracion.tipoDeValoracion).toLowerCase();
      const contenido = (valoracion.contenidoNombre || '').toLowerCase();
      const puntuacion = String(valoracion.puntuacion || '');
      const comentario = (valoracion.comentario || '').toLowerCase();
      const fecha = (valoracion.fecha || '').toLowerCase();

      if (this.tipoBusquedaMisValoraciones === 'tipo') {
        return tipo.includes(texto);
      }

      if (this.tipoBusquedaMisValoraciones === 'contenido') {
        return contenido.includes(texto);
      }

      if (this.tipoBusquedaMisValoraciones === 'comentario') {
        return comentario.includes(texto);
      }

      if (this.tipoBusquedaMisValoraciones === 'fecha') {
        return fecha.includes(texto);
      }

      return (
        tipo.includes(texto) ||
        contenido.includes(texto) ||
        puntuacion.includes(texto) ||
        comentario.includes(texto) ||
        fecha.includes(texto)
      );
    });
  }

  alCambiarBusquedaMisValoraciones(): void {
    this.aplicarBusquedaMisValoraciones();
  }

  limpiarBusquedaMisValoraciones(): void {
    this.tipoBusquedaMisValoraciones = 'general';
    this.busquedaMisValoraciones = '';
    this.aplicarBusquedaMisValoraciones();
  }

  mostrarTipoContenido(tipo: string): string {
    switch (tipo) {
      case 'ENTRENAMIENTO_BASE':
        return 'Entrenamiento base';
      case 'ENTRENAMIENTO_USUARIO':
        return 'Mi entrenamiento';
      case 'HISTORIAL_ENTRENAMIENTO':
        return 'Entrenamiento del historial';
      case 'ENTRENAMIENTO_COMUNIDAD':
        return 'Entrenamiento comunidad';
      case 'CENTRO_PRIVADO_BASE':
        return 'Centro privado base';
      case 'CENTRO_PRIVADO_USUARIO':
        return 'Mi centro';
      case 'LUGAR_PUBLICO_BASE':
        return 'Lugar público base';
      case 'LUGAR_PUBLICO_USUARIO':
        return 'Mi lugar';
      default:
        return tipo;
    }
  }

  mostrarCategoriaGeneral(tipo: string): string {
    if (tipo.startsWith('ENTRENAMIENTO')) {
      return 'Entrenamientos';
    }

    if (tipo.startsWith('CENTRO_PRIVADO')) {
      return 'Centros privados';
    }

    if (tipo.startsWith('LUGAR_PUBLICO')) {
      return 'Lugares públicos';
    }

    return tipo;
  }

  getTextoOpcion(item: any, tipoReal: string): string {
    switch (tipoReal) {
      case 'ENTRENAMIENTO_BASE':
      case 'ENTRENAMIENTO_USUARIO':
        return `${item.nombre} - ${this.mostrarTextoNormal(item.nivel)} - ${item.duracionEnMinutos} min`;

      case 'HISTORIAL_ENTRENAMIENTO':
        return `${item.entrenamiento} - ${item.fecha}`;

      case 'ENTRENAMIENTO_COMUNIDAD':
        return `${item.nombre} - ${item.usuario} - ${item.duracionEnMinutos} min`;

      case 'CENTRO_PRIVADO_BASE':
      case 'CENTRO_PRIVADO_USUARIO':
        return `${item.nombre} - ${item.direccion}`;

      case 'LUGAR_PUBLICO_BASE':
      case 'LUGAR_PUBLICO_USUARIO':
        return `${item.nombre} - ${this.mostrarTextoNormal(item.tipo)}`;

      default:
        return item.nombre || 'Contenido';
    }
  }

  mostrarTextoNormal(texto: string): string {
    if (!texto) {
      return '';
    }

    return texto
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

  private obtenerPrimerContenidoDisponible(): string | null {
    const grupos = this.getOpcionesActuales();

    for (const grupo of grupos) {
      if (grupo.items && grupo.items.length > 0) {
        return `${grupo.tipoReal}|${grupo.items[0].id}`;
      }
    }

    return null;
  }

  private seleccionarPrimerContenidoDisponible(): void {
    const primerValor = this.obtenerPrimerContenidoDisponible();

    if (!primerValor) {
      this.contenidoSeleccionadoId = null;
      return;
    }

    this.seleccionarContenido(primerValor);
  }

  private intentarSeleccionAutomatica(): void {
    if (this.contenidoSeleccionadoId) {
      return;
    }

    const primerValor = this.obtenerPrimerContenidoDisponible();

    if (primerValor) {
      this.seleccionarContenido(primerValor);
    }
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
