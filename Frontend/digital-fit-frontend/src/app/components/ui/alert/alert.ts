import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type AlertType = 'exito' | 'error' | 'info';

@Component({
  selector: 'app-alert',
  template: `
    <div
      class="df-alerta"
      [class.df-alerta-error]="tipo() === 'error'"
      [class.df-alerta-exito]="tipo() === 'exito'"
      role="alert"
      aria-live="polite"
    >
      <div class="df-alerta-cuerpo">
        @if (tipo() === 'error') {
          <svg
            class="df-alerta-icono"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        } @else {
          <svg
            class="df-alerta-icono"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        <div class="df-alerta-texto">
          <ng-content />
        </div>
      </div>
      <button
        type="button"
        class="df-alerta-cerrar"
        (click)="cerrar.emit()"
        aria-label="Cerrar notificación"
      >
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="df-alerta-icono-cerrar"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .df-alerta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-radius: 12px;
        font-family: var(--df-font-sans);
        font-size: 13px;
        line-height: 1.4;
        box-sizing: border-box;
      }

      .df-alerta-error {
        background-color: #2b1114;
        border: 1px solid #7f1d1d;
        color: #fecaca;
      }

      .df-alerta-exito {
        background-color: #0d2818;
        border: 1px solid #065f46;
        color: #a7f3d0;
      }

      .df-alerta-cuerpo {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .df-alerta-icono {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      .df-alerta-texto {
        font-weight: 500;
      }

      .df-alerta-cerrar {
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        opacity: 0.8;
        transition: opacity 0.15s ease;
      }

      .df-alerta-cerrar:hover {
        opacity: 1;
      }

      .df-alerta-icono-cerrar {
        width: 16px;
        height: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  readonly tipo = input<AlertType>('info');
  readonly cerrar = output<void>();
}
