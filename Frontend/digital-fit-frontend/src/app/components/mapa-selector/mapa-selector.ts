import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { ButtonComponent, InputDirective } from '../ui';
import { I18nService } from '../../i18n/i18n.service';
import { Coordenadas, ResultadoGeocodificacion, UBICACION_INICIAL } from '../../models/lugar';

const ZOOM_CIUDAD = 12;
const ZOOM_DETALLE = 17;
const ZOOM_BUSQUEDA = 16;
/** Pausa entre consultas de geocodificación (Nominatim pide como máximo 1 por segundo). */
const PAUSA_CONSULTA_MS = 1200;

const LIMITES_COMUNIDAD_VALENCIANA = L.latLngBounds(L.latLng(37.84, -1.58), L.latLng(40.79, 0.56));

/**
 * Mapa Leaflet (teselas de OpenStreetMap) para elegir o mostrar una ubicación en la Comunidad Valenciana.
 * Con `soloVista` solo muestra el marcador; si no, permite buscar una dirección (proxy del backend) o hacer clic.
 */
@Component({
  selector: 'app-mapa-selector',
  imports: [FormsModule, ButtonComponent, InputDirective],
  templateUrl: './mapa-selector.html',
  styleUrl: './mapa-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaSelectorComponent implements AfterViewInit, OnDestroy {
  readonly i18n = inject(I18nService);
  private readonly http = inject(HttpClient);
  private readonly contenedor = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  readonly latitud = input<number | null>(null);
  readonly longitud = input<number | null>(null);
  readonly soloVista = input(false);
  readonly ubicacionSeleccionada = output<Coordenadas>();

  readonly buscando = signal(false);
  readonly mensaje = signal<string | null>(null);
  readonly hayMarcador = signal(false);
  textoBusqueda = '';

  private map?: L.Map;
  private marker: L.Marker | null = null;
  private busqueda?: Subscription;
  private readonly temporizadores = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    // Si el padre cambia las coordenadas (p. ej. al editar otro sitio), mueve el marcador.
    effect(() => {
      const lat = this.latitud();
      const lng = this.longitud();
      untracked(() => this.sincronizarMarcador(lat, lng));
    });
  }

  ngAfterViewInit(): void {
    this.configurarIconosLeaflet();
    this.inicializarMapa();
  }

  ngOnDestroy(): void {
    this.busqueda?.unsubscribe();
    this.temporizadores.forEach(clearTimeout);
    this.map?.remove();
  }

  private configurarIconosLeaflet(): void {
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  private inicializarMapa(): void {
    const soloVista = this.soloVista();
    const lat = this.latitud();
    const lng = this.longitud();
    const tieneUbicacion = this.coordenadasValidas(lat, lng);
    const centro: L.LatLngTuple = tieneUbicacion
      ? [Number(lat), Number(lng)]
      : [UBICACION_INICIAL.latitud, UBICACION_INICIAL.longitud];
    const zoom = tieneUbicacion ? ZOOM_DETALLE : ZOOM_CIUDAD;

    const map = L.map(this.contenedor().nativeElement, {
      center: centro,
      zoom,
      minZoom: 8,
      maxBounds: LIMITES_COMUNIDAD_VALENCIANA,
      maxBoundsViscosity: 1,
      dragging: !soloVista,
      scrollWheelZoom: !soloVista,
      doubleClickZoom: !soloVista,
      boxZoom: !soloVista,
      keyboard: !soloVista,
      touchZoom: !soloVista,
    });
    this.map = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      noWrap: true,
    }).addTo(map);

    map.on('dragend zoomend', () => map.panInsideBounds(LIMITES_COMUNIDAD_VALENCIANA, { animate: false }));

    if (tieneUbicacion) {
      this.colocarMarker(centro[0], centro[1]);
    }

    if (!soloVista) {
      map.on('click', (e: L.LeafletMouseEvent) => this.seleccionar(e.latlng.lat, e.latlng.lng));
    }

    // El contenedor puede aparecer con tamaño 0 (formularios que se abren): recalcula tras el render.
    this.esperar(200, () => {
      map.invalidateSize();
      map.setView(centro, zoom);
    });
  }

  private seleccionar(latitud: number, longitud: number, zoom?: number): void {
    const lat = Number(latitud.toFixed(6));
    const lng = Number(longitud.toFixed(6));
    if (!this.coordenadasValidas(lat, lng)) {
      this.mensaje.set(this.i18n.t().lugares.mapa.fueraDeZona);
      return;
    }
    if (zoom) {
      this.map?.setView([lat, lng], zoom);
    }
    this.colocarMarker(lat, lng);
    this.mensaje.set(null);
    this.ubicacionSeleccionada.emit({ latitud: lat, longitud: lng });
  }

  buscarDireccion(): void {
    const texto = this.textoBusqueda.trim();
    if (this.soloVista() || this.buscando()) {
      return;
    }
    if (!texto) {
      this.mensaje.set(this.i18n.t().lugares.mapa.escribeDireccion);
      return;
    }
    this.buscando.set(true);
    this.mensaje.set(null);
    // De más concreta a más general: el primer resultado dentro de la Comunidad Valenciana gana.
    const consultas = [
      `${texto}, Valencia, Comunidad Valenciana, España`,
      `${texto}, Alicante, Comunidad Valenciana, España`,
      `${texto}, Castellón, Comunidad Valenciana, España`,
      `${texto}, Comunidad Valenciana, España`,
      texto,
    ];
    this.buscarConFallback(consultas, 0);
  }

  private buscarConFallback(consultas: string[], indice: number): void {
    if (indice >= consultas.length) {
      this.buscando.set(false);
      this.mensaje.set(this.i18n.t().lugares.mapa.noEncontrado);
      return;
    }
    const siguiente = () => this.esperar(PAUSA_CONSULTA_MS, () => this.buscarConFallback(consultas, indice + 1));
    const params = new HttpParams().set('q', consultas[indice]);
    this.busqueda = this.http
      .get<ResultadoGeocodificacion[]>('/api/explorar/geocodificar', { params })
      .subscribe({
        next: (resultados) => {
          const valido = resultados?.find((r) => this.coordenadasValidas(r.latitud, r.longitud));
          if (!valido) {
            siguiente();
            return;
          }
          this.buscando.set(false);
          this.seleccionar(valido.latitud, valido.longitud, ZOOM_BUSQUEDA);
        },
        error: () => siguiente(),
      });
  }

  volverAValencia(): void {
    this.map?.setView([UBICACION_INICIAL.latitud, UBICACION_INICIAL.longitud], ZOOM_CIUDAD);
  }

  volverAMarcador(): void {
    const posicion = this.marker?.getLatLng();
    if (posicion) {
      this.map?.setView(posicion, ZOOM_BUSQUEDA);
    }
  }

  private sincronizarMarcador(lat: number | null, lng: number | null): void {
    if (!this.map || !this.coordenadasValidas(lat, lng)) {
      return;
    }
    const actual = this.marker?.getLatLng();
    if (actual?.lat === lat && actual?.lng === lng) {
      return;
    }
    this.colocarMarker(Number(lat), Number(lng));
    this.map.setView([Number(lat), Number(lng)], ZOOM_DETALLE);
  }

  private colocarMarker(lat: number, lng: number): void {
    this.marker?.remove();
    if (this.map) {
      // Sin teclado: el marcador no hace nada al pulsarlo y Leaflet lo anunciaría como un botón «Marker».
      this.marker = L.marker([lat, lng], { keyboard: false, alt: '' }).addTo(this.map);
      this.hayMarcador.set(true);
    }
  }

  private coordenadasValidas(latitud: number | null | undefined, longitud: number | null | undefined): boolean {
    if (latitud == null || longitud == null) {
      return false;
    }
    const lat = Number(latitud);
    const lng = Number(longitud);
    if (Number.isNaN(lat) || Number.isNaN(lng) || (lat === 0 && lng === 0)) {
      return false;
    }
    return LIMITES_COMUNIDAD_VALENCIANA.contains(L.latLng(lat, lng));
  }

  private esperar(ms: number, accion: () => void): void {
    const id = setTimeout(() => {
      this.temporizadores.delete(id);
      accion();
    }, ms);
    this.temporizadores.add(id);
  }
}
