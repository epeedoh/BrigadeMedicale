import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LabTestApiService } from '../../../core/api/lab-test-api.service';
import { LabTest, LabTestStatus } from '../../../shared/models/lab-test.model';
import { PaginationInfo } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-lab-test-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-fade-in">
      <!-- Page Header -->
      <div class="card-medical mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Analyses de laboratoire</h1>
              <p class="text-gray-500">Gestion des demandes d'analyses médicales</p>
            </div>
          </div>
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
            <button (click)="filterByStatus(LabTestStatus.Requested)"
                    [class]="selectedStatus === LabTestStatus.Requested ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Demandées
            </button>
            <button (click)="filterByStatus(LabTestStatus.InProgress)"
                    [class]="selectedStatus === LabTestStatus.InProgress ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
              En cours
            </button>
            <button (click)="filterByStatus(LabTestStatus.Completed)"
                    [class]="selectedStatus === LabTestStatus.Completed ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Terminées
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ pagination?.totalItems || labTests.length }}</p>
            <p class="text-sm text-gray-500">Total</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getRequestedCount() }}</p>
            <p class="text-sm text-gray-500">Demandées</p>
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
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="spinner w-12 h-12 mb-4"></div>
          <p class="text-gray-500">Chargement des analyses...</p>
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
          <button (click)="loadLabTests()" class="btn btn-secondary">Réessayer</button>
        </div>
      </div>

      <!-- Lab Tests Table -->
      <div *ngIf="!loading && !error" class="card">
        <div class="overflow-x-auto">
          <table class="table-medical">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Demandé par</th>
                <th>Date</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let test of labTests"
                  class="cursor-pointer"
                  [routerLink]="['/lab-tests', test.id]">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ test.patientName }}</p>
                      <p class="text-sm text-purple-600 font-mono">{{ test.patientNumber }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="font-medium text-gray-900">{{ test.testName }}</p>
                  <p class="text-sm text-gray-500">{{ test.testType }}</p>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-gray-700">Dr. {{ test.requestedBy }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    {{ formatDate(test.requestedAt) }}
                  </div>
                </td>
                <td>
                  <span [class]="'badge ' + getStatusBadgeClass(test.status)">
                    <span class="w-2 h-2 rounded-full mr-1"
                          [class]="test.status === LabTestStatus.Requested ? 'bg-blue-500' :
                                   test.status === LabTestStatus.InProgress ? 'bg-yellow-500' :
                                   test.status === LabTestStatus.Completed ? 'bg-green-500' : 'bg-red-500'">
                    </span>
                    {{ getStatusLabel(test.status) }}
                  </span>
                </td>
                <td class="text-right">
                  <a [routerLink]="['/lab-tests', test.id]"
                     (click)="$event.stopPropagation()"
                     class="btn btn-sm btn-secondary">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    {{ test.status === LabTestStatus.Completed ? 'Voir' : 'Traiter' }}
                  </a>
                </td>
              </tr>
              <tr *ngIf="labTests?.length === 0">
                <td colspan="6">
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                    </svg>
                    <p class="empty-state-title">Aucune analyse trouvée</p>
                    <p class="empty-state-text">Les demandes d'analyses apparaîtront ici</p>
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
export class LabTestListComponent implements OnInit {
  labTests: LabTest[] = [];
  pagination: PaginationInfo | null = null;
  selectedStatus: LabTestStatus | null = LabTestStatus.Requested;
  loading = false;
  error = '';
  LabTestStatus = LabTestStatus;

  constructor(private labTestApiService: LabTestApiService) {}

  ngOnInit(): void {
    this.loadLabTests();
  }

  loadLabTests(page: number = 1): void {
    this.loading = true;
    this.error = '';

    this.labTestApiService.getLabTests(this.selectedStatus ?? undefined, page).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            this.labTests = response.data;
            this.pagination = null;
          } else {
            this.labTests = response.data.items || [];
            this.pagination = response.data.pagination || null;
          }
        } else {
          this.labTests = [];
          this.error = response.message || 'Erreur';
        }
        this.loading = false;
      },
      error: (err) => {
        this.labTests = [];
        this.error = err.error?.message || 'Erreur';
        this.loading = false;
      }
    });
  }

  filterByStatus(status: LabTestStatus | null): void {
    this.selectedStatus = status;
    this.loadLabTests();
  }

  goToPage(page: number): void {
    if (page >= 1 && this.pagination && page <= this.pagination.totalPages) {
      this.loadLabTests(page);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getStatusLabel(status: LabTestStatus): string {
    switch (status) {
      case LabTestStatus.Requested: return 'Demandé';
      case LabTestStatus.InProgress: return 'En cours';
      case LabTestStatus.Completed: return 'Terminé';
      case LabTestStatus.Cancelled: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  getStatusClass(status: LabTestStatus): string {
    switch (status) {
      case LabTestStatus.Requested: return 'bg-blue-100 text-blue-800';
      case LabTestStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
      case LabTestStatus.Completed: return 'bg-green-100 text-green-800';
      case LabTestStatus.Cancelled: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: LabTestStatus): string {
    switch (status) {
      case LabTestStatus.Requested: return 'badge-info';
      case LabTestStatus.InProgress: return 'badge-warning';
      case LabTestStatus.Completed: return 'badge-success';
      case LabTestStatus.Cancelled: return 'badge-danger';
      default: return 'badge-info';
    }
  }

  getRequestedCount(): number {
    return this.labTests.filter(t => t.status === LabTestStatus.Requested).length;
  }

  getInProgressCount(): number {
    return this.labTests.filter(t => t.status === LabTestStatus.InProgress).length;
  }

  getCompletedCount(): number {
    return this.labTests.filter(t => t.status === LabTestStatus.Completed).length;
  }
}
