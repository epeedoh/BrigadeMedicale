import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { patientGuard, patientGuestGuard } from './features/patient-portal/core/guards/patient.guard';

export const routes: Routes = [
  // =============================================
  // Routes Staff (Authentification JWT)
  // =============================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // =============================================
  // Routes Portail Patient (Authentification Token Patient)
  // =============================================
  {
    path: 'patient',
    children: [
      // Pages publiques (onboarding, login)
      {
        path: 'onboarding',
        canActivate: [patientGuestGuard],
        loadComponent: () => import('./features/patient-portal/pages/onboarding/onboarding.component').then(m => m.OnboardingComponent)
      },
      {
        path: 'login',
        canActivate: [patientGuestGuard],
        loadComponent: () => import('./features/patient-portal/pages/patient-login/patient-login.component').then(m => m.PatientLoginComponent)
      },
      {
        path: 'success',
        loadComponent: () => import('./features/patient-portal/pages/onboarding-success/onboarding-success.component').then(m => m.OnboardingSuccessComponent)
      },
      // Dashboard patient (protégé par patientGuard)
      {
        path: 'dashboard',
        canActivate: [patientGuard],
        loadComponent: () => import('./features/patient-portal/layout/patient-shell/patient-shell.component').then(m => m.PatientShellComponent),
        children: [
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full'
          },
          {
            path: 'overview',
            loadComponent: () => import('./features/patient-portal/pages/dashboard/overview/overview.component').then(m => m.OverviewComponent)
          },
          {
            path: 'profile',
            loadComponent: () => import('./features/patient-portal/pages/dashboard/profile/profile.component').then(m => m.ProfileComponent)
          },
          {
            path: 'visits',
            loadComponent: () => import('./features/patient-portal/pages/dashboard/visits/visits.component').then(m => m.VisitsComponent)
          },
          {
            path: 'consultations',
            loadComponent: () => import('./features/patient-portal/pages/dashboard/consultations/consultations.component').then(m => m.ConsultationsComponent)
          },
          {
            path: 'analyses',
            loadComponent: () => import('./features/patient-portal/pages/dashboard/analyses/analyses.component').then(m => m.AnalysesComponent)
          },
          {
            path: 'pharmacie',
            loadComponent: () => import('./features/patient-portal/pages/dashboard/pharmacie/pharmacie.component').then(m => m.PharmacieComponent)
          },
          {
            path: 'infos',
            loadComponent: () => import('./features/patient-portal/pages/dashboard/infos/infos.component').then(m => m.InfosComponent)
          },
          {
            path: 'training',
            loadChildren: () => import('./features/training/training.routes').then(m => m.TRAINING_ROUTES)
          }
        ]
      },
      // Redirection par défaut vers onboarding
      {
        path: '',
        redirectTo: 'onboarding',
        pathMatch: 'full'
      }
    ]
  },

  // =============================================
  // Routes Staff protégées (Shell principal)
  // =============================================
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // Patients routes
      {
        path: 'patients',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ACCUEIL', 'MEDECIN', 'SUPERVISEUR'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/patients/patient-list/patient-list.component').then(m => m.PatientListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/patients/patient-create/patient-create.component').then(m => m.PatientCreateComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/patients/patient-detail/patient-detail.component').then(m => m.PatientDetailComponent)
          }
        ]
      },
      // Consultations routes
      {
        path: 'consultations',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MEDECIN', 'SUPERVISEUR'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/consultations/consultation-list/consultation-list.component').then(m => m.ConsultationListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/consultations/consultation-create/consultation-create.component').then(m => m.ConsultationCreateComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/consultations/consultation-detail/consultation-detail.component').then(m => m.ConsultationDetailComponent)
          }
        ]
      },
      // Pharmacy routes
      {
        path: 'pharmacy',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PHARMACIEN', 'SUPERVISEUR'] },
        children: [
          {
            path: '',
            redirectTo: 'prescriptions',
            pathMatch: 'full'
          },
          {
            path: 'prescriptions',
            loadComponent: () => import('./features/pharmacy/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent)
          },
          {
            path: 'medications',
            loadComponent: () => import('./features/pharmacy/medication-list/medication-list.component').then(m => m.MedicationListComponent)
          },
          {
            path: 'medications/create',
            loadComponent: () => import('./features/pharmacy/medication-create/medication-create.component').then(m => m.MedicationCreateComponent)
          },
          {
            path: 'medications/:id',
            loadComponent: () => import('./features/pharmacy/medication-detail/medication-detail.component').then(m => m.MedicationDetailComponent)
          }
        ]
      },
      // Lab Tests routes
      {
        path: 'lab-tests',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'LABORANTIN', 'SUPERVISEUR'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/lab-tests/lab-test-list/lab-test-list.component').then(m => m.LabTestListComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/lab-tests/lab-test-detail/lab-test-detail.component').then(m => m.LabTestDetailComponent)
          }
        ]
      },
      // Users routes
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
          }
        ]
      },
      // Training/Formation routes (staff)
      {
        path: 'training',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ACCUEIL', 'MEDECIN', 'LABORANTIN', 'PHARMACIEN', 'SUPERVISEUR'] },
        loadChildren: () => import('./features/training/training.routes').then(m => m.STAFF_TRAINING_ROUTES)
      },
      // Triage routes (staff - Infirmier)
      {
        path: 'triage',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'INFIRMIER'] },
        loadChildren: () => import('./features/triage/triage.routes').then(m => m.TRIAGE_ROUTES)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
