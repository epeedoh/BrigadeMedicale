import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyApiService } from '../../../core/api/pharmacy-api.service';
import { Medication, MedicationForm } from '../../../shared/models/prescription.model';
import { PaginationInfo } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-medication-list',
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Médicaments</h1>
              <p class="text-gray-500">Gestion du stock de médicaments</p>
            </div>
          </div>
          <div class="flex gap-3">
            <a routerLink="/pharmacy/prescriptions" class="btn btn-secondary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              Prescriptions
            </a>
            <a routerLink="/pharmacy/medications/create" class="btn btn-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nouveau
            </a>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="card mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input type="text" [(ngModel)]="searchQuery" (input)="search()"
                   placeholder="Rechercher un médicament..."
                   class="input pl-12">
          </div>
          <button (click)="loadMedications()" class="btn btn-secondary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div *ngIf="lowStockMedications.length > 0" class="card border-l-4 border-orange-400 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-orange-800">Stock faible</h3>
            <p class="text-sm text-orange-600 mt-1">{{ lowStockMedications.length }} médicaments ont un stock critique</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <span *ngFor="let med of lowStockMedications"
                    class="badge badge-warning">
                {{ med.name }} ({{ med.currentStock }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ pagination?.totalItems || medications.length }}</p>
            <p class="text-sm text-gray-500">Total médicaments</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getNormalStockCount() }}</p>
            <p class="text-sm text-gray-500">Stock normal</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ lowStockMedications.length }}</p>
            <p class="text-sm text-gray-500">Stock faible</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="spinner w-12 h-12 mb-4"></div>
          <p class="text-gray-500">Chargement des médicaments...</p>
        </div>
      </div>

      <!-- Medications Table -->
      <div *ngIf="!loading" class="card">
        <div class="overflow-x-auto">
          <table class="table-medical">
            <thead>
              <tr>
                <th>Médicament</th>
                <th>Forme</th>
                <th>Dosage</th>
                <th>Stock</th>
                <th>Niveau</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let medication of medications"
                  class="cursor-pointer"
                  [routerLink]="['/pharmacy/medications', medication.id]">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ medication.name }}</p>
                      <p *ngIf="medication.genericName" class="text-sm text-gray-500">{{ medication.genericName }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge badge-info">{{ getFormLabel(medication.form) }}</span>
                </td>
                <td>
                  <span class="text-gray-700">{{ medication.strength }} {{ medication.unit }}</span>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <span [class]="medication.currentStock <= medication.minimumStock ? 'text-red-600 font-semibold' : 'text-gray-900 font-medium'">
                      {{ medication.currentStock }}
                    </span>
                    <span class="text-gray-400">/ {{ medication.minimumStock }} min</span>
                  </div>
                </td>
                <td>
                  <div class="w-full max-w-24">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="h-2 rounded-full transition-all"
                           [class]="medication.currentStock <= medication.minimumStock ? 'bg-red-500' :
                                    medication.currentStock <= medication.minimumStock * 2 ? 'bg-orange-500' : 'bg-green-500'"
                           [style.width.%]="Math.min((medication.currentStock / (medication.minimumStock * 3)) * 100, 100)">
                      </div>
                    </div>
                    <span [class]="medication.currentStock <= medication.minimumStock ? 'badge badge-danger mt-1' :
                                   medication.currentStock <= medication.minimumStock * 2 ? 'badge badge-warning mt-1' : 'badge badge-success mt-1'">
                      {{ medication.currentStock <= medication.minimumStock ? 'Critique' :
                         medication.currentStock <= medication.minimumStock * 2 ? 'Faible' : 'Normal' }}
                    </span>
                  </div>
                </td>
                <td class="text-right">
                  <a [routerLink]="['/pharmacy/medications', medication.id]"
                     (click)="$event.stopPropagation()"
                     class="btn btn-sm btn-secondary">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Détails
                  </a>
                </td>
              </tr>
              <tr *ngIf="medications?.length === 0">
                <td colspan="6">
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                    <p class="empty-state-title">Aucun médicament trouvé</p>
                    <p class="empty-state-text">Commencez par ajouter des médicaments au stock</p>
                    <a routerLink="/pharmacy/medications/create" class="btn btn-primary mt-4">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      Nouveau médicament
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
export class MedicationListComponent implements OnInit {
  medications: Medication[] = [];
  lowStockMedications: Medication[] = [];
  pagination: PaginationInfo | null = null;
  searchQuery = '';
  loading = false;
  Math = Math;

  constructor(private pharmacyApiService: PharmacyApiService) {}

  ngOnInit(): void {
    this.loadMedications();
    this.loadLowStock();
  }

  loadMedications(page: number = 1): void {
    this.loading = true;
    this.pharmacyApiService.getMedications(this.searchQuery, page).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            this.medications = response.data;
            this.pagination = null;
          } else {
            this.medications = response.data.items || [];
            this.pagination = response.data.pagination || null;
          }
        } else {
          this.medications = [];
        }
        this.loading = false;
      },
      error: () => {
        this.medications = [];
        this.loading = false;
      }
    });
  }

  loadLowStock(): void {
    this.pharmacyApiService.getLowStockMedications().subscribe({
      next: (response) => {
        if (response.success) {
          this.lowStockMedications = response.data;
        }
      }
    });
  }

  search(): void {
    this.loadMedications();
  }

  getFormLabel(form: MedicationForm): string {
    const labels: Record<MedicationForm, string> = {
      [MedicationForm.Tablet]: 'Comprimé',
      [MedicationForm.Capsule]: 'Gélule',
      [MedicationForm.Syrup]: 'Sirop',
      [MedicationForm.Injection]: 'Injection',
      [MedicationForm.Cream]: 'Crème',
      [MedicationForm.Ointment]: 'Pommade',
      [MedicationForm.Drops]: 'Gouttes',
      [MedicationForm.Inhaler]: 'Inhalateur',
      [MedicationForm.Suppository]: 'Suppositoire',
      [MedicationForm.Other]: 'Autre'
    };
    return labels[form] || 'Autre';
  }

  getNormalStockCount(): number {
    return this.medications.filter(m => m.currentStock > m.minimumStock).length;
  }

  goToPage(page: number): void {
    if (page >= 1 && this.pagination && page <= this.pagination.totalPages) {
      this.loadMedications(page);
    }
  }
}
