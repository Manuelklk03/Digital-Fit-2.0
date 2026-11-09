import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LugarForm } from '../../models/lugar';
import { PublicosService } from '../../services/publicos/publicos-service';
import { MisLugaresService } from '../../services/publicos/mis-lugares';
import { AdminLugaresPublicosBaseService } from '../../services/admin/admin-lugarespublicos-base';
import { ConfigListado } from '../lugares/config';
import { ListadoSitiosComponent } from '../lugares/listado-sitios';

@Component({
  selector: 'app-publicos',
  imports: [ListadoSitiosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-listado-sitios [config]="config" />`,
})
export class PublicosComponent {
  private readonly publicos = inject(PublicosService);
  private readonly mis = inject(MisLugaresService);
  private readonly admin = inject(AdminLugaresPublicosBaseService);

  readonly config: ConfigListado = {
    clase: 'lugar',
    seccion: 'lugaresBase',
    catalogo: true,
    rutaDetalle: '/publicos',
    buscar: (filtro, page) => this.publicos.buscar(filtro, page),
    crear: (datos) => this.admin.crearLugarPublicoBase(datos as LugarForm),
    actualizar: (id, datos) => this.admin.actualizarLugarPublicoBase(id, datos as LugarForm),
    borrar: (id) => this.admin.borrarLugarPublicoBase(id),
    anadirAMis: (id) => this.mis.anadirLugarDesdeBase(id),
  };
}
