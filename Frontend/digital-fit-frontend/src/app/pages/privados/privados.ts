import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CentroForm } from '../../models/lugar';
import { PrivadosService } from '../../services/centros/privados-service';
import { MisCentrosService } from '../../services/centros/mis-centros-service';
import { AdminCentrosPrivadosBaseService } from '../../services/admin/admin-centro-base';
import { ConfigListado } from '../lugares/config';
import { ListadoSitiosComponent } from '../lugares/listado-sitios';

@Component({
  selector: 'app-privados',
  imports: [ListadoSitiosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-listado-sitios [config]="config" />`,
})
export class PrivadosComponent {
  private readonly privados = inject(PrivadosService);
  private readonly mis = inject(MisCentrosService);
  private readonly admin = inject(AdminCentrosPrivadosBaseService);

  readonly config: ConfigListado = {
    clase: 'centro',
    seccion: 'centrosBase',
    catalogo: true,
    rutaDetalle: '/privados',
    buscar: (filtro, page) => this.privados.buscar(filtro, page),
    crear: (datos) => this.admin.crearCentroPrivadoBase(datos as CentroForm),
    actualizar: (id, datos) => this.admin.actualizarCentroPrivadoBase(id, datos as CentroForm),
    borrar: (id) => this.admin.borrarCentroPrivadoBase(id),
    anadirAMis: (id) => this.mis.anadirCentroDesdeApp(id),
  };
}
