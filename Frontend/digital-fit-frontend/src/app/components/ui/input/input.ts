import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'input[df-input], textarea[df-input], select[df-input], app-input',
  template: '<ng-content />',
  styles: [`
    :host {
      display: block;
      width: 100%;
      background-color: rgba(13, 17, 23, 0.75);
      color: var(--df-text);
      font-family: var(--df-font-sans);
      border: 1px solid var(--df-border);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.5;
      transition: all 0.15s ease;
      box-sizing: border-box;
    }

    :host::placeholder {
      color: var(--df-text-subtle);
      opacity: 0.8;
    }

    :host(:focus) {
      outline: none;
      border-color: var(--df-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      background-color: var(--df-surface);
    }

    :host(:disabled) {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--df-surface-hover);
    }

    /* Estados de error */
    :host(.df-input-error) {
      border-color: var(--df-danger);
    }
    :host(.df-input-error:focus) {
      border-color: var(--df-danger);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    /* Tamaños */
    :host(.df-input-sm) {
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 8px;
    }
    :host(.df-input-md) {
      padding: 10px 14px;
      font-size: 14px;
      border-radius: 12px;
    }
    :host(.df-input-lg) {
      padding: 14px 18px;
      font-size: 16px;
      border-radius: 14px;
    }
  `],
  host: {
    '[class]': 'hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDirective {
  readonly size = input<InputSize>('md');
  readonly error = input<boolean>(false);

  readonly hostClasses = computed(() => {
    const errorClass = this.error() ? 'df-input-error' : '';
    return `df-input-${this.size()} ${errorClass}`.trim();
  });
}
