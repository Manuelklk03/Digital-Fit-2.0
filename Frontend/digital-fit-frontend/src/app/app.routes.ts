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

  { path: 'inicio', loadComponent: () => import('./pages/inicio/inicio').then((m) => m.InicioComponent), data: { seo: 'inicio' } },

  { path: 'login', component: LoginComponent, canActivate: [publicGuard], data: { seo: 'login', migas: ['login'] } },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard], data: { seo: 'registro', migas: ['registro'] } },

  { path: 'entrenar', component: EntrenarComponent, canActivate: [authGuard], data: { tituloNav: 'entrenar' } },
  { path: 'explorar', component: ExplorarComponent, canActivate: [authGuard], data: { tituloNav: 'explorar' } },

  { path: 'privados', component: PrivadosComponent, canActivate: [authGuard], data: { migas: ['centros'] } },
  { path: 'privados/:id', component: DetallePrivadoComponent, canActivate: [authGuard], data: { migas: ['centros', 'detalle'] } },

  { path: 'publicos', component: PublicosComponent, canActivate: [authGuard], data: { migas: ['lugares'] } },
  { path: 'publicos/:id', component: DetallePublicoComponent, canActivate: [authGuard], data: { migas: ['lugares', 'detalle'] } },

  { path: 'entrenamientos', component: EntrenamientosComponent, canActivate: [authGuard], data: { migas: ['entrenamientos'] } },
  { path: 'entrenamientos/:id', component: DetalleEntrenamientoComponent, canActivate: [authGuard], data: { migas: ['entrenamientos', 'detalle'] } },

  { path: 'entrenamientos-comunidad', component: EntrenamientosComunidadComponent, canActivate: [userGuard], data: { migas: ['comunidad'] } },
  { path: 'entrenamientos-comunidad/:id', component: DetalleEntrenamientoComunidadComponent, canActivate: [userGuard], data: { migas: ['comunidad', 'detalle'] } },

  { path: 'mis-entrenamientos', component: MisEntrenamientosComponent, canActivate: [userGuard], data: { tituloNav: 'misEntrenamientos', migas: ['misEntrenamientos'] } },
  { path: 'mis-entrenamientos/:id', component: DetalleMiEntrenamientoComponent, canActivate: [userGuard], data: { migas: ['misEntrenamientos', 'detalle'] } },

  { path: 'mis-centros', component: MisCentrosComponent, canActivate: [userGuard], data: { tituloNav: 'misCentros', migas: ['misCentros'] } },
  { path: 'mis-centros/:id', component: DetalleMiCentroComponent, canActivate: [userGuard], data: { migas: ['misCentros', 'detalle'] } },

  { path: 'mis-lugares', component: MisLugaresComponent, canActivate: [userGuard], data: { tituloNav: 'misLugares', migas: ['misLugares'] } },
  { path: 'mis-lugares/:id', component: DetalleMiLugarComponent, canActivate: [userGuard], data: { migas: ['misLugares', 'detalle'] } },

  { path: 'historial-entrenamientos', component: HistorialEntrenamientosComponent, canActivate: [userGuard], data: { migas: ['historial'] } },
  { path: 'historial-entrenamientos/:id', component: DetalleHistorialEntrenamientoComponent, canActivate: [userGuard], data: { migas: ['historial', 'detalle'] } },

  { path: 'estadisticas', component: EstadisticasComponent, canActivate: [userGuard], data: { tituloNav: 'progreso', migas: ['progreso'] } },

  { path: 'valoraciones', component: ValoracionesComponent, canActivate: [userGuard], data: { tituloNav: 'progreso', migas: ['progreso', 'valoraciones'] } },

  { path: 'admin/crear-admin', component: CrearAdminComponent, canActivate: [adminGuard], data: { tituloNav: 'crearAdmin', migas: ['crearAdmin'] } },

  { path: '**', redirectTo: 'login' }
];
