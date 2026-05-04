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
        path: 'billeteras',
        loadComponent: () =>
          import('./features/billetera/billetera-list').then((m) => m.BilleteraListComponent),
      },
      {
        path: 'apuestas',
        loadComponent: () =>
          import('./features/apuestas/apuesta-list').then((m) => m.ApuestaListComponent),
      },
      {
        path: 'metodos-pago',
        loadComponent: () =>
          import('./features/metodos-pago/metodo-pago-list').then((m) => m.MetodoPagoListComponent),
      },
      {
        path: 'transacciones',
        loadComponent: () =>
          import('./features/transacciones/transaccion-list').then(
            (m) => m.TransaccionListComponent),
      },
      {
        path: 'sorteos',
        loadComponent: () => import('./features/sorteos/sorteo-list').then((m) => m.SorteoListComponent),
      },
      {
        path: 'bingos',
        loadComponent: () =>
          import('./features/bingos/bingo-list').then((m) => m.BingoListComponent),
      },
      {
        path: 'loterias',
        loadComponent: () =>
          import('./features/loterias/loteria-list').then((m) => m.LoteriaListComponent),
      },
      {
        path: 'ruletas',
        loadComponent: () =>
          import('./features/ruletas/ruleta-list').then((m) => m.RuletaListComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];