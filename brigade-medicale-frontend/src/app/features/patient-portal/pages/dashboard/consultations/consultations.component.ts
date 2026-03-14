import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPortalService } from '../../../core/services/patient-portal.service';
import { PatientConsultation } from '../../../../../shared/models/patient.model';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900">Mes consultations</h1>
        <p class="text-xl text-gray-500 mt-2">Historique de vos consultations médicales</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && consultations.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <svg class="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
        </svg>
        <p class="mt-5 text-gray-600 font-medium text-lg">Aucune consultation</p>
        <p class="mt-2 text-base text-gray-500">Vos consultations médicales apparaîtront ici</p>
      </div>

      <!-- Consultations List -->
      <div *ngIf="!loading && consultations.length > 0" class="space-y-5">
        <div *ngFor="let consultation of consultations"
             class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
             (click)="toggleExpand(consultation.id)">
          <!-- Consultation Header -->
          <div class="p-5 sm:p-6">
            <div class="flex items-start gap-5">
              <!-- Status Icon -->
              <div [class]="getStatusIconClass(consultation.status)"
                   class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg *ngIf="consultation.status === 1" class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <svg *ngIf="consultation.status === 0" class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg *ngIf="consultation.status === 2" class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span [class]="getStatusClass(consultation.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                    {{ getStatusLabel(consultation.status) }}
                  </span>
                </div>
                <h3 class="font-medium text-gray-900 text-base sm:text-lg">{{ consultation.chiefComplaint }}</h3>
                <p class="text-sm sm:text-base text-gray-500 mt-2">
                  <span class="inline-flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Dr. {{ consultation.doctorName }}
                  </span>
                </p>
              </div>

              <!-- Date & Expand -->
              <div class="text-right flex-shrink-0">
                <p class="text-sm sm:text-base text-gray-500">{{ formatDate(consultation.consultationDate) }}</p>
                <svg class="w-6 h-6 text-gray-400 mt-2 mx-auto transition-transform"
                     [class.rotate-180]="expandedId === consultation.id"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Expanded Details -->
          <div *ngIf="expandedId === consultation.id" class="border-t border-gray-100 p-5 sm:p-6 bg-gray-50 animate-expand">
            <div class="space-y-5">
              <!-- Diagnosis -->
              <div *ngIf="consultation.diagnosis">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Diagnostic</p>
                <p class="text-base text-gray-900 bg-white rounded-lg p-4 border border-gray-200">
                  {{ consultation.diagnosis }}
                </p>
              </div>

              <!-- Treatment -->
              <div *ngIf="consultation.treatment">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Traitement prescrit</p>
                <p class="text-base text-gray-900 bg-white rounded-lg p-4 border border-gray-200 whitespace-pre-line">
                  {{ consultation.treatment }}
                </p>
              </div>

              <!-- Notes -->
              <div *ngIf="consultation.notes">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <p class="text-base text-gray-700 bg-white rounded-lg p-4 border border-gray-200 whitespace-pre-line">
                  {{ consultation.notes }}
                </p>
              </div>

              <!-- No details -->
              <div *ngIf="!consultation.diagnosis && !consultation.treatment && !consultation.notes"
                   class="text-center py-6 text-gray-500">
                <p class="text-base">Aucun détail disponible pour cette consultation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Summary -->
      <div *ngIf="!loading && consultations.length > 0" class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-xl p-5 text-center border border-gray-100">
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ consultations.length }}</p>
          <p class="text-sm text-gray-500 mt-1">Total</p>
        </div>
        <div class="bg-white rounded-xl p-5 text-center border border-gray-100">
          <p class="text-2xl sm:text-3xl font-bold text-green-600">{{ getCompletedCount() }}</p>
          <p class="text-sm text-gray-500 mt-1">Terminées</p>
        </div>
        <div class="bg-white rounded-xl p-5 text-center border border-gray-100">
          <p class="text-2xl sm:text-3xl font-bold text-blue-600">{{ getInProgressCount() }}</p>
          <p class="text-sm text-gray-500 mt-1">En cours</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-expand {
      animation: expand 0.2s ease-out;
    }
    @keyframes expand {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 500px; }
    }
  `]
})
export class ConsultationsComponent implements OnInit {
  consultations: PatientConsultation[] = [];
  loading = true;
  expandedId: string | null = null;

  constructor(private patientPortalService: PatientPortalService) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  private loadConsultations(): void {
    this.loading = true;
    this.patientPortalService.getConsultations().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.consultations = response.data || [];
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading consultations:', err);
      }
    });
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-blue-100 text-blue-700';
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusIconClass(status: number): string {
    switch (status) {
      case 0: return 'bg-blue-100 text-blue-600';
      case 1: return 'bg-green-100 text-green-600';
      case 2: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'En cours';
      case 1: return 'Terminée';
      case 2: return 'Annulée';
      default: return 'Inconnu';
    }
  }

  getCompletedCount(): number {
    return this.consultations.filter(c => c.status === 1).length;
  }

  getInProgressCount(): number {
    return this.consultations.filter(c => c.status === 0).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
