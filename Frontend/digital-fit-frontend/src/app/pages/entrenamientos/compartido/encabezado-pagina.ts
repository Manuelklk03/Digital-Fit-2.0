import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '../../../components/ui';
import { MigasComponent } from '../../../components/migas/migas';

/** Cabecera de página: etiqueta, título, subtítulo y acciones proyectadas a la derecha. */
@Component({
  selector: 'app-encabezado-pagina',
  imports: [BadgeComponent, MigasComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pagina.css',
  template: `
    <header class="encabezado">
      <div class="encabezado-texto">
        <app-migas />
        <span df-badge variant="primary" [dot]="true">{{ badge() }}</span>
        <h1>{{ titulo() }}</h1>
        <p>{{ subtitulo() }}</p>
      </div>
      <ng-content />
    </header>
  `,
})
export class EncabezadoPaginaComponent {
  readonly badge = input.required<string>();
  readonly titulo = input.required<string>();
  readonly subtitulo = input.required<string>();
}
