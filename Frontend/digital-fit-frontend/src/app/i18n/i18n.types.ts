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
    panelSoporte: string;
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
    metricasActivos: string;
    metricasInstalaciones: string;
    metricasLatencia: string;
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
}
