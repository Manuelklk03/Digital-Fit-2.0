/** Tipos del enum `TipoLugarPublico` del backend, en el mismo orden. */
export const TIPOS_LUGAR = [
  'PISTA_PADEL',
  'PISTA_TENIS',
  'PISTA_FRONTON',
  'PISTA_FUTBOL',
  'PISTA_BALONCESTO',
  'PISTA_VOLEIBOL',
  'CAMPO_RUGBY',
  'RUTA_RUNNING',
  'CIRCUITO_CICLISMO',
  'CARRIL_BICI',
  'PARQUE_CALISTENIA',
  'ZONA_BARRAS',
  'CIRCUITO_BIOSALUDABLE',
  'RUTA_SENDERISMO',
  'ZONA_MONTAÑA',
  'RUTA_FLUVIAL',
  'PLAYA_DEPORTIVA',
  'ZONA_VOLEY_PLAYA',
  'ZONA_MULTIDEPORTE',
  'PARQUE_PUBLICO',
  'PISCINA_PUBLICA',
  'ZONA_REMAR',
] as const;

export type TipoLugar = (typeof TIPOS_LUGAR)[number];

/** Centro privado (gimnasio...) o lugar público (pista, parque...). */
export type ClaseSitio = 'centro' | 'lugar';

interface SitioComun {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  horario: string | null;
  descripcion: string | null;
  latitud: number | null;
  longitud: number | null;
}

/** `CentroPrivadoBaseDTO` / `CentroPrivadoUsuarioDTO` (el base trae además `osmId`). */
export interface CentroPrivado extends SitioComun {
  osmId?: number | null;
  precioMensual: number | null;
}

/** `LugarPublicoBaseDTO` / `LugarPublicoUsuarioDTO`. */
export interface LugarPublico extends SitioComun {
  osmId?: number | null;
  tipo: TipoLugar;
}

export type Sitio = CentroPrivado | LugarPublico;

/** Cuerpo de `CrearCentroPrivadoDTO`. */
export type CentroForm = Omit<CentroPrivado, 'id' | 'osmId' | 'latitud' | 'longitud'> & {
  latitud: number;
  longitud: number;
};

/** Cuerpo de `CrearLugarPublicoDTO`. */
export type LugarForm = Omit<LugarPublico, 'id' | 'osmId' | 'latitud' | 'longitud'> & {
  latitud: number;
  longitud: number;
};

export type SitioForm = CentroForm | LugarForm;

/** Respuesta de `/autocompletar` (centros y lugares); los campos que no se encuentran llegan a `null`. */
export interface Autocompletado {
  direccion: string | null;
  telefono: string | null;
  horario: string | null;
  descripcion: string | null;
  precioMensual?: number | null;
  tipo?: TipoLugar | null;
  latitud: number | null;
  longitud: number | null;
  datosEncontrados: boolean;
}

/** `GeocodificacionResultadoDTO` de `/api/explorar/geocodificar`. */
export interface ResultadoGeocodificacion {
  nombre: string;
  direccionCompleta: string;
  latitud: number;
  longitud: number;
  tipo: string;
}

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

/** El backend aplica un único filtro por petición: nombre > dirección > precio máximo / tipo. */
export type CampoFiltroSitio = 'nombre' | 'direccion' | 'precioMensual' | 'tipo';

export interface FiltroSitio {
  campo: CampoFiltroSitio;
  valor: string;
}

/** Centro de Valencia: posición inicial del selector de mapa. */
export const UBICACION_INICIAL: Coordenadas = { latitud: 39.4699, longitud: -0.3763 };

export function esLugarPublico(sitio: Sitio): sitio is LugarPublico {
  return 'tipo' in sitio;
}

/** Coordenadas legibles con 5 decimales (~1 m), o `null` si faltan. */
export function coordenadasLegibles(
  latitud: number | null,
  longitud: number | null,
): string | null {
  return latitud == null || longitud == null
    ? null
    : `${latitud.toFixed(5)}, ${longitud.toFixed(5)}`;
}
