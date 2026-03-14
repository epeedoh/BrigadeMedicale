import { Routes } from '@angular/router';
import { TriageDashboardComponent } from './pages/triage-dashboard/triage-dashboard.component';
import { TriageFormComponent } from './pages/triage-form/triage-form.component';

export const TRIAGE_ROUTES: Routes = [
  {
    path: '',
    component: TriageDashboardComponent,
    data: { title: 'Triage Patient' }
  },
  {
    path: 'nouveau',
    component: TriageFormComponent,
    data: { title: 'Nouveau Triage' }
  }
];
