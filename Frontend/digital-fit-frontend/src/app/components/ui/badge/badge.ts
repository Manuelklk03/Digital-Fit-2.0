import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'warning' | 'danger';
export type BadgeStyle = 'subtle' | 'outline' | 'solid';

@Component({
  selector: 'span[df-badge], div[df-badge], app-badge',
  template: `
    @if (dot()) {
      <span class="badge-dot" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--df-font-sans);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 9999px;
        line-height: 1;
        white-space: nowrap;
        user-select: none;
        box-sizing: border-box;
      }

      .badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: currentColor;
      }

      /* Subtle variants (fondo tintado suave + borde sutil) */
      :host(.df-badge-subtle-neutral) {
        background-color: var(--df-surface-hover);
        color: var(--df-text-muted);
        border: 1px solid var(--df-border);
      }
      :host(.df-badge-subtle-primary) {
        background-color: rgba(59, 130, 246, 0.15);
        color: #60a5fa; /* var(--df-primary) da ~4:1 sobre el fondo tintado; este tono supera AA */
        border: 1px solid rgba(59, 130, 246, 0.35);
      }
      :host(.df-badge-subtle-accent) {
        background-color: rgba(16, 185, 129, 0.15);
        color: var(--df-accent);
        border: 1px solid rgba(16, 185, 129, 0.35);
      }
      :host(.df-badge-subtle-warning) {
        background-color: rgba(245, 158, 11, 0.15);
        color: var(--df-warning);
        border: 1px solid rgba(245, 158, 11, 0.35);
      }
      :host(.df-badge-subtle-danger) {
        background-color: rgba(239, 68, 68, 0.15);
        color: #f87171; /* var(--df-danger) da ~4:1 sobre el fondo tintado; este tono supera AA */
        border: 1px solid rgba(239, 68, 68, 0.35);
      }

      /* Solid variants */
      :host(.df-badge-solid-neutral) {
        background-color: var(--df-surface-active);
        color: var(--df-text);
        border: 1px solid transparent;
      }
      :host(.df-badge-solid-primary) {
        background-color: var(--df-primary);
        color: #fff;
        border: 1px solid transparent;
      }
      :host(.df-badge-solid-accent) {
        background-color: var(--df-accent);
        color: #fff;
        border: 1px solid transparent;
      }
      :host(.df-badge-solid-warning) {
        background-color: var(--df-warning);
        color: #000;
        border: 1px solid transparent;
      }
      :host(.df-badge-solid-danger) {
        background-color: var(--df-danger);
        color: #fff;
        border: 1px solid transparent;
      }

      /* Outline variants */
      :host(.df-badge-outline-neutral) {
        background-color: transparent;
        color: var(--df-text-muted);
        border: 1px solid var(--df-border);
      }
      :host(.df-badge-outline-primary) {
        background-color: transparent;
        color: var(--df-primary);
        border: 1px solid var(--df-primary);
      }
      :host(.df-badge-outline-accent) {
        background-color: transparent;
        color: var(--df-accent);
        border: 1px solid var(--df-accent);
      }
      :host(.df-badge-outline-warning) {
        background-color: transparent;
        color: var(--df-warning);
        border: 1px solid var(--df-warning);
      }
      :host(.df-badge-outline-danger) {
        background-color: transparent;
        color: var(--df-danger);
        border: 1px solid var(--df-danger);
      }
    `,
  ],
  host: {
    '[class]': 'hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly badgeStyle = input<BadgeStyle>('subtle');
  readonly dot = input<boolean>(false);

  readonly hostClasses = computed(() => {
    return `df-badge-${this.badgeStyle()}-${this.variant()}`;
  });
}
