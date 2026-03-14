import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsultationApiService } from '../../../core/api/consultation-api.service';
import { Consultation, ConsultationStatus } from '../../../shared/models/consultation.model';
import { PaginationInfo } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Page Header -->
      <div class="card-medical mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Consultations médicales</h1>
              <p class="text-gray-500">Suivi et gestion des consultations</p>
            </div>
          </div>
          <a routerLink="/consultations/create" class="btn btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Nouvelle consultation
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-gray-500">Filtrer par statut:</span>
          <div class="flex flex-wrap gap-2">
            <button (click)="filterByStatus(null)"
                    [class]="selectedStatus === null ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              Toutes
            </button>
            <button (click)="filterByStatus(ConsultationStatus.InProgress)"
                    [class]="selectedStatus === ConsultationStatus.InProgress ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
              En cours
            </button>
            <button (click)="filterByStatus(ConsultationStatus.Completed)"
                    [class]="selectedStatus === ConsultationStatus.Completed ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Terminées
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ pagination?.totalItems || consultations.length }}</p>
            <p class="text-sm text-gray-500">Total</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getInProgressCount() }}</p>
            <p class="text-sm text-gray-500">En cours</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getCompletedCount() }}</p>
            <p class="text-sm text-gray-500">Terminées</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getTodayCount() }}</p>
            <p class="text-sm text-gray-500">Aujourd'hui</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="spinner w-12 h-12 mb-4"></div>
          <p class="text-gray-500">Chargement des consultations...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="card border-l-4 border-red-500 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-red-800">Erreur de chargement</h3>
            <p class="text-red-600 text-sm mt-1">{{ error }}</p>
          </div>
          <button (click)="loadConsultations()" class="btn btn-secondary">Réessayer</button>
        </div>
      </div>

      <!-- Consultations Table -->
      <div *ngIf="!loading && !error" class="card">
        <div class="overflow-x-auto">
          <table class="table-medical">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Motif</th>
                <th>Date</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let consultation of consultations"
                  class="cursor-pointer"
                  [routerLink]="['/consultations', consultation.id]">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ consultation.patientName }}</p>
                      <p class="text-sm text-gray-500">{{ consultation.patientNumber }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-gray-700">Dr. {{ consultation.doctorName }}</span>
                  </div>
                </td>
                <td>
                  <p class="text-gray-900 max-w-xs truncate" [title]="consultation.chiefComplaint">
                    {{ consultation.chiefComplaint }}
                  </p>
                </td>
                <td>
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ formatDate(consultation.consultationDate) }}
                  </div>
                </td>
                <td>
                  <span [class]="getStatusClass(consultation.status)"
                        class="badge">
                    <span class="w-2 h-2 rounded-full mr-1"
                          [class]="consultation.status === ConsultationStatus.InProgress ? 'bg-yellow-500' :
                                   consultation.status === ConsultationStatus.Completed ? 'bg-green-500' : 'bg-red-500'">
                    </span>
                    {{ getStatusLabel(consultation.status) }}
                  </span>
                </td>
                <td class="text-right">
                  <a [routerLink]="['/consultations', consultation.id]"
                     class="btn btn-sm btn-secondary"
                     (click)="$event.stopPropagation()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Voir
                  </a>
                </td>
              </tr>
              <tr *ngIf="consultations?.length === 0">
                <td colspan="6">
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="empty-state-title">Aucune consultation trouvée</p>
                    <p class="empty-state-text">Les consultations apparaîtront ici</p>
                    <a routerLink="/consultations/create" class="btn btn-primary mt-4">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      Nouvelle consultation
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="pagination && pagination.totalPages > 1" class="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
          <p class="text-sm text-gray-600">
            Page {{ pagination.currentPage }} / {{ pagination.totalPages }}
            ({{ pagination.totalItems }} résultats)
          </p>
          <div class="flex items-center gap-2">
            <button (click)="goToPage(pagination.currentPage - 1)"
                    [disabled]="!pagination.hasPreviousPage"
                    class="btn btn-secondary btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Précédent
            </button>
            <button (click)="goToPage(pagination.currentPage + 1)"
                    [disabled]="!pagination.hasNextPage"
                    class="btn btn-secondary btn-sm">
              Suivant
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConsultationListComponent implements OnInit {
  consultations: Consultation[] = [];
  pagination: PaginationInfo | null = null;
  selectedStatus: ConsultationStatus | null = null;
  loading = false;
  error = '';
  ConsultationStatus = ConsultationStatus;

  constructor(private consultationApiService: ConsultationApiService) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(page: number = 1): void {
    this.loading = true;
    this.error = '';

    this.consultationApiService.getConsultations(this.selectedStatus ?? undefined, page, 20).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            this.consultations = response.data;
            this.pagination = null;
          } else {
            this.consultations = response.data.items || [];
            this.pagination = response.data.pagination || null;
          }
        } else {
          this.consultations = [];
          this.error = response.message || 'Erreur lors du chargement';
        }
        this.loading = false;
      },
      error: (err) => {
        this.consultations = [];
        this.error = err.error?.message || 'Erreur lors du chargement';
        this.loading = false;
      }
    });
  }

  filterByStatus(status: ConsultationStatus | null): void {
    this.selectedStatus = status;
    this.loadConsultations();
  }

  goToPage(page: number): void {
    if (page >= 1 && this.pagination && page <= this.pagination.totalPages) {
      this.loadConsultations(page);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getStatusLabel(status: ConsultationStatus): string {
    switch (status) {
      case ConsultationStatus.InProgress: return 'En cours';
      case ConsultationStatus.Completed: return 'Terminée';
      case ConsultationStatus.Cancelled: return 'Annulée';
      default: return 'Inconnu';
    }
  }

  getStatusClass(status: ConsultationStatus): string {
    switch (status) {
      case ConsultationStatus.InProgress: return 'badge-warning';
      case ConsultationStatus.Completed: return 'badge-success';
      case ConsultationStatus.Cancelled: return 'badge-danger';
      default: return 'badge-info';
    }
  }

  getInProgressCount(): number {
    return this.consultations.filter(c => c.status === ConsultationStatus.InProgress).length;
  }

  getCompletedCount(): number {
    return this.consultations.filter(c => c.status === ConsultationStatus.Completed).length;
  }

  getTodayCount(): number {
    const today = new Date().toDateString();
    return this.consultations.filter(c => new Date(c.consultationDate).toDateString() === today).length;
  }
}
