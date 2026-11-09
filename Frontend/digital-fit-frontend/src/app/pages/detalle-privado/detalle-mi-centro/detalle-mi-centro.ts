import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MisCentrosService } from '../../../services/centros/mis-centros-service';
import { ConfigDetalle } from '../../lugares/config';
import { DetalleSitioComponent } from '../../lugares/detalle-sitio';

@Component({
  selector: 'app-detalle-mi-centro',
  imports: [DetalleSitioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-detalle-sitio [config]="config" />`,
})
export class DetalleMiCentroComponent {
  private readonly mis = inject(MisCentrosService);

  readonly config: ConfigDetalle = {
    clase: 'centro',
    seccion: 'misCentros',
    catalogo: false,
    rutaListado: '/mis-centros',
    cargar: (id) => this.mis.getMiCentroById(id),
    borrar: (id) => this.mis.borrarCentro(id),
  };
}
