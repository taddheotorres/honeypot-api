import { Routes } from '@angular/router';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'diagnostico', loadComponent: () => import('./paginas/diagnostico/diagnostico.component').then(m => m.DiagnosticoComponent) },
];
