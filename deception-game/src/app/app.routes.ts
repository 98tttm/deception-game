import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'lobby',
    loadComponent: () =>
      import('./pages/lobby/lobby.component').then((m) => m.LobbyComponent),
  },
  {
    path: 'game/:roomId',
    loadComponent: () =>
      import('./pages/game/game.component').then((m) => m.GameComponent),
  },
  {
    path: 'demo',
    loadComponent: () =>
      import('./pages/demo/demo.component').then((m) => m.DemoComponent),
  },
  { path: '**', redirectTo: '' },
];
