import { Routes } from '@angular/router';
import { TrainingCatalogComponent } from './pages/training-catalog/training-catalog.component';
import { TrainingModuleDetailComponent } from './pages/training-module-detail/training-module-detail.component';
import { TrainingQuizComponent } from './pages/training-quiz/training-quiz.component';
import { TrainingStaffCatalogComponent } from './pages/training-staff-catalog/training-staff-catalog.component';
import { TrainingStaffDetailComponent } from './pages/training-staff-detail/training-staff-detail.component';

export const TRAINING_ROUTES: Routes = [
  {
    path: '',
    component: TrainingCatalogComponent,
    data: { title: 'Formation' }
  },
  {
    path: ':id',
    component: TrainingModuleDetailComponent,
    data: { title: 'Détail du module' }
  },
  {
    path: ':id/quiz',
    component: TrainingQuizComponent,
    data: { title: 'Quiz' }
  }
];

// Staff training routes (used under /dashboard/training)
export const STAFF_TRAINING_ROUTES: Routes = [
  {
    path: '',
    component: TrainingStaffCatalogComponent,
    data: { title: 'Formation' }
  },
  {
    path: ':id',
    component: TrainingStaffDetailComponent,
    data: { title: 'Détail du module de formation' }
  }
];
