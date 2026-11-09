import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { PrivadosComponent } from './pages/privados/privados';
import { PublicosComponent } from './pages/publicos/publicos';
import { EntrenamientosComponent } from './pages/entrenamientos/entrenamientos';
import { ValoracionesComponent } from './pages/valoraciones/valoraciones';
import { DetallePrivadoComponent } from './pages/detalle-privado/detalle-privado';
import { DetallePublicoComponent } from './pages/detalle-publico/detalle-publico/detalle-publico';
import { DetalleEntrenamientoComponent } from './pages/detalle-entrenamientos/detalle-entrenamiento-base/detalle-entrenamiento-base';
import { MisEntrenamientosComponent } from './pages/entrenamientos/mis-entrenamientos/mis-entrenamientos';
import { MisCentrosComponent } from './pages/privados/mis-centros/mis-centros';
import { DetalleMiCentroComponent } from './pages/detalle-privado/detalle-mi-centro/detalle-mi-centro';
import { DetalleMiEntrenamientoComponent } from './pages/detalle-entrenamientos/detalle-mis-entrenamientos/detalle-mis-entrenamientos';
import { DetalleMiLugarComponent } from './pages/detalle-publico/detalle-mis-lugares/detalle-mi-lugar/detalle-mi-lugar';
import { MisLugaresComponent } from './pages/publicos/mis-lugares/mis-lugares';
import { EntrenamientosComunidadComponent } from './pages/entrenamientos/comunidad/entrenamientos-comunidad';
import { DetalleEntrenamientoComunidadComponent } from './pages/detalle-entrenamientos/detalle-comunidad/detalle-entrenamiento-comunidad/detalle-entrenamiento-comunidad';
import { HistorialEntrenamientosComponent } from './pages/entrenamientos/historial/historial-entrenamientos';
import { DetalleHistorialEntrenamientoComponent } from './pages/detalle-entrenamientos/detalle-historial/detalle-historial';
import { EstadisticasComponent } from './pages/estadisticas/estadisticas';
import { CrearAdminComponent } from './pages/admin/crear-admin/crear-admin';
import { EntrenarComponent } from './pages/entrenar/entrenar';
import { ExplorarComponent } from './pages/explorar/explorar';
import { authGuard } from './guards/auth-guard';
import { publicGuard } from './guards/public-guard';
import { adminGuard } from './guards/admin-guard';
import { userGuard } from './guards/user-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  { path: 'inicio', loadComponent: () => import('./pages/inicio/inicio').then((m) => m.InicioComponent) },

  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },

  { path: 'entrenar', component: EntrenarComponent, canActivate: [authGuard] },
  { path: 'explorar', component: ExplorarComponent, canActivate: [authGuard] },

  { path: 'privados', component: PrivadosComponent, canActivate: [authGuard] },
  { path: 'privados/:id', component: DetallePrivadoComponent, canActivate: [authGuard] },

  { path: 'publicos', component: PublicosComponent, canActivate: [authGuard] },
  { path: 'publicos/:id', component: DetallePublicoComponent, canActivate: [authGuard] },

  { path: 'entrenamientos', component: EntrenamientosComponent, canActivate: [authGuard] },
  { path: 'entrenamientos/:id', component: DetalleEntrenamientoComponent, canActivate: [authGuard] },

  { path: 'entrenamientos-comunidad', component: EntrenamientosComunidadComponent, canActivate: [userGuard] },
  { path: 'entrenamientos-comunidad/:id', component: DetalleEntrenamientoComunidadComponent, canActivate: [userGuard] },

  { path: 'mis-entrenamientos', component: MisEntrenamientosComponent, canActivate: [userGuard] },
  { path: 'mis-entrenamientos/:id', component: DetalleMiEntrenamientoComponent, canActivate: [userGuard] },

  { path: 'mis-centros', component: MisCentrosComponent, canActivate: [userGuard] },
  { path: 'mis-centros/:id', component: DetalleMiCentroComponent, canActivate: [userGuard] },

  { path: 'mis-lugares', component: MisLugaresComponent, canActivate: [userGuard] },
  { path: 'mis-lugares/:id', component: DetalleMiLugarComponent, canActivate: [userGuard] },

  { path: 'historial-entrenamientos', component: HistorialEntrenamientosComponent, canActivate: [userGuard] },
  { path: 'historial-entrenamientos/:id', component: DetalleHistorialEntrenamientoComponent, canActivate: [userGuard] },

  { path: 'estadisticas', component: EstadisticasComponent, canActivate: [userGuard] },

  { path: 'valoraciones', component: ValoracionesComponent, canActivate: [userGuard] },

  { path: 'admin/crear-admin', component: CrearAdminComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: 'login' }
];
