import { Routes } from '@angular/router';

import { auditUserGuard } from './core/audit-user.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [auditUserGuard],
    loadComponent: () => import('./features/shell/main-layout').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuario-list').then((m) => m.UsuarioListComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/categorias/categoria-list').then((m) => m.CategoriaListComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/productos/producto-list').then((m) => m.ProductoListComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/pedidos/pedido-list').then((m) => m.PedidoListComponent),
      },
      {
        path: 'detalles-pedido',
        loadComponent: () =>
          import('./features/detalles-pedido/detalle-pedido-list').then(
            (m) => m.DetallePedidoListComponent,
          ),
      },
      {
        path: 'pagos',
        loadComponent: () => import('./features/pagos/pago-list').then((m) => m.PagoListComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];