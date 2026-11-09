import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LugarForm } from '../../../models/lugar';
import { MisLugaresService } from '../../../services/publicos/mis-lugares';
import { ConfigListado } from '../../lugares/config';
import { ListadoSitiosComponent } from '../../lugares/listado-sitios';

@Component({
  selector: 'app-mis-lugares',
  imports: [ListadoSitiosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-listado-sitios [config]="config" />`,
})
export class MisLugaresComponent {
  private readonly mis = inject(MisLugaresService);

  readonly config: ConfigListado = {
    clase: 'lugar',
    seccion: 'misLugares',
    catalogo: false,
    rutaDetalle: '/mis-lugares',
    rutaCatalogo: '/publicos',
    buscar: (filtro, page) => this.mis.buscar(filtro, page),
    crear: (datos) => this.mis.crearLugarDesdeMaps(datos as LugarForm),
    borrar: (id) => this.mis.borrarLugar(id),
    autocompletar: (latitud, longitud) => this.mis.autocompletarDatosLugar(latitud, longitud),
  };
}
