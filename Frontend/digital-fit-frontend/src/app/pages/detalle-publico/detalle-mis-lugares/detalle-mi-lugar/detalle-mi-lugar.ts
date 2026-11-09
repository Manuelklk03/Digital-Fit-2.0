import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MisLugaresService } from '../../../../services/publicos/mis-lugares';
import { ConfigDetalle } from '../../../lugares/config';
import { DetalleSitioComponent } from '../../../lugares/detalle-sitio';

@Component({
  selector: 'app-detalle-mi-lugar',
  imports: [DetalleSitioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-detalle-sitio [config]="config" />`,
})
export class DetalleMiLugarComponent {
  private readonly mis = inject(MisLugaresService);

  readonly config: ConfigDetalle = {
    clase: 'lugar',
    seccion: 'misLugares',
    catalogo: false,
    rutaListado: '/mis-lugares',
    cargar: (id) => this.mis.getMiLugarById(id),
    borrar: (id) => this.mis.borrarLugar(id),
  };
}
