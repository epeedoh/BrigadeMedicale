import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPortalService } from '../../../core/services/patient-portal.service';
import { PatientPrescription } from '../../../../../shared/models/patient.model';

@Component({
  selector: 'app-pharmacie',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900">Pharmacie</h1>
        <p class="text-lg text-gray-500 mt-2">Vos ordonnances et médicaments</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && prescriptions.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
        </svg>
        <p class="mt-4 text-gray-600 font-medium">Aucune ordonnance</p>
        <p class="mt-1 text-sm text-gray-500">Vos prescriptions médicamenteuses apparaîtront ici</p>
      </div>

      <!-- Pending Prescriptions Alert -->
      <div *ngIf="!loading && getPendingPrescriptions().length > 0"
           class="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-teal-800">Médicaments à récupérer</p>
            <p class="text-sm text-teal-700 mt-1">
              {{ getPendingPrescriptions().length }} médicament(s) en attente de délivrance à la pharmacie.
            </p>
          </div>
        </div>
      </div>

      <!-- Prescriptions List -->
      <div *ngIf="!loading && prescriptions.length > 0" class="space-y-4">
        <div *ngFor="let prescription of prescriptions"
             class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Prescription Card -->
          <div class="p-4 sm:p-5">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div [class]="getStatusIconClass(prescription.status)"
                   class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span [class]="getStatusClass(prescription.status)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ getStatusLabel(prescription.status) }}
                  </span>
                </div>
                <h3 class="font-medium text-gray-900 text-sm sm:text-base">{{ prescription.medicationName }}</h3>
                <p class="text-xs sm:text-sm text-gray-500 mt-1">{{ prescription.dosage }}</p>
                <div *ngIf="prescription.frequency || prescription.duration" class="mt-2 flex flex-wrap gap-2">
                  <span *ngIf="prescription.frequency" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {{ prescription.frequency }}
                  </span>
                  <span *ngIf="prescription.duration" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {{ prescription.duration }}
                  </span>
                </div>
              </div>

              <!-- Quantity -->
              <div class="text-right flex-shrink-0">
                <p class="text-xs text-gray-500">Quantité</p>
                <p class="font-semibold text-gray-900">
                  {{ prescription.quantityDispensed }} / {{ prescription.quantityPrescribed }}
                </p>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="px-4 sm:px-5 pb-4 sm:pb-5">
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all"
                   [class]="getProgressClass(prescription.status)"
                   [style.width.%]="getProgressPercent(prescription)">
              </div>
            </div>
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-gray-500">
                {{ getProgressLabel(prescription) }}
              </p>
              <p class="text-xs text-gray-400">
                Prescrit le {{ formatDate(prescription.prescribedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Summary -->
      <div *ngIf="!loading && prescriptions.length > 0" class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ prescriptions.length }}</p>
          <p class="text-xs text-gray-500">Ordonnances</p>
        </div>
        <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p class="text-xl sm:text-2xl font-bold text-green-600">{{ getDispensedCount() }}</p>
          <p class="text-xs text-gray-500">Délivrés</p>
        </div>
        <div class="bg-white rounded-xl p-4 text-center border border-gray-100">
          <p class="text-xl sm:text-2xl font-bold text-teal-600">{{ getPendingPrescriptions().length }}</p>
          <p class="text-xs text-gray-500">À récupérer</p>
        </div>
      </div>

      <!-- Info -->
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-sm text-blue-700">
              Présentez-vous à la pharmacie de la Brigade Médicale avec votre numéro patient ou QR code pour récupérer vos médicaments.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PharmacieComponent implements OnInit {
  prescriptions: PatientPrescription[] = [];
  loading = true;

  constructor(private patientPortalService: PatientPortalService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  private loadPrescriptions(): void {
    this.loading = true;
    this.patientPortalService.getPrescriptions().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.prescriptions = response.data || [];
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading prescriptions:', err);
      }
    });
  }

  getPendingPrescriptions(): PatientPrescription[] {
    return this.prescriptions.filter(p => p.status < 2);
  }

  getDispensedCount(): number {
    return this.prescriptions.filter(p => p.status === 2).length;
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-700';
      case 1: return 'bg-blue-100 text-blue-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusIconClass(status: number): string {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-600';
      case 1: return 'bg-blue-100 text-blue-600';
      case 2: return 'bg-green-100 text-green-600';
      case 3: return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'En attente';
      case 1: return 'Partiellement délivré';
      case 2: return 'Délivré';
      case 3: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  getProgressClass(status: number): string {
    switch (status) {
      case 0: return 'bg-yellow-400';
      case 1: return 'bg-blue-400';
      case 2: return 'bg-green-500';
      case 3: return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  }

  getProgressPercent(prescription: PatientPrescription): number {
    if (prescription.quantityPrescribed === 0) return 0;
    return (prescription.quantityDispensed / prescription.quantityPrescribed) * 100;
  }

  getProgressLabel(prescription: PatientPrescription): string {
    const remaining = prescription.quantityPrescribed - prescription.quantityDispensed;
    if (remaining === 0) return 'Entièrement délivré';
    return `${remaining} unité(s) restante(s)`;
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
