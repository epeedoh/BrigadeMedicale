import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { UserInfoDto } from '../../core/auth/models/user.model';
import { DashboardApiService, DashboardStats, RecentConsultation } from '../../core/api/dashboard-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in">
      <!-- Welcome Section -->
      <div class="card-medical mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Bonjour, {{ currentUser?.firstName || 'Utilisateur' }} !
            </h1>
            <p class="text-lg text-gray-600 mt-2">Bienvenue sur le tableau de bord Brigade Médicale</p>
          </div>
          <div class="mt-4 md:mt-0">
            <p class="text-base text-gray-500">{{ todayDate }}</p>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Patients Card -->
        <div class="stat-card group hover:shadow-lg transition-all duration-300">
          <div class="flex items-start justify-between">
            <div class="stat-icon group-hover:scale-110 transition-transform">
              <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <span class="badge badge-success">+12%</span>
          </div>
          <p class="stat-value">{{ stats?.totalPatients?.toLocaleString('fr-FR') || '-' }}</p>
          <p class="stat-label">Patients enregistrés</p>
          <a routerLink="/patients" class="text-lg text-teal-600 hover:text-teal-800 mt-3 inline-flex items-center gap-2">
            Voir les patients
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Consultations Card -->
        <div class="stat-card group hover:shadow-lg transition-all duration-300">
          <div class="flex items-start justify-between">
            <div class="stat-icon bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:scale-110 transition-transform">
              <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <span class="badge badge-info">Aujourd'hui</span>
          </div>
          <p class="stat-value">{{ stats?.totalConsultationsToday || 0 }}</p>
          <p class="stat-label">Consultations du jour</p>
          <a routerLink="/consultations" class="text-lg text-blue-600 hover:text-blue-800 mt-3 inline-flex items-center gap-2">
            Voir les consultations
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Prescriptions Card -->
        <div class="stat-card group hover:shadow-lg transition-all duration-300">
          <div class="flex items-start justify-between">
            <div class="stat-icon bg-gradient-to-br from-emerald-500 to-green-600 group-hover:scale-110 transition-transform">
              <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <span class="badge badge-warning">En attente</span>
          </div>
          <p class="stat-value">{{ stats?.totalPrescriptionsPending || 0 }}</p>
          <p class="stat-label">Prescriptions à dispenser</p>
          <a routerLink="/pharmacy/prescriptions" class="text-lg text-emerald-600 hover:text-emerald-800 mt-3 inline-flex items-center gap-2">
            Voir les prescriptions
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Lab Tests Card -->
        <div class="stat-card group hover:shadow-lg transition-all duration-300">
          <div class="flex items-start justify-between">
            <div class="stat-icon bg-gradient-to-br from-purple-500 to-violet-600 group-hover:scale-110 transition-transform">
              <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
              </svg>
            </div>
            <span class="badge badge-primary">Labo</span>
          </div>
          <p class="stat-value">{{ stats?.totalLabTestsPending || 0 }}</p>
          <p class="stat-label">Analyses en cours</p>
          <a routerLink="/lab-tests" class="text-lg text-purple-600 hover:text-purple-800 mt-3 inline-flex items-center gap-2">
            Voir les analyses
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Consultations -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Consultations récentes</h2>
            <a routerLink="/consultations" class="text-base text-teal-600 hover:text-teal-800 font-medium">Voir tout</a>
          </div>

          <div class="space-y-4">
            <div *ngFor="let consultation of recentConsultations"
                 class="flex items-center gap-5 p-5 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors cursor-pointer">
              <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate text-lg">{{ consultation.patientName }}</p>
                <p class="text-base text-gray-500 truncate">{{ consultation.chiefComplaint }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-medium text-gray-900">{{ consultation.consultationDate | date: 'HH:mm' }}</p>
                <span [class]="consultation.status === 0 ? 'badge badge-info' : (consultation.status === 1 ? 'badge badge-success' : 'badge badge-warning')">
                  {{ getConsultationStatusLabel(consultation.status) }}
                </span>
              </div>
            </div>

            <div *ngIf="recentConsultations.length === 0" class="empty-state py-8">
              <svg class="empty-state-icon w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="empty-state-title">Aucune consultation récente</p>
              <p class="empty-state-text">Les consultations du jour apparaîtront ici</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Alerts -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="card">
            <h2 class="text-xl font-semibold text-gray-900 mb-5">Actions rapides</h2>
            <div class="space-y-4">
              <a routerLink="/patients/create"
                 class="flex items-center gap-5 p-5 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 hover:from-teal-100 hover:to-blue-100 transition-colors">
                <div class="w-14 h-14 rounded-lg bg-teal-500 flex items-center justify-center">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                </div>
                <span class="font-medium text-gray-800 text-lg">Nouveau patient</span>
              </a>

              <a routerLink="/consultations/create"
                 class="flex items-center gap-5 p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors">
                <div class="w-14 h-14 rounded-lg bg-blue-500 flex items-center justify-center">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span class="font-medium text-gray-800 text-lg">Nouvelle consultation</span>
              </a>

              <a routerLink="/pharmacy/medications"
                 class="flex items-center gap-5 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-colors">
                <div class="w-14 h-14 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>
                <span class="font-medium text-gray-800 text-lg">Gestion des stocks</span>
              </a>
            </div>
          </div>

          <!-- Alerts -->
          <div class="card border-l-4 border-orange-400">
            <div class="flex items-start gap-5">
              <div class="w-14 h-14 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-lg">Stock faible</h3>
                <p class="text-lg text-gray-600 mt-1">5 médicaments ont un stock inférieur au minimum requis</p>
                <a routerLink="/pharmacy/medications" class="text-lg text-orange-600 hover:text-orange-800 mt-2 inline-block font-medium">
                  Voir les détails →
                </a>
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="card bg-gradient-to-br from-teal-500 to-blue-600 text-white">
            <div class="flex items-center gap-5 mb-5">
              <div class="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">Système opérationnel</h3>
                <p class="text-lg text-teal-100">Tous les services fonctionnent</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-lg">
              <div class="bg-white/10 rounded-lg p-5">
                <p class="text-teal-100">Backend API</p>
                <p class="font-semibold flex items-center gap-2 mt-2">
                  <span class="w-3 h-3 bg-green-400 rounded-full"></span>
                  En ligne
                </p>
              </div>
              <div class="bg-white/10 rounded-lg p-5">
                <p class="text-teal-100">Base de données</p>
                <p class="font-semibold flex items-center gap-2 mt-2">
                  <span class="w-3 h-3 bg-green-400 rounded-full"></span>
                  Connectée
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: UserInfoDto | null = null;
  todayDate = '';
  stats: DashboardStats | null = null;
  recentConsultations: RecentConsultation[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private dashboardApiService: DashboardApiService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.todayDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardApiService.getDashboardData().subscribe({
      next: (response) => {
        this.stats = response.data.stats;
        this.recentConsultations = response.data.recentConsultations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.errorMessage = 'Erreur lors du chargement des données du tableau de bord';
        this.isLoading = false;
      }
    });
  }

  getConsultationStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'En cours';
      case 1:
        return 'Terminée';
      case 2:
        return 'Annulée';
      default:
        return 'Statut inconnu';
    }
  }
}
