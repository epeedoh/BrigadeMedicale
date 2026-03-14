import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PatientTokenService } from '../../core/services/patient-token.service';
import { PatientPortalService } from '../../core/services/patient-portal.service';
import { PatientProfile } from '../../../../shared/models/patient.model';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  mobileIcon?: string;
}

@Component({
  selector: 'app-patient-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Desktop/Tablet Sidebar -->
      <aside class="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 lg:w-72 flex-col bg-white border-r border-gray-200">
        <!-- Logo/Header -->
        <div class="p-5 lg:p-6 border-b border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 lg:w-9 lg:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg lg:text-xl font-bold text-gray-900">Mon Carnet</h1>
              <p class="text-sm text-gray-500">Brigade Médicale</p>
            </div>
          </div>
        </div>

        <!-- Patient Info -->
        <div class="p-5 bg-teal-50 border-b border-teal-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-lg">
              {{ getInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-gray-900 truncate">{{ patientProfile?.fullName || 'Patient' }}</p>
              <p class="text-sm text-teal-600 font-mono">{{ patientNumber }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 lg:p-5 space-y-1 overflow-y-auto">
          <a *ngFor="let item of menuItems"
             [routerLink]="item.route"
             routerLinkActive="nav-item-active"
             class="nav-item">
            <span [innerHTML]="item.icon"></span>
            <span class="text-base">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Logout -->
        <div class="p-4 lg:p-5 border-t border-gray-100 bg-red-50">
          <button (click)="logout()" class="w-full nav-item text-red-600 hover:bg-red-100 bg-white border-2 border-red-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="text-base font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-200">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">Mon Carnet</p>
              <p class="text-xs text-teal-600 font-mono">{{ patientNumber }}</p>
            </div>
          </div>
          <button (click)="showMobileMenu = !showMobileMenu"
                  class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              <path *ngIf="showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Mobile Dropdown Menu -->
        <div *ngIf="showMobileMenu" class="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-slide-down">
          <div class="p-3 bg-teal-50 border-b border-teal-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
                {{ getInitials() }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ patientProfile?.fullName || 'Patient' }}</p>
                <p class="text-xs text-gray-500">{{ patientProfile?.phoneNumber }}</p>
              </div>
            </div>
          </div>
          <nav class="p-2">
            <a *ngFor="let item of menuItems"
               [routerLink]="item.route"
               routerLinkActive="nav-item-active"
               (click)="showMobileMenu = false"
               class="nav-item">
              <span [innerHTML]="item.icon"></span>
              <span class="text-sm">{{ item.label }}</span>
            </a>
            <button (click)="logout()" class="w-full nav-item text-red-600 hover:bg-red-50 mt-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="text-sm">Déconnexion</span>
            </button>
          </nav>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="md:ml-64 lg:ml-72 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen bg-gray-50">
        <div class="w-full p-4 sm:p-6 md:p-8 lg:p-10">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 safe-area-bottom">
        <div class="grid grid-cols-5 h-16">
          <a *ngFor="let item of mobileNavItems"
             [routerLink]="item.route"
             routerLinkActive="bottom-nav-active"
             class="bottom-nav-item">
            <span [innerHTML]="item.mobileIcon || item.icon" class="w-6 h-6"></span>
            <span class="text-xs mt-1">{{ item.label }}</span>
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .nav-item {
      @apply flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600
             hover:bg-gray-50 transition-all;
    }
    .nav-item-active {
      @apply bg-teal-50 text-teal-700 font-semibold;
    }
    .bottom-nav-item {
      @apply flex flex-col items-center justify-center text-gray-500
             transition-all;
    }
    .bottom-nav-active {
      @apply text-teal-600;
    }
    .bottom-nav-active svg {
      @apply text-teal-600;
    }
    .safe-area-bottom {
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
    .animate-slide-down {
      animation: slideDown 0.2s ease-out;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PatientShellComponent implements OnInit {
  patientNumber: string | null = null;
  patientProfile: PatientProfile | null = null;
  showMobileMenu = false;

  menuItems: MenuItem[] = [
    {
      label: 'Accueil',
      route: '/patient/dashboard/overview',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>'
    },
    {
      label: 'Mon profil',
      route: '/patient/dashboard/profile',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'
    },
    {
      label: 'Mes visites',
      route: '/patient/dashboard/visits',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'
    },
    {
      label: 'Consultations',
      route: '/patient/dashboard/consultations',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>'
    },
    {
      label: 'Analyses',
      route: '/patient/dashboard/analyses',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>'
    },
    {
      label: 'Pharmacie',
      route: '/patient/dashboard/pharmacie',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>'
    },
    {
      label: 'Infos',
      route: '/patient/dashboard/infos',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    },
    {
      label: 'Formation',
      route: '/patient/dashboard/training',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z"/></svg>'
    }
  ];

  // Items for mobile bottom nav (subset)
  mobileNavItems: MenuItem[] = [];

  constructor(
    private patientTokenService: PatientTokenService,
    private patientPortalService: PatientPortalService,
    private router: Router
  ) {
    // Select 5 items for mobile bottom nav
    this.mobileNavItems = [
      this.menuItems[0], // Accueil
      this.menuItems[7], // Formation
      this.menuItems[4], // Analyses
      this.menuItems[5], // Pharmacie
      this.menuItems[1]  // Profil
    ];
  }

  ngOnInit(): void {
    this.patientNumber = this.patientTokenService.getPatientNumber();
    this.loadProfile();
  }

  private loadProfile(): void {
    this.patientPortalService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.patientProfile = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur chargement profil:', error);
        // Si erreur 401, le token est invalide
        if (error.status === 401) {
          this.logout();
        }
      }
    });
  }

  getInitials(): string {
    if (!this.patientProfile) return 'P';
    const first = this.patientProfile.firstName?.charAt(0) || '';
    const last = this.patientProfile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'P';
  }

  logout(): void {
    this.patientTokenService.clearPatientData();
    this.router.navigate(['/patient/login']);
  }
}
