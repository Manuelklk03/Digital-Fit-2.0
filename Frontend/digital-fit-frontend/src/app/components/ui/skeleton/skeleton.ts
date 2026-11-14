import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Bloque gris con brillo que ocupa el sitio del contenido mientras carga. Decorativo: el aviso accesible va aparte. */
@Component({
  selector: 'div[df-skeleton], app-skeleton',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.height]': 'alto()',
  },
  styles: [
    `
      :host {
        display: block;
        border-radius: 12px;
        border: 1px solid var(--df-border);
        background: linear-gradient(
          90deg,
          var(--df-surface) 25%,
          var(--df-surface-hover) 50%,
          var(--df-surface) 75%
        );
        background-size: 200% 100%;
        animation: df-skeleton-brillo 1.4s ease-in-out infinite;
      }

      @keyframes df-skeleton-brillo {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          animation: none;
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  /** Altura CSS del bloque. */
  readonly alto = input('88px');
}
