import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'cambiar-password',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/pages/cambiar-password/cambiar-password.component')
        .then(m => m.CambiarPasswordComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'admin/areas',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
            import('./features/admin/areas/areas.component').then(m => m.AreasComponent)
        },
      {
        path: 'admin/cargos',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
            import('./features/admin/cargos/cargos.component').then(m => m.CargosComponent)
        },
        {
        path: 'admin/usuarios-modulo',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
            import('./features/admin/usuarios-modulo/usuarios-modulo.component').then(m => m.UsuariosModuloComponent)
        },
        {
        path: 'admin/items-cargo',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
            import('./features/admin/items-cargo/items-cargo.component').then(m => m.ItemsCargoComponent)
        },
        {
        path: 'admin/empresas',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/admin/empresas/empresas.component').then(m => m.EmpresasComponent)
      },
      {
        path: 'evaluaciones/nueva',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EVALUADOR'] },
        loadComponent: () =>
            import('./features/evaluaciones/nueva-evaluacion/nueva-evaluacion.component').then(m => m.NuevaEvaluacionComponent)
        },
        {
        path: 'evaluaciones/listado',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EVALUADOR'] },
        loadComponent: () =>
            import('./features/evaluaciones/listado-evaluaciones/listado-evaluaciones.component').then(m => m.ListadoEvaluacionesComponent)
        },
        {
        path: 'evaluaciones/detalle/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'EVALUADOR'] },
        loadComponent: () =>
            import('./features/evaluaciones/detalle-evaluacion/detalle-evaluacion.component').then(m => m.DetalleEvaluacionComponent)
        },
        {
        path: 'reportes/areas',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
            import('./features/reportes/reporte-areas/reporte-areas.component').then(m => m.ReporteAreasComponent)
        },
        {
        path: 'reportes/empleados',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
            import('./features/reportes/reporte-empleado/reporte-empleado.component').then(m => m.ReporteEmpleadoComponent)
        },
        {
        path: 'admin/carga-masiva',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/admin/carga-masiva/carga-masiva.component').then(m => m.CargaMasivaComponent)
      },
      {
        path: 'lda/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'NOTIFICADOR'] },
        loadComponent: () =>
          import('./features/lda/nuevo-llamado/nuevo-llamado.component').then(m => m.NuevoLlamadoComponent)
      },
      {
        path: 'lda/listado',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'NOTIFICADOR'] },
        loadComponent: () =>
          import('./features/lda/listado-notificaciones/listado-notificaciones.component').then(m => m.ListadoNotificacionesComponent)
      }
        
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];