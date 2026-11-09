import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PrivadosService } from '../../services/centros/privados-service';
import { MisCentrosService } from '../../services/centros/mis-centros-service';
import { AdminCentrosPrivadosBaseService } from '../../services/admin/admin-centro-base';
import { ConfigDetalle } from '../lugares/config';
import { DetalleSitioComponent } from '../lugares/detalle-sitio';

@Component({
  selector: 'app-detalle-privado',
  imports: [DetalleSitioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-detalle-sitio [config]="config" />`,
})
export class DetallePrivadoComponent {
  private readonly privados = inject(PrivadosService);
  private readonly mis = inject(MisCentrosService);
  private readonly admin = inject(AdminCentrosPrivadosBaseService);

  readonly config: ConfigDetalle = {
    clase: 'centro',
    seccion: 'centrosBase',
    catalogo: true,
    rutaListado: '/privados',
    cargar: (id) => this.privados.getCentroPrivadoById(id),
    borrar: (id) => this.admin.borrarCentroPrivadoBase(id),
    anadirAMis: (id) => this.mis.anadirCentroDesdeApp(id),
  };
}
