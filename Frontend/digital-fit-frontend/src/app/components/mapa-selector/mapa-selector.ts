import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-mapa-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mapa-selector.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mapa-selector.css',
})
export class MapaSelectorComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() latitud: number | null = null;
  @Input() longitud: number | null = null;
  @Input() soloVista = false;

  @Output() ubicacionSeleccionada = new EventEmitter<{ latitud: number; longitud: number }>();

  private map!: L.Map;
  private marker: L.Marker | null = null;

  textoBusqueda = '';
  mensajeBusqueda = '';
  mostrarMensajeBusqueda = false;
  buscando = false;

  private timeoutMensaje: any;

  private readonly valenciaCentro: L.LatLngExpression = [39.4699, -0.3763];
  private readonly zoomValencia = 12;
  private readonly zoomDetalle = 17;

  private readonly limitesComunidadValenciana = L.latLngBounds(
    L.latLng(37.84, -1.58),
    L.latLng(40.79, 0.56),
  );

  private http = inject(HttpClient);

  ngAfterViewInit(): void {
    this.configurarIconosLeaflet();
    this.inicializarMapa();
  }

  private configurarIconosLeaflet(): void {
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = iconDefault;
  }

  private inicializarMapa(): void {
    const tieneUbicacion = this.coordenadasValidas(this.latitud, this.longitud);

    const lat = tieneUbicacion ? Number(this.latitud) : 39.4699;
    const lng = tieneUbicacion ? Number(this.longitud) : -0.3763;
    const zoom = tieneUbicacion ? this.zoomDetalle : this.zoomValencia;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom,
      minZoom: 8,
      maxBounds: this.limitesComunidadValenciana,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      dragging: !this.soloVista,
      scrollWheelZoom: !this.soloVista,
      doubleClickZoom: !this.soloVista,
      boxZoom: !this.soloVista,
      keyboard: !this.soloVista,
      touchZoom: !this.soloVista,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      noWrap: true,
    }).addTo(this.map);

    this.map.on('dragend zoomend', () => {
      this.map.panInsideBounds(this.limitesComunidadValenciana, { animate: false });
    });

    if (tieneUbicacion) {
      this.colocarMarker(lat, lng);
    }

    if (!this.soloVista) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const nuevaLat = Number(e.latlng.lat.toFixed(6));
        const nuevaLng = Number(e.latlng.lng.toFixed(6));

        if (!this.coordenadasValidas(nuevaLat, nuevaLng)) {
          this.mostrarMensaje('Selecciona una ubicación dentro de la Comunidad Valenciana.');
          return;
        }

        this.colocarMarker(nuevaLat, nuevaLng);

        this.ubicacionSeleccionada.emit({
          latitud: nuevaLat,
          longitud: nuevaLng,
        });
      });
    }

    setTimeout(() => {
      this.map.invalidateSize();
      this.map.setView([lat, lng], zoom);
      this.map.panInsideBounds(this.limitesComunidadValenciana, { animate: false });
    }, 200);
  }

  buscarDireccion(): void {
    const texto = this.textoBusqueda.trim();

    if (!texto || this.soloVista || this.buscando) {
      if (!texto) {
        this.mostrarMensaje('Escribe una dirección, calle, zona o nombre de sitio.');
      }
      return;
    }

    this.buscando = true;
    this.ocultarMensaje();

    const consultas = [
      `${texto}, Valencia, Comunidad Valenciana, España`,
      `${texto}, València, Comunitat Valenciana, España`,
      `${texto}, Alicante, Comunidad Valenciana, España`,
      `${texto}, Castellón, Comunidad Valenciana, España`,
      `${texto}, Castelló, Comunitat Valenciana, España`,
      `${texto}, Comunidad Valenciana, España`,
      texto,
    ];

    this.buscarConFallback(consultas, 0);
  }

  private buscarConFallback(consultas: string[], indice: number): void {
    if (indice >= consultas.length) {
      this.buscando = false;
      this.mostrarMensaje(
        'No se ha encontrado la ubicación. Prueba con una dirección más concreta.',
      );
      return;
    }

    const params = new HttpParams()
      .set('format', 'json')
      .set('limit', '10')
      .set('countrycodes', 'es')
      .set('addressdetails', '1')
      .set('q', consultas[indice]);

    this.http.get<any[]>('https://nominatim.openstreetmap.org/search', { params }).subscribe({
      next: (resultados) => {
        const resultadoValido = resultados?.find((resultado) => {
          const lat = Number(resultado.lat);
          const lng = Number(resultado.lon);
          return this.coordenadasValidas(lat, lng);
        });

        if (!resultadoValido) {
          setTimeout(() => {
            this.buscarConFallback(consultas, indice + 1);
          }, 1200);
          return;
        }

        const lat = Number(Number(resultadoValido.lat).toFixed(6));
        const lng = Number(Number(resultadoValido.lon).toFixed(6));

        this.map.setView([lat, lng], 16);
        this.colocarMarker(lat, lng);

        this.ubicacionSeleccionada.emit({
          latitud: lat,
          longitud: lng,
        });

        this.buscando = false;
        this.ocultarMensaje();
      },
      error: (err) => {
        console.error('ERROR BUSQUEDA DIRECCION:', err);

        setTimeout(() => {
          this.buscarConFallback(consultas, indice + 1);
        }, 1200);
      },
    });
  }

  volverAValencia(): void {
    if (this.soloVista) {
      return;
    }

    this.map.setView(this.valenciaCentro, this.zoomValencia);
  }

  volverAMarcador(): void {
    if (this.soloVista || !this.marker) {
      return;
    }

    const posicion = this.marker.getLatLng();
    this.map.setView([posicion.lat, posicion.lng], 16);
  }

  private colocarMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.remove();
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);
  }

  private coordenadasValidas(
    latitud: number | null | undefined,
    longitud: number | null | undefined,
  ): boolean {
    if (latitud === null || latitud === undefined || longitud === null || longitud === undefined) {
      return false;
    }

    const lat = Number(latitud);
    const lng = Number(longitud);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return false;
    }

    if (lat === 0 && lng === 0) {
      return false;
    }

    return this.limitesComunidadValenciana.contains(L.latLng(lat, lng));
  }

  private mostrarMensaje(texto: string): void {
    this.mensajeBusqueda = texto;
    this.mostrarMensajeBusqueda = true;

    if (this.timeoutMensaje) {
      clearTimeout(this.timeoutMensaje);
    }

    this.timeoutMensaje = setTimeout(() => {
      this.mostrarMensajeBusqueda = false;
    }, 3500);
  }

  cerrarMensaje(): void {
    this.mostrarMensajeBusqueda = false;
  }

  private ocultarMensaje(): void {
    this.mostrarMensajeBusqueda = false;
  }
}
