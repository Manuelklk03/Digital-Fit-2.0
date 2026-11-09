import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CentroForm } from '../../../models/lugar';
import { MisCentrosService } from '../../../services/centros/mis-centros-service';
import { ConfigListado } from '../../lugares/config';
import { ListadoSitiosComponent } from '../../lugares/listado-sitios';

@Component({
  selector: 'app-mis-centros',
  imports: [ListadoSitiosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-listado-sitios [config]="config" />`,
})
export class MisCentrosComponent {
  private readonly mis = inject(MisCentrosService);

  readonly config: ConfigListado = {
    clase: 'centro',
    seccion: 'misCentros',
    catalogo: false,
    rutaDetalle: '/mis-centros',
    rutaCatalogo: '/privados',
    buscar: (filtro, page) => this.mis.buscar(filtro, page),
    crear: (datos) => this.mis.crearCentroDesdeMaps(datos as CentroForm),
    borrar: (id) => this.mis.borrarCentro(id),
    autocompletar: (latitud, longitud) => this.mis.autocompletarDatosCentro(latitud, longitud),
  };
}
