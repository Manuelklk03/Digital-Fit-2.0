import type { Categoria, Nivel, TipoUbicacionHistorial } from '../models/entrenamiento';

export type Idioma = 'es' | 'ca' | 'en' | 'fr';

export interface InfoIdioma {
  codigo: Idioma;
  etiqueta: string;
  abreviatura: string;
  bandera: string;
}

export const IDIOMAS_DISPONIBLES: readonly InfoIdioma[] = [
  { codigo: 'es', etiqueta: 'Español', abreviatura: 'ES', bandera: '🇪🇸' },
  { codigo: 'ca', etiqueta: 'Valencià', abreviatura: 'VA', bandera: '🦇' },
  { codigo: 'en', etiqueta: 'English', abreviatura: 'EN', bandera: '🇬🇧' },
  { codigo: 'fr', etiqueta: 'Français', abreviatura: 'FR', bandera: '🇫🇷' },
];

export interface DiccionarioTraduccion {
  nav: {
    inicio: string;
    explorar: string;
    entrenar: string;
    misEntrenamientos: string;
    misCentros: string;
    misLugares: string;
    crearAdmin: string;
  };
  header: {
    marcaSubtexto: string;
    sesionNoIniciada: string;
    accedeParaContinuar: string;
    entrar: string;
    salir: string;
    cambiarIdioma: string;
    idiomaSeleccionado: string;
  };
  inicio: {
    badge: string;
    heroTitulo: string;
    heroSubtitulo: string;
    ctaEmpezar: string;
    ctaExplorar: string;
    metricasRutinas: string;
    metricasInstalaciones: string;
    metricasEnVivo: string;
    metricasCodigoLibre: string;
    seccionAsistenteTitulo: string;
    seccionAsistenteDesc: string;
    ejercicioActual: string;
    serie: string;
    peso: string;
    reps: string;
    completarSerie: string;
    descansoEnCurso: string;
    segundos: string;
    seccionRadarTitulo: string;
    seccionRadarDesc: string;
    distanciaHaversine: string;
    ctaVerMapa: string;
    seccionComunidadTitulo: string;
    seccionComunidadDesc: string;
    ctaUnirse: string;
    instalacionGimnasio: string;
    instalacionCalistenia: string;
    instalacionPiscina: string;
    instalacionPolideportivo: string;
    tarjeta1Titulo: string;
    tarjeta1Desc: string;
    tarjeta2Titulo: string;
    tarjeta2Desc: string;
    tarjeta3Titulo: string;
    tarjeta3Desc: string;
    ctaFinalTitulo: string;
    ctaFinalDesc: string;
  };
  comun: {
    cargando: string;
    error: string;
    volver: string;
    guardar: string;
    cancelar: string;
  };
  auth: {
    loginBadge: string;
    loginTitulo: string;
    loginSubtitulo: string;
    usuarioLabel: string;
    usuarioPlaceholder: string;
    contrasenaLabel: string;
    contrasenaPlaceholder: string;
    botonEntrar: string;
    botonEntrando: string;
    sinCuenta: string;
    enlaceRegistro: string;
    demoTitulo: string;
    demoUsuario: string;
    demoAdmin: string;
    demoClickLlenar: string;
    errorCamposObligatorios: string;
    errorCredenciales: string;
    errorSesion: string;
    exitoLogin: string;
    registroBadge: string;
    registroTitulo: string;
    registroSubtitulo: string;
    emailLabel: string;
    emailPlaceholder: string;
    botonRegistrar: string;
    botonRegistrando: string;
    conCuenta: string;
    enlaceLogin: string;
    errorEmailInvalido: string;
    errorContrasenaCorta: string;
    errorRegistro: string;
    exitoRegistro: string;
  };
  entrenamientos: DiccionarioEntrenamientos;
}

/** Textos del recorrido de entrenamientos (catálogo, mis entrenamientos, comunidad, historial y detalles). */
export interface DiccionarioEntrenamientos {
  categorias: Record<Categoria, string>;
  niveles: Record<Nivel, string>;
  minutos: string;
  campoNombre: string;
  campoCategoria: string;
  campoNivel: string;
  campoDuracion: string;
  campoDescripcion: string;
  filtrarPor: string;
  filtroDuracionMax: string;
  valorFiltro: string;
  nombrePlaceholder: string;
  seleccionar: string;
  botonBuscar: string;
  botonLimpiar: string;
  anadirAMis: string;
  editar: string;
  borrar: string;
  nuevo: string;
  cerrarFormulario: string;
  crear: string;
  guardarCambios: string;
  cancelarEdicion: string;
  guardando: string;
  errorNombre: string;
  errorDescripcion: string;
  errorDuracion: string;
  total: string;
  cargandoListado: string;
  errorCarga: string;
  reintentar: string;
  vacioFiltro: string;
  paginacion: string;
  paginaAnterior: string;
  paginaSiguiente: string;
  pagina: string;
  de: string;
  confirmarBorrado: string;
  exitoAnadido: string;
  errorAnadir: string;
  exitoCreado: string;
  exitoActualizado: string;
  exitoBorrado: string;
  errorGuardar: string;
  errorBorrar: string;
  volverListado: string;
  errorDetalle: string;
  sinDescripcion: string;
  catalogo: {
    badge: string;
    titulo: string;
    subtitulo: string;
    vacio: string;
    formCrear: string;
    formEditar: string;
  };
  mis: {
    badge: string;
    titulo: string;
    subtitulo: string;
    vacio: string;
    irCatalogo: string;
    formCrear: string;
    marcarRealizado: string;
    exitoRealizado: string;
    errorRealizado: string;
    verHistorial: string;
  };
  comunidad: {
    badge: string;
    titulo: string;
    subtitulo: string;
    vacio: string;
    formCrear: string;
    formEditar: string;
    publicar: string;
    tuyo: string;
    autor: string;
    publicado: string;
  };
  historial: {
    badge: string;
    titulo: string;
    subtitulo: string;
    vacio: string;
    formCrear: string;
    campoEntrenamiento: string;
    campoUbicacion: string;
    campoFecha: string;
    campoNotas: string;
    notasPlaceholder: string;
    seleccionaEntrenamiento: string;
    sinUbicacion: string;
    grupoBase: string;
    grupoMios: string;
    grupoLugaresBase: string;
    grupoMisLugares: string;
    grupoCentrosBase: string;
    grupoMisCentros: string;
    guardarRegistro: string;
    errorEntrenamiento: string;
    errorFecha: string;
    exitoRegistro: string;
    errorRegistro: string;
    exitoBorrado: string;
    errorBorrar: string;
    confirmarBorrado: string;
    tipoBase: string;
    tipoMio: string;
    tiposUbicacion: Record<TipoUbicacionHistorial, string>;
    sinNotas: string;
    tipoEntrenamiento: string;
    tipoUbicacion: string;
    errorDetalle: string;
    tituloDetalle: string;
  };
}
