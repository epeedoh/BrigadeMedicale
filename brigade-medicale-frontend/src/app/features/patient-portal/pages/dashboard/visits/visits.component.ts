import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientPortalService } from '../../../core/services/patient-portal.service';
import { PatientVisit } from '../../../../../shared/models/patient.model';

@Component({
  selector: 'app-visits',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900">Mes visites</h1>
        <p class="text-xl text-gray-500 mt-2">Historique de vos passages à la clinique</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && visits.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <svg class="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="mt-5 text-gray-600 font-medium text-lg">Aucune visite enregistrée</p>
        <p class="mt-2 text-base text-gray-500">Vos passages à la clinique apparaîtront ici</p>
      </div>

      <!-- Visits Timeline -->
      <div *ngIf="!loading && visits.length > 0" class="space-y-5">
        <div *ngFor="let visit of visits; let i = index"
             class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-5 sm:p-6">
            <div class="flex items-start gap-5">
              <!-- Date Badge -->
              <div class="flex-shrink-0 w-18 sm:w-20 text-center">
                <div class="bg-teal-50 rounded-xl p-3 sm:p-4">
                  <p class="text-xl sm:text-2xl font-bold text-teal-700">{{ getDay(visit.visitDate) }}</p>
                  <p class="text-sm text-teal-600 uppercase">{{ getMonth(visit.visitDate) }}</p>
                </div>
                <p class="text-sm text-gray-400 mt-2">{{ getYear(visit.visitDate) }}</p>
              </div>

              <!-- Visit Info -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <span *ngIf="visit.hasConsultation" class="tag tag-blue">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Consultation
                  </span>
                  <span *ngIf="visit.hasLabTests" class="tag tag-purple">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                    </svg>
                    Analyses
                  </span>
                  <span *ngIf="visit.hasPrescriptions" class="tag tag-green">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                    Ordonnance
                  </span>
                </div>
                <p *ngIf="visit.reason" class="text-base text-gray-600">{{ visit.reason }}</p>
                <p *ngIf="!visit.reason" class="text-base text-gray-400 italic">Pas de motif renseigné</p>
              </div>

              <!-- Action -->
              <a *ngIf="visit.consultationId"
                 [routerLink]="['/patient/dashboard/consultations']"
                 class="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-teal-50 hover:text-teal-600 transition-all">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="bg-teal-50 rounded-xl p-5 border border-teal-100">
        <div class="flex items-start gap-4">
          <svg class="w-7 h-7 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-base text-teal-700">
              Cette liste récapitule tous vos passages à la Brigade Médicale.
              Cliquez sur une visite avec consultation pour voir les détails.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tag {
      @apply inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium;
    }
    .tag-blue {
      @apply bg-blue-100 text-blue-700;
    }
    .tag-purple {
      @apply bg-purple-100 text-purple-700;
    }
    .tag-green {
      @apply bg-green-100 text-green-700;
    }
  `]
})
export class VisitsComponent implements OnInit {
  visits: PatientVisit[] = [];
  loading = true;

  constructor(private patientPortalService: PatientPortalService) {}

  ngOnInit(): void {
    this.loadVisits();
  }

  private loadVisits(): void {
    this.loading = true;
    this.patientPortalService.getVisits().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.visits = response.data || [];
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading visits:', err);
        // Mock data for demo
        this.visits = [];
      }
    });
  }

  getDay(dateString: string): string {
    return new Date(dateString).getDate().toString().padStart(2, '0');
  }

  getMonth(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', { month: 'short' });
  }

  getYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }
}
