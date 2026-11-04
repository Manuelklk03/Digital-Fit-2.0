import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'button[df-button], a[df-button], app-button',
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--df-font-sans);
      font-weight: 600;
      border-radius: 10px;
      transition: all 0.15s ease;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      user-select: none;
      box-sizing: border-box;
    }
    :host(:focus-visible) {
      outline: 2px solid var(--df-border-focus);
      outline-offset: 2px;
    }
    :host(:disabled), :host([aria-disabled="true"]) {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-right: 8px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Variantes */
    :host(.df-btn-primary) {
      background-color: var(--df-primary);
      color: var(--df-primary-contrast);
      border: 1px solid transparent;
    }
    :host(.df-btn-primary:hover:not(:disabled)) {
      background-color: var(--df-primary-hover);
    }

    :host(.df-btn-secondary) {
      background-color: var(--df-surface-hover);
      color: var(--df-text);
      border: 1px solid var(--df-border);
    }
    :host(.df-btn-secondary:hover:not(:disabled)) {
      background-color: var(--df-surface-active);
      border-color: var(--df-text-muted);
    }

    :host(.df-btn-outline) {
      background-color: transparent;
      color: var(--df-text);
      border: 1px solid var(--df-border);
    }
    :host(.df-btn-outline:hover:not(:disabled)) {
      background-color: var(--df-surface-hover);
      border-color: var(--df-primary);
    }

    :host(.df-btn-ghost) {
      background-color: transparent;
      color: var(--df-text-muted);
      border: 1px solid transparent;
    }
    :host(.df-btn-ghost:hover:not(:disabled)) {
      background-color: var(--df-surface-hover);
      color: var(--df-text);
    }

    :host(.df-btn-danger) {
      background-color: transparent;
      color: var(--df-danger);
      border: 1px solid rgba(239, 68, 68, 0.4);
    }
    :host(.df-btn-danger:hover:not(:disabled)) {
      background-color: rgba(239, 68, 68, 0.1);
      border-color: var(--df-danger);
    }

    /* Tamaños */
    :host(.df-btn-sm) {
      font-size: 12px;
      padding: 6px 12px;
      min-height: 32px;
    }
    :host(.df-btn-md) {
      font-size: 14px;
      padding: 9px 16px;
      min-height: 40px;
    }
    :host(.df-btn-lg) {
      font-size: 16px;
      padding: 12px 22px;
      min-height: 48px;
    }
  `],
  host: {
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'disabled() ? true : null',
    '[attr.aria-disabled]': 'disabled() ? true : null',
    '[attr.aria-busy]': 'loading() ? true : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);

  readonly hostClasses = computed(() => {
    return `df-btn-${this.variant()} df-btn-${this.size()}`;
  });
}
