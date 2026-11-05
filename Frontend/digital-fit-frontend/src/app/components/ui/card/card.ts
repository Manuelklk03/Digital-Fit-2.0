import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-card, article[df-card], section[df-card], div[df-card]',
  template: `
    <ng-content select="[card-header], df-card-header" />
    <ng-content />
    <ng-content select="[card-footer], df-card-footer" />
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: var(--df-surface);
        border: 1px solid var(--df-border);
        border-radius: 16px;
        padding: 20px 24px;
        box-sizing: border-box;
        transition: all 0.2s ease;
        color: var(--df-text);
        font-family: var(--df-font-sans);
      }

      :host(.df-card-interactive) {
        cursor: pointer;
      }

      :host(.df-card-interactive:hover) {
        background-color: var(--df-surface-hover);
        border-color: rgba(59, 130, 246, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }
    `,
  ],
  host: {
    '[class]': 'hostClasses()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly interactive = input<boolean>(false);

  readonly hostClasses = computed(() => {
    return this.interactive() ? 'df-card-interactive' : '';
  });
}
