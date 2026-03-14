import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyApiService } from '../../../core/api/pharmacy-api.service';
import { Prescription, PrescriptionStatus } from '../../../shared/models/prescription.model';
import { PaginationInfo } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Page Header -->
      <div class="card-medical mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Prescriptions</h1>
              <p class="text-gray-500">Gestion des prescriptions médicamenteuses</p>
            </div>
          </div>
          <a routerLink="/pharmacy/medications" class="btn btn-secondary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
            Médicaments
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
            <button (click)="filterByStatus(PrescriptionStatus.Pending)"
                    [class]="selectedStatus === PrescriptionStatus.Pending ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
              En attente
            </button>
            <button (click)="filterByStatus(PrescriptionStatus.PartiallyDispensed)"
                    [class]="selectedStatus === PrescriptionStatus.PartiallyDispensed ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              Partiel
            </button>
            <button (click)="filterByStatus(PrescriptionStatus.Dispensed)"
                    [class]="selectedStatus === PrescriptionStatus.Dispensed ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Dispensé
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getPendingCount() }}</p>
            <p class="text-sm text-gray-500">En attente</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getPartialCount() }}</p>
            <p class="text-sm text-gray-500">Partiellement</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getDispensedCount() }}</p>
            <p class="text-sm text-gray-500">Dispensées</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="spinner w-12 h-12 mb-4"></div>
          <p class="text-gray-500">Chargement des prescriptions...</p>
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
          <button (click)="loadPrescriptions()" class="btn btn-secondary">Réessayer</button>
        </div>
      </div>

      <!-- Prescriptions Table -->
      <div *ngIf="!loading && !error" class="card">
        <div class="overflow-x-auto">
          <table class="table-medical">
            <thead>
              <tr>
                <th>Médicament</th>
                <th>Dosage</th>
                <th>Quantité</th>
                <th>Progression</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prescription of prescriptions">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ prescription.medicationName }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="text-gray-600">{{ prescription.dosage }}</span>
                  <span *ngIf="prescription.frequency" class="text-gray-400"> - {{ prescription.frequency }}</span>
                </td>
                <td>
                  <span class="font-medium text-gray-900">{{ prescription.quantityDispensed }}</span>
                  <span class="text-gray-500"> / {{ prescription.quantityPrescribed }}</span>
                </td>
                <td>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all"
                         [class]="prescription.quantityDispensed >= prescription.quantityPrescribed ? 'bg-green-500' : 'bg-teal-500'"
                         [style.width.%]="(prescription.quantityDispensed / prescription.quantityPrescribed) * 100">
                    </div>
                  </div>
                </td>
                <td>
                  <span [class]="'badge ' + getStatusBadgeClass(prescription.status)">
                    <span class="w-2 h-2 rounded-full mr-1"
                          [class]="prescription.status === PrescriptionStatus.Pending ? 'bg-yellow-500' :
                                   prescription.status === PrescriptionStatus.PartiallyDispensed ? 'bg-blue-500' :
                                   prescription.status === PrescriptionStatus.Dispensed ? 'bg-green-500' : 'bg-red-500'">
                    </span>
                    {{ getStatusLabel(prescription.status) }}
                  </span>
                </td>
                <td class="text-right">
                  <button *ngIf="prescription.status !== PrescriptionStatus.Dispensed && prescription.status !== PrescriptionStatus.Cancelled"
                          (click)="openDispenseModal(prescription)"
                          class="btn btn-sm btn-primary">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Dispenser
                  </button>
                  <span *ngIf="prescription.status === PrescriptionStatus.Dispensed" class="text-green-600 text-sm flex items-center gap-1 justify-end">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Complété
                  </span>
                </td>
              </tr>
              <tr *ngIf="prescriptions?.length === 0">
                <td colspan="6">
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p class="empty-state-title">Aucune prescription trouvée</p>
                    <p class="empty-state-text">Les prescriptions en attente apparaîtront ici</p>
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

      <!-- Dispense Modal -->
      <div *ngIf="showDispenseModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="card max-w-md w-full mx-4 animate-fade-in">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Dispenser le médicament</h3>
              <p class="text-sm text-gray-500">Enregistrer une dispensation</p>
            </div>
          </div>

          <div *ngIf="selectedPrescription" class="bg-gray-50 rounded-xl p-4 mb-6">
            <p class="font-semibold text-gray-900">{{ selectedPrescription.medicationName }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-sm text-gray-500">Quantité restante:</span>
              <span class="font-semibold text-teal-600">
                {{ selectedPrescription.quantityPrescribed - selectedPrescription.quantityDispensed }} unités
              </span>
            </div>
          </div>

          <div class="mb-6">
            <label class="label">Quantité à dispenser</label>
            <input type="number" [(ngModel)]="dispenseQuantity" class="input"
                   [max]="selectedPrescription ? selectedPrescription.quantityPrescribed - selectedPrescription.quantityDispensed : 0"
                   min="1">
          </div>

          <div class="flex justify-end gap-3">
            <button (click)="closeDispenseModal()" class="btn btn-secondary">Annuler</button>
            <button (click)="dispense()" [disabled]="dispensing" class="btn btn-primary">
              <svg *ngIf="dispensing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ dispensing ? 'Traitement...' : 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: Prescription[] = [];
  pagination: PaginationInfo | null = null;
  selectedStatus: PrescriptionStatus | null = PrescriptionStatus.Pending;
  loading = false;
  error = '';
  PrescriptionStatus = PrescriptionStatus;

  showDispenseModal = false;
  selectedPrescription: Prescription | null = null;
  dispenseQuantity = 1;
  dispensing = false;

  constructor(private pharmacyApiService: PharmacyApiService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(page: number = 1): void {
    this.loading = true;
    this.error = '';

    this.pharmacyApiService.getAllPrescriptions(this.selectedStatus ?? undefined, page).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            this.prescriptions = response.data;
            this.pagination = null;
          } else {
            this.prescriptions = response.data.items || [];
            this.pagination = response.data.pagination || null;
          }
        } else {
          this.prescriptions = [];
          this.error = response.message || 'Erreur';
        }
        this.loading = false;
      },
      error: (err) => {
        this.prescriptions = [];
        this.error = err.error?.message || 'Erreur';
        this.loading = false;
      }
    });
  }

  filterByStatus(status: PrescriptionStatus | null): void {
    this.selectedStatus = status;
    this.loadPrescriptions();
  }

  openDispenseModal(prescription: Prescription): void {
    this.selectedPrescription = prescription;
    this.dispenseQuantity = prescription.quantityPrescribed - prescription.quantityDispensed;
    this.showDispenseModal = true;
  }

  closeDispenseModal(): void {
    this.showDispenseModal = false;
    this.selectedPrescription = null;
  }

  dispense(): void {
    if (!this.selectedPrescription) return;

    this.dispensing = true;
    this.pharmacyApiService.dispensePrescription(this.selectedPrescription.id, {
      quantityToDispense: this.dispenseQuantity
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeDispenseModal();
          this.loadPrescriptions();
        } else {
          alert(response.message || 'Erreur');
        }
        this.dispensing = false;
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur');
        this.dispensing = false;
      }
    });
  }

  getStatusLabel(status: PrescriptionStatus): string {
    switch (status) {
      case PrescriptionStatus.Pending: return 'En attente';
      case PrescriptionStatus.PartiallyDispensed: return 'Partiel';
      case PrescriptionStatus.Dispensed: return 'Dispensé';
      case PrescriptionStatus.Cancelled: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  getStatusClass(status: PrescriptionStatus): string {
    switch (status) {
      case PrescriptionStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case PrescriptionStatus.PartiallyDispensed: return 'bg-blue-100 text-blue-800';
      case PrescriptionStatus.Dispensed: return 'bg-green-100 text-green-800';
      case PrescriptionStatus.Cancelled: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(status: PrescriptionStatus): string {
    switch (status) {
      case PrescriptionStatus.Pending: return 'badge-warning';
      case PrescriptionStatus.PartiallyDispensed: return 'badge-info';
      case PrescriptionStatus.Dispensed: return 'badge-success';
      case PrescriptionStatus.Cancelled: return 'badge-danger';
      default: return 'badge-info';
    }
  }

  getPendingCount(): number {
    return this.prescriptions.filter(p => p.status === PrescriptionStatus.Pending).length;
  }

  getPartialCount(): number {
    return this.prescriptions.filter(p => p.status === PrescriptionStatus.PartiallyDispensed).length;
  }

  getDispensedCount(): number {
    return this.prescriptions.filter(p => p.status === PrescriptionStatus.Dispensed).length;
  }

  goToPage(page: number): void {
    if (page >= 1 && this.pagination && page <= this.pagination.totalPages) {
      this.loadPrescriptions(page);
    }
  }
}
