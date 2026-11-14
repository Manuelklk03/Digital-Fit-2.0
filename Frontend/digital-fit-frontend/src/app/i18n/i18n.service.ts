import { Injectable, computed, signal } from '@angular/core';
import { DiccionarioTraduccion, IDIOMAS_DISPONIBLES, Idioma, InfoIdioma } from './i18n.types';
import { diccionarioEs } from './diccionarios/es';
import { diccionarioCa } from './diccionarios/ca';
import { diccionarioEn } from './diccionarios/en';
import { diccionarioFr } from './diccionarios/fr';

const STORAGE_KEY = 'digitalfit_lang';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly diccionarios: Record<Idioma, DiccionarioTraduccion> = {
    es: diccionarioEs,
    ca: diccionarioCa,
    en: diccionarioEn,
    fr: diccionarioFr,
  };

  private readonly idiomaSignal = signal<Idioma>(this.detectarIdiomaInicial());

  /** Idioma actual como Signal de solo lectura */
  readonly idiomaActual = this.idiomaSignal.asReadonly();

  /** Diccionario de traducciones reactivo al idioma activo */
  readonly t = computed<DiccionarioTraduccion>(() => this.diccionarios[this.idiomaSignal()]);

  /** Lista de idiomas disponibles */
  readonly idiomas: readonly InfoIdioma[] = IDIOMAS_DISPONIBLES;

  /** Metadatos del idioma activo */
  readonly infoIdiomaActual = computed<InfoIdioma>(
    () => this.idiomas.find((i) => i.codigo === this.idiomaSignal()) ?? this.idiomas[0],
  );

  constructor() {
    this.sincronizarAtributoDocumento(this.idiomaSignal());
  }

  /**
   * Cambia el idioma activo de la aplicación.
   * Guarda la preferencia en localStorage y actualiza <html lang="...">.
   */
  cambiarIdioma(nuevoIdioma: Idioma): void {
    if (this.idiomaSignal() === nuevoIdioma) {
      return;
    }
    this.idiomaSignal.set(nuevoIdioma);
    this.guardarEnAlmacenamiento(nuevoIdioma);
    this.sincronizarAtributoDocumento(nuevoIdioma);
  }

  /**
   * Determina el idioma inicial basándose en almacenamiento local o español por defecto (D11).
   */
  private detectarIdiomaInicial(): Idioma {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const guardado = window.localStorage.getItem(STORAGE_KEY) as Idioma | null;
        if (guardado && this.esIdiomaValido(guardado)) {
          return guardado;
        }
      } catch {
        // En entornos donde localStorage lance SecurityError o no esté disponible
      }
    }
    return 'es';
  }

  private esIdiomaValido(idioma: string): idioma is Idioma {
    return IDIOMAS_DISPONIBLES.some((i) => i.codigo === idioma);
  }

  private guardarEnAlmacenamiento(idioma: Idioma): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, idioma);
      } catch {
        // Ignorar excepciones de almacenamiento
      }
    }
  }

  private sincronizarAtributoDocumento(idioma: Idioma): void {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = idioma;
    }
  }
}
