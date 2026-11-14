/** `EstadisticaUsuarioDTO` de `GET /api/estadisticas`. */
export interface EstadisticaUsuario {
  entrenamientosRealizados: number;
  minutosEntrenados: number;
  promedioMinutosEntrenamiento: number | null;
  centrosPrivadosVisitados: number;
  lugaresPublicosVisitados: number;
  /** El backend manda `null` o "N/A" si aún no hay historial. */
  entrenamientoMasRealizado: string | null;
}

/** Enum `TipoDeValoracion` del backend. */
export const TIPOS_VALORACION = [
  'ENTRENAMIENTO_BASE',
  'ENTRENAMIENTO_USUARIO',
  'HISTORIAL_ENTRENAMIENTO',
  'ENTRENAMIENTO_COMUNIDAD',
  'CENTRO_PRIVADO_BASE',
  'CENTRO_PRIVADO_USUARIO',
  'LUGAR_PUBLICO_BASE',
  'LUGAR_PUBLICO_USUARIO',
] as const;

export type TipoValoracion = (typeof TIPOS_VALORACION)[number];

/** Categorías que acepta `GET /api/valoraciones/publicas?categoria=`. */
export const CATEGORIAS_VALORACION = [
  'ENTRENAMIENTOS',
  'CENTROS_PRIVADOS',
  'LUGARES_PUBLICOS',
] as const;

export type CategoriaValoracion = (typeof CATEGORIAS_VALORACION)[number];

/** `ValoracionDTO`. */
export interface Valoracion {
  id: number;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
  tipoDeValoracion: TipoValoracion;
  contenidoId: number;
  contenidoNombre: string | null;
  usuarioId: number;
  username: string;
}

/** Cuerpo de `CrearValoracionDTO` (la fecha la pone el backend). */
export interface CrearValoracion {
  puntuacion: number;
  comentario: string | null;
}

/** Tipos de contenido de cada categoría, en el orden en que se ofrecen al valorar. */
export const TIPOS_POR_CATEGORIA: Record<CategoriaValoracion, TipoValoracion[]> = {
  ENTRENAMIENTOS: [
    'ENTRENAMIENTO_BASE',
    'ENTRENAMIENTO_USUARIO',
    'HISTORIAL_ENTRENAMIENTO',
    'ENTRENAMIENTO_COMUNIDAD',
  ],
  CENTROS_PRIVADOS: ['CENTRO_PRIVADO_BASE', 'CENTRO_PRIVADO_USUARIO'],
  LUGARES_PUBLICOS: ['LUGAR_PUBLICO_BASE', 'LUGAR_PUBLICO_USUARIO'],
};

export function categoriaDeTipo(tipo: TipoValoracion): CategoriaValoracion {
  return (Object.keys(TIPOS_POR_CATEGORIA) as CategoriaValoracion[]).find((c) =>
    TIPOS_POR_CATEGORIA[c].includes(tipo),
  )!;
}
