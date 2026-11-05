import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { BadgeComponent, ButtonComponent, CardComponent, InputDirective } from '../../components/ui';
import { PrivadosService } from '../../services/centros/privados-service';
import { PublicosService } from '../../services/publicos/publicos-service';

export type CategoriaLugar = 'GIMNASIO' | 'CALISTENIA' | 'POLIDEPORTIVO' | 'PISCINA' | 'OTRO';

export interface LugarDeportivo {
  id?: number;
  osmId?: number;
  nombre: string;
  categoria: CategoriaLugar;
  tipoOrigen: 'PRIVADO' | 'PUBLICO' | 'OSM';
  direccion: string;
  latitud: number;
  longitud: number;
  precioMensual?: number;
  equipamiento?: string;
  horario?: string;
  distanciaKm?: number;
}

@Component({
  selector: 'app-explorar',
  imports: [
    FormsModule,
    HeaderComponent,
    Footer,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    InputDirective,
  ],
  templateUrl: './explorar.html',
  styleUrl: './explorar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private privadosService = inject(PrivadosService);
  private publicosService = inject(PublicosService);
  private http = inject(HttpClient);

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;
  private userMarker?: L.Marker;

  // Ubicación inicial por defecto (Valencia centro)
  readonly centroValencia: [number, number] = [39.4699, -0.3763];

  // Estado reactivo
  readonly lugares = signal<LugarDeportivo[]>([]);
  readonly categoriaFiltro = signal<CategoriaLugar | 'TODOS'>('TODOS');
  readonly textoBusqueda = signal('');
  readonly radioFiltroKm = signal<number>(5);
  readonly ubicacionUsuario = signal<{ lat: number; lng: number } | null>(null);
  readonly lugarSeleccionado = signal<LugarDeportivo | null>(null);
  readonly cargando = signal(true);
  readonly geolocalizando = signal(false);
  readonly mostrarBotonZona = signal(false);
  readonly mensajeError = signal<string | null>(null);

  // Filtro y ordenación reactiva por distancia
  readonly lugaresFiltrados = computed(() => {
    const list = this.lugares();
    const cat = this.categoriaFiltro();
    const query = this.textoBusqueda().toLowerCase().trim();
    const radio = this.radioFiltroKm();

    return list
      .filter((lugar) => {
        const coincideCat = cat === 'TODOS' || lugar.categoria === cat;
        const coincideQuery =
          !query ||
          lugar.nombre.toLowerCase().includes(query) ||
          lugar.direccion.toLowerCase().includes(query);
        const coincideRadio =
          lugar.distanciaKm === undefined || lugar.distanciaKm <= radio;

        return coincideCat && coincideQuery && coincideRadio;
      })
      .sort((a, b) => {
        if (a.distanciaKm !== undefined && b.distanciaKm !== undefined) {
          return a.distanciaKm - b.distanciaKm;
        }
        return 0;
      });
  });

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    if (this.map) {
      try {
        this.map.remove();
      } catch {
        // En tests o reciclado de vistas el contenedor puede desmontarse antes
      }
      this.map = undefined;
    }
  }

  cargarDatosIniciales(): void {
    this.cargando.set(true);

    // Carga combinada de centros privados y lugares públicos
    let privadosCargados = false;
    let publicosCargados = false;
    const combinados: LugarDeportivo[] = [];

    const finalizarSiTerminado = () => {
      if (privadosCargados && publicosCargados) {
        // Si no vinieron datos o estamos en entorno sin BD remota, sembramos datos base de Valencia
        if (combinados.length === 0) {
          combinados.push(...this.obtenerLugaresBaseValencia());
        }
        this.lugares.set(combinados);
        this.cargando.set(false);
        this.actualizarMarcadoresEnMapa();
      }
    };

    this.privadosService.getCentrosPrivados().subscribe({
      next: (privados) => {
        if (Array.isArray(privados)) {
          privados.forEach((c) => {
            combinados.push({
              id: c.id,
              nombre: c.nombre,
              categoria: 'GIMNASIO',
              tipoOrigen: 'PRIVADO',
              direccion: c.direccion,
              latitud: c.latitud,
              longitud: c.longitud,
              precioMensual: c.precioMensual,
              horario: c.horario,
            });
          });
        }
        privadosCargados = true;
        finalizarSiTerminado();
      },
      error: () => {
        privadosCargados = true;
        finalizarSiTerminado();
      },
    });

    this.publicosService.getLugaresPublicos().subscribe({
      next: (publicos) => {
        if (Array.isArray(publicos)) {
          publicos.forEach((p) => {
            const cat = this.mapearTipoPublico(p.tipo);
            combinados.push({
              id: p.id,
              nombre: p.nombre,
              categoria: cat,
              tipoOrigen: 'PUBLICO',
              direccion: p.direccion,
              latitud: p.latitud,
              longitud: p.longitud,
              equipamiento: p.equipamiento,
            });
          });
        }
        publicosCargados = true;
        finalizarSiTerminado();
      },
      error: () => {
        publicosCargados = true;
        finalizarSiTerminado();
      },
    });
  }

  inicializarMapa(): void {
    if (!this.mapContainer?.nativeElement || this.map) return;

    delete (this.mapContainer.nativeElement as unknown as { _leaflet_id?: unknown })._leaflet_id;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.centroValencia,
      zoom: 13,
      zoomControl: true,
    });

    // Teselas oscuras CartoDB Dark Matter (alto contraste, acorde a Neutral Sport) con atribución
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      },
    ).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    // Evento de arrastre o zoom: muestra el botón «Buscar en esta zona»
    this.map.on('moveend', () => {
      this.mostrarBotonZona.set(true);
    });

    this.actualizarMarcadoresEnMapa();
  }

  actualizarMarcadoresEnMapa(): void {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    const lista = this.lugaresFiltrados();

    lista.forEach((lugar) => {
      const iconoClase = this.obtenerClaseIcono(lugar.categoria);
      const icon = L.divIcon({
        className: 'df-map-marker',
        html: `<div class="marker-pin ${iconoClase}"><span>${this.obtenerSimboloCategoria(lugar.categoria)}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lugar.latitud, lugar.longitud], { icon });

      marker.bindPopup(`
        <div class="popup-contenido">
          <strong>${lugar.nombre}</strong>
          <p>${lugar.direccion}</p>
          ${lugar.precioMensual ? `<p class="popup-precio">${lugar.precioMensual} €/mes</p>` : '<p class="popup-gratis">Acceso libre</p>'}
        </div>
      `);

      marker.on('click', () => {
        this.lugarSeleccionado.set(lugar);
      });

      this.markersLayer?.addLayer(marker);
    });
  }

  seleccionarLugar(lugar: LugarDeportivo): void {
    this.lugarSeleccionado.set(lugar);
    if (this.map) {
      this.map.flyTo([lugar.latitud, lugar.longitud], 16, {
        duration: 1.2,
      });
    }
  }

  usarMiUbicacion(): void {
    if (!navigator.geolocation) {
      this.mensajeError.set('Tu navegador no soporta geolocalización');
      return;
    }

    this.geolocalizando.set(true);
    this.mensajeError.set(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.ubicacionUsuario.set({ lat, lng });
        this.geolocalizando.set(false);

        // Recalcular distancias a todos los lugares
        this.recalcularDistancias(lat, lng);

        // Centrar mapa y situar marcador de usuario
        if (this.map) {
          this.map.flyTo([lat, lng], 14);

          if (this.userMarker) {
            this.userMarker.setLatLng([lat, lng]);
          } else {
            const userIcon = L.divIcon({
              className: 'df-user-marker',
              html: '<div class="user-location-pulse"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });
            this.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(
              this.map,
            );
          }
        }
      },
      () => {
        this.geolocalizando.set(false);
        this.mensajeError.set('No se pudo acceder a tu ubicación');
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }

  buscarEnEstaZona(): void {
    if (!this.map) return;
    const center = this.map.getCenter();
    this.recalcularDistancias(center.lat, center.lng);
    this.buscarLugaresEnBackend(center.lat, center.lng, this.radioFiltroKm(), this.categoriaFiltro());
    this.mostrarBotonZona.set(false);
  }

  buscarLugaresEnBackend(lat: number, lon: number, radioKm: number, categoria?: string): void {
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('radioKm', radioKm.toString());

    if (categoria && categoria !== 'TODOS') {
      params = params.set('categoria', categoria);
    }

    this.http.get<any[]>('/api/explorar/lugares', { params }).subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length > 0) {
          const nuevos: LugarDeportivo[] = res.map((r) => ({
            id: r.id ?? r.osmId,
            osmId: r.osmId,
            nombre: r.nombre,
            categoria: (r.categoria as CategoriaLugar) ?? 'OTRO',
            tipoOrigen: (r.tipoOrigen as 'PRIVADO' | 'PUBLICO' | 'OSM') ?? 'OSM',
            direccion: r.direccion,
            latitud: r.latitud,
            longitud: r.longitud,
            precioMensual: r.precioMensual,
            equipamiento: r.equipamiento,
            horario: r.horario,
            distanciaKm: r.distanciaKm,
          }));
          this.lugares.set(nuevos);
          this.actualizarMarcadoresEnMapa();
        }
      },
      error: () => {
        // En caso de fallo de red o backend no disponible, se conservan los datos precargados
      },
    });
  }

  cambiarCategoria(cat: CategoriaLugar | 'TODOS'): void {
    this.categoriaFiltro.set(cat);
    this.actualizarMarcadoresEnMapa();
  }

  cambiarRadio(radioKm: number): void {
    this.radioFiltroKm.set(radioKm);
    this.actualizarMarcadoresEnMapa();
  }

  recalcularDistancias(origenLat: number, origenLng: number): void {
    this.lugares.update((list) =>
      list.map((l) => ({
        ...l,
        distanciaKm: this.calcularDistanciaKm(
          origenLat,
          origenLng,
          l.latitud,
          l.longitud,
        ),
      })),
    );
    this.actualizarMarcadoresEnMapa();
  }

  // Fórmula de Haversine para cálculo de distancia geodésica en kilómetros
  calcularDistanciaKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private mapearTipoPublico(tipo?: string): CategoriaLugar {
    if (!tipo) return 'OTRO';
    const t = tipo.toUpperCase();
    if (t.includes('CALISTENIA') || t.includes('PARQUE')) return 'CALISTENIA';
    if (t.includes('POLIDEPORTIVO') || t.includes('CAMPO')) return 'POLIDEPORTIVO';
    if (t.includes('PISCINA')) return 'PISCINA';
    return 'OTRO';
  }

  obtenerClaseIcono(cat: CategoriaLugar): string {
    switch (cat) {
      case 'GIMNASIO':
        return 'pin-gimnasio';
      case 'CALISTENIA':
        return 'pin-calistenia';
      case 'POLIDEPORTIVO':
        return 'pin-polideportivo';
      case 'PISCINA':
        return 'pin-piscina';
      default:
        return 'pin-neutral';
    }
  }

  obtenerSimboloCategoria(cat: CategoriaLugar): string {
    switch (cat) {
      case 'GIMNASIO':
        return '🏋️';
      case 'CALISTENIA':
        return '🤸';
      case 'POLIDEPORTIVO':
        return '🏟️';
      case 'PISCINA':
        return '🏊';
      default:
        return '📍';
    }
  }

  obtenerLugaresBaseValencia(): LugarDeportivo[] {
    return [
      {
        id: 101,
        nombre: 'Gimnasio Tyris Fitness Central',
        categoria: 'GIMNASIO',
        tipoOrigen: 'PRIVADO',
        direccion: 'Calle Reino de Valencia, 14, Valencia',
        latitud: 39.4645,
        longitud: -0.3688,
        precioMensual: 45,
        horario: '07:00 - 23:00',
        distanciaKm: 0.8,
      },
      {
        id: 102,
        nombre: 'Parque de Calistenia Jardín del Turia (Tramo IX)',
        categoria: 'CALISTENIA',
        tipoOrigen: 'PUBLICO',
        direccion: 'Antiguo Cauce del Río Turia, Tramo 9, Valencia',
        latitud: 39.4722,
        longitud: -0.3712,
        equipamiento: 'Barras paralelas, dominadas, escalera horizontal',
        distanciaKm: 0.5,
      },
      {
        id: 103,
        nombre: 'Complejo Deportivo y Piscina La Petxina',
        categoria: 'PISCINA',
        tipoOrigen: 'PUBLICO',
        direccion: 'Passeig de la Petxina, 42, Valencia',
        latitud: 39.4729,
        longitud: -0.3895,
        equipamiento: 'Piscina olímpica cubierta, sala de musculación',
        precioMensual: 30,
        distanciaKm: 1.2,
      },
      {
        id: 104,
        nombre: 'Polideportivo Municipal Benimaclet',
        categoria: 'POLIDEPORTIVO',
        tipoOrigen: 'PUBLICO',
        direccion: 'Calle Daniel Balaciart, s/n, Valencia',
        latitud: 39.4862,
        longitud: -0.3587,
        equipamiento: 'Pistas de atletismo, campos polivalentes',
        distanciaKm: 2.3,
      },
      {
        id: 105,
        nombre: 'Zona Calistenia Marina Real',
        categoria: 'CALISTENIA',
        tipoOrigen: 'PUBLICO',
        direccion: 'Marina de Valencia, Muelle de Poniente',
        latitud: 39.4619,
        longitud: -0.3298,
        equipamiento: 'Estructura freestyle frente al mar',
        distanciaKm: 4.1,
      },
    ];
  }
}

