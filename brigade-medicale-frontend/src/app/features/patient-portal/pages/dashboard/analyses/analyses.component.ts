import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPortalService } from '../../../core/services/patient-portal.service';
import { PatientLabTest } from '../../../../../shared/models/patient.model';

@Component({
  selector: 'app-analyses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900">Mes analyses</h1>
        <p class="text-xl text-gray-500 mt-2">Résultats de vos examens de laboratoire</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && labTests.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <svg class="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
        </svg>
        <p class="mt-5 text-gray-600 font-medium text-lg">Aucune analyse</p>
        <p class="mt-2 text-base text-gray-500">Vos résultats d'analyses apparaîtront ici</p>
      </div>

      <!-- Pending Analyses Alert -->
      <div *ngIf="!loading && getPendingTests().length > 0"
           class="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-amber-800 text-base">Analyses en attente</p>
            <p class="text-base text-amber-700 mt-1">
              {{ getPendingTests().length }} analyse(s) en cours de traitement. Les résultats seront disponibles prochainement.
            </p>
          </div>
        </div>
      </div>

      <!-- Lab Tests List -->
      <div *ngIf="!loading && labTests.length > 0" class="space-y-5">
        <div *ngFor="let test of labTests"
             class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
             [class.cursor-pointer]="test.status === 2"
             (click)="test.status === 2 ? toggleExpand(test.id) : null">
          <!-- Test Header -->
          <div class="p-5 sm:p-6">
            <div class="flex items-start gap-5">
              <!-- Status Icon -->
              <div [class]="getStatusIconClass(test.status)"
                   class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg *ngIf="test.status === 2" class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <svg *ngIf="test.status === 1" class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg *ngIf="test.status === 0" class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <svg *ngIf="test.status === 3" class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span [class]="getStatusClass(test.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                    {{ getStatusLabel(test.status) }}
                  </span>
                </div>
                <h3 class="font-medium text-gray-900 text-base sm:text-lg">{{ test.testName }}</h3>
                <p class="text-sm sm:text-base text-gray-500 mt-2">{{ test.testType }}</p>
              </div>

              <!-- Date & Expand -->
              <div class="text-right flex-shrink-0">
                <p class="text-sm sm:text-base text-gray-500">{{ formatDate(test.requestedAt) }}</p>
                <svg *ngIf="test.status === 2"
                     class="w-6 h-6 text-gray-400 mt-2 mx-auto transition-transform"
                     [class.rotate-180]="expandedId === test.id"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Expanded Results -->
          <div *ngIf="expandedId === test.id && test.status === 2"
               class="border-t border-gray-100 p-5 sm:p-6 bg-gray-50 animate-expand">
            <div class="space-y-5">
              <!-- Results -->
              <div *ngIf="test.results">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Résultats</p>
                <div class="bg-white rounded-lg p-5 border border-gray-200">
                  <p class="text-base text-gray-900 whitespace-pre-line">{{ test.results }}</p>
                </div>
              </div>

              <!-- Normal Range -->
              <div *ngIf="test.normalRange" class="flex items-center gap-3 text-base text-gray-600">
                <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Valeurs normales : {{ test.normalRange }}</span>
              </div>

              <!-- Completed Date -->
              <div *ngIf="test.completedAt" class="text-sm text-gray-500">
                Résultats disponibles le {{ formatDate(test.completedAt) }}
              </div>
            </div>
          </div>

          <!-- Pending Indicator -->
          <div *ngIf="test.status < 2" class="px-5 sm:px-6 pb-5 sm:pb-6">
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full rounded-full animate-pulse"
                   [class]="test.status === 1 ? 'bg-yellow-400 w-2/3' : 'bg-blue-400 w-1/3'">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Summary -->
      <div *ngIf="!loading && labTests.length > 0" class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-xl p-5 text-center border border-gray-100">
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ labTests.length }}</p>
          <p class="text-sm text-gray-500 mt-1">Total</p>
        </div>
        <div class="bg-white rounded-xl p-5 text-center border border-gray-100">
          <p class="text-2xl sm:text-3xl font-bold text-green-600">{{ getCompletedCount() }}</p>
          <p class="text-sm text-gray-500 mt-1">Terminées</p>
        </div>
        <div class="bg-white rounded-xl p-5 text-center border border-gray-100">
          <p class="text-2xl sm:text-3xl font-bold text-amber-600">{{ getPendingTests().length }}</p>
          <p class="text-sm text-gray-500 mt-1">En attente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-expand {
      animation: expand 0.2s ease-out;
    }
    @keyframes expand {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AnalysesComponent implements OnInit {
  labTests: PatientLabTest[] = [];
  loading = true;
  expandedId: string | null = null;

  constructor(private patientPortalService: PatientPortalService) {}

  ngOnInit(): void {
    this.loadLabTests();
  }

  private loadLabTests(): void {
    this.loading = true;
    this.patientPortalService.getLabTests().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.labTests = response.data || [];
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading lab tests:', err);
      }
    });
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  getPendingTests(): PatientLabTest[] {
    return this.labTests.filter(t => t.status < 2);
  }

  getCompletedCount(): number {
    return this.labTests.filter(t => t.status === 2).length;
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-blue-100 text-blue-700';
      case 1: return 'bg-yellow-100 text-yellow-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusIconClass(status: number): string {
    switch (status) {
      case 0: return 'bg-blue-100 text-blue-600';
      case 1: return 'bg-yellow-100 text-yellow-600';
      case 2: return 'bg-green-100 text-green-600';
      case 3: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Demandée';
      case 1: return 'En cours';
      case 2: return 'Terminée';
      case 3: return 'Annulée';
      default: return 'Inconnu';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
