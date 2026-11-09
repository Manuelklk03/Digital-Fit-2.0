import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PublicosService } from '../../../services/publicos/publicos-service';
import { MisLugaresService } from '../../../services/publicos/mis-lugares';
import { AdminLugaresPublicosBaseService } from '../../../services/admin/admin-lugarespublicos-base';
import { ConfigDetalle } from '../../lugares/config';
import { DetalleSitioComponent } from '../../lugares/detalle-sitio';

@Component({
  selector: 'app-detalle-publico',
  imports: [DetalleSitioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-detalle-sitio [config]="config" />`,
})
export class DetallePublicoComponent {
  private readonly publicos = inject(PublicosService);
  private readonly mis = inject(MisLugaresService);
  private readonly admin = inject(AdminLugaresPublicosBaseService);

  readonly config: ConfigDetalle = {
    clase: 'lugar',
    seccion: 'lugaresBase',
    catalogo: true,
    rutaListado: '/publicos',
    cargar: (id) => this.publicos.getLugarPublicoById(id),
    borrar: (id) => this.admin.borrarLugarPublicoBase(id),
    anadirAMis: (id) => this.mis.anadirLugarDesdeBase(id),
  };
}
