import { afterNextRender, computed, DestroyRef, inject, Injector, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { PaginaResponse } from '../../../models/pagina-response';
import { AlertType } from '../../../components/ui';

export type EstadoCarga = 'cargando' | 'listo' | 'error';

/**
 * Estado de un listado paginado con signals (carga, error, página actual).
 * Se crea en un inicializador de campo del componente, porque usa `inject(DestroyRef)`.
 */
export class ListadoPaginado<T> {
  readonly pagina = signal<PaginaResponse<T> | null>(null);
  readonly estado = signal<EstadoCarga>('cargando');
  /** Recarga con datos ya visibles: se mantienen en pantalla (y el foco) y solo se marca `aria-busy`. */
  readonly recargando = signal(false);
  readonly items = computed(() => this.pagina()?.content ?? []);
  private sub?: Subscription;
  private paginaPedida = 0;

  constructor(private readonly fuente: (page: number) => Observable<PaginaResponse<T>>) {
    inject(DestroyRef).onDestroy(() => this.sub?.unsubscribe());
  }

  cargar(page = 0): void {
    this.sub?.unsubscribe();
    this.paginaPedida = page;
    if (this.estado() === 'listo') {
      this.recargando.set(true);
    } else {
      this.estado.set('cargando');
    }
    this.sub = this.fuente(page).subscribe({
      next: (p) => {
        // Tras borrar el último elemento de la última página, retrocede una.
        if (p.content.length === 0 && p.page > 0) {
          this.cargar(p.page - 1);
          return;
        }
        this.pagina.set(p);
        this.estado.set('listo');
        this.recargando.set(false);
      },
      error: () => {
        this.estado.set('error');
        this.recargando.set(false);
      },
    });
  }

  recargar(): void {
    this.cargar(this.paginaPedida);
  }
}

/** Enfoca, tras el siguiente render, el primer elemento que coincida con el selector (por defecto, en todo el documento). */
export function enfocarTrasRender(injector: Injector, selector: string, raiz: () => ParentNode = () => document): void {
  afterNextRender(() => raiz().querySelector<HTMLElement>(selector)?.focus(), { injector });
}

/** Mensaje en línea: los de éxito se ocultan solos; los de error quedan hasta cerrarlos. */
export class Aviso {
  readonly actual = signal<{ texto: string; tipo: AlertType } | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  mostrar(texto: string, tipo: AlertType): void {
    clearTimeout(this.temporizador);
    this.actual.set({ texto, tipo });
    if (tipo === 'exito') {
      this.temporizador = setTimeout(() => this.actual.set(null), 4500);
    }
  }

  cerrar(): void {
    clearTimeout(this.temporizador);
    this.actual.set(null);
  }
}
