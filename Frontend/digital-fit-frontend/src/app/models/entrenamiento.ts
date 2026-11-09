/** Tipos del dominio de entrenamientos, copiados de los DTO del backend (`dto/Entrenamientos`). */

export const CATEGORIAS = [
  'FUERZA_TREN_SUPERIOR', 'FUERZA_TREN_INFERIOR', 'FUERZA_CORE', 'FUERZA_TOTAL',
  'CARDIO_SUAVE', 'CARDIO_INTENSO', 'HIIT', 'RESISTENCIA',
  'CALISTENIA_BASICA', 'CALISTENIA_AVANZADA', 'CALISTENIA_FULL_BODY',
  'ENTRENAMIENTO_FUNCIONAL', 'CIRCUITO_FUNCIONAL',
  'MOVILIDAD', 'FLEXIBILIDAD', 'ESTIRAMIENTOS',
  'RUNNING', 'TRAIL_RUNNING', 'CICLISMO',
  'BOXEO', 'ARTES_MARCIALES', 'CROSSFIT',
  'EQUILIBRIO', 'COORDINACION', 'RECUPERACION',
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const NIVELES = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO'] as const;
export type Nivel = (typeof NIVELES)[number];

/** Campos comunes de entrenamientos base, propios y de comunidad. */
export interface Entrenamiento {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  nivel: Nivel;
  duracionEnMinutos: number;
}

export type EntrenamientoBase = Entrenamiento;
export type EntrenamientoUsuario = Entrenamiento;

export interface EntrenamientoComunidad extends Entrenamiento {
  /** Nombre de usuario del autor. */
  usuario: string;
  /** Formato `yyyy-MM-dd HH:mm:ss`. */
  fechaPublicacion: string;
}

/** Cuerpo de creación y edición (CrearEntrenamientoUsuario, CrearEntrenamientoComunidadDTO, CrearEntrenamientoBaseDTO). */
export type EntrenamientoForm = Omit<Entrenamiento, 'id'>;

export type TipoEntrenamientoHistorial = 'ENTRENAMIENTO_BASE' | 'MI_ENTRENAMIENTO';
export type TipoUbicacionHistorial =
  | 'LUGAR_PUBLICO_BASE'
  | 'MI_LUGAR_PUBLICO'
  | 'CENTRO_PRIVADO_BASE'
  | 'MI_CENTRO_PRIVADO';

export interface HistorialEntrenamiento {
  id: number;
  entrenamiento: string;
  tipoEntrenamiento: TipoEntrenamientoHistorial | null;
  ubicacion: string | null;
  tipoUbicacion: TipoUbicacionHistorial | null;
  /** Formato `yyyy-MM-dd HH:mm:ss`. */
  fecha: string;
  duracionEnMinutos: number;
  notas: string | null;
}

export interface CrearHistorial {
  entrenamientoBaseId: number | null;
  entrenamientoUsuarioId: number | null;
  lugarPublicoBaseId: number | null;
  lugarPublicoUsuarioId: number | null;
  centroPrivadoBaseId: number | null;
  centroPrivadoUsuarioId: number | null;
  fecha: string;
  duracionEnMinutos: number;
  notas: string;
}

/** El backend aplica un único filtro por petición (categoría > nivel > duración > nombre). */
export type CampoFiltro = 'nombre' | 'categoria' | 'nivel' | 'duracionEnMinutos';
export interface FiltroEntrenamiento {
  campo: CampoFiltro;
  valor: string;
}

/** Usuario de sesión (`UsuarioSesionDTO`). */
export interface UsuarioSesion {
  username: string;
  email: string;
  rol: 'USER' | 'ADMIN';
}

/** Fecha `yyyy-MM-dd HH:mm:ss` del backend a texto legible en el idioma activo. */
export function fechaLegible(fecha: string | null | undefined, idioma: string): string {
  if (!fecha) {
    return '';
  }
  const d = new Date(fecha.replace(' ', 'T'));
  return Number.isNaN(d.getTime())
    ? fecha
    : d.toLocaleString(idioma, { dateStyle: 'medium', timeStyle: 'short' });
}

/** Filtro de pantalla a parámetros de consulta (vacío si no hay valor). */
export function aParametros(filtro: { campo: string; valor: string } | null): Record<string, string> {
  const valor = filtro?.valor.trim();
  return filtro && valor ? { [filtro.campo]: valor } : {};
}

/** Fecha local actual en el formato que espera el backend. */
export function fechaParaBackend(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
