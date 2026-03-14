import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriageService } from '../../core/services/triage.service';
import { TriageRecord, UrgencyLevel } from '../../core/models/triage.model';

/**
 * Widget affichant le résumé du triage du jour pour une consultation
 * À intégrer dans la page consultation médecin
 */
@Component({
  selector: 'app-triage-summary-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-900">Triage du jour</h3>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-4">
        <div class="inline-block w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      <!-- No Triage State -->
      <div *ngIf="!loading && !triage" class="text-center py-6">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        <p class="text-gray-600 font-medium">Aucun triage enregistré</p>
        <p class="text-sm text-gray-500 mt-1">Les constantes du patient n'ont pas été prises</p>
      </div>

      <!-- Triage Data Display -->
      <div *ngIf="!loading && triage" class="space-y-4">
        <!-- Urgency Badge -->
        <div class="flex items-center gap-2">
          <span [class]="getUrgencyColor()" class="px-3 py-1 rounded-full text-sm font-semibold">
            {{ getUrgencyLabel(triage.urgencyLevel) }}
          </span>
          <span class="text-sm text-gray-600">{{ getFormattedTime(triage.recordedAt) }}</span>
        </div>

        <!-- Chief Complaint -->
        <div class="bg-white rounded-lg p-4">
          <p class="text-sm text-gray-600 font-medium">Motif</p>
          <p class="text-base text-gray-900 mt-1">{{ triage.complaint }}</p>
        </div>

        <!-- Vital Signs Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-white rounded-lg p-3 text-center">
            <p class="text-xs text-gray-600">Temp.</p>
            <p class="text-lg font-bold text-gray-900">{{ triage.temperature }}°C</p>
          </div>
          <div class="bg-white rounded-lg p-3 text-center">
            <p class="text-xs text-gray-600">Pouls</p>
            <p class="text-lg font-bold text-gray-900">{{ triage.pulse }} bpm</p>
          </div>
          <div class="bg-white rounded-lg p-3 text-center">
            <p class="text-xs text-gray-600">TA</p>
            <p class="text-lg font-bold text-gray-900">{{ triage.systolic }}/{{ triage.diastolic }}</p>
          </div>
          <div class="bg-white rounded-lg p-3 text-center">
            <p class="text-xs text-gray-600">IMC</p>
            <p class="text-lg font-bold text-gray-900">{{ calculateIMC() }}</p>
          </div>
        </div>

        <!-- Additional Vitals -->
        <div class="grid grid-cols-3 gap-2 text-sm">
          <div class="bg-white rounded p-2">
            <p class="text-gray-600">Poids</p>
            <p class="font-semibold text-gray-900">{{ triage.weight }} kg</p>
          </div>
          <div class="bg-white rounded p-2">
            <p class="text-gray-600">Taille</p>
            <p class="font-semibold text-gray-900">{{ triage.height }} cm</p>
          </div>
          <div *ngIf="triage.spO2" class="bg-white rounded p-2">
            <p class="text-gray-600">SpO2</p>
            <p class="font-semibold text-gray-900">{{ triage.spO2 }}%</p>
          </div>
        </div>

        <!-- Notes -->
        <div *ngIf="triage.notes" class="bg-white rounded-lg p-4 border-l-4 border-blue-500">
          <p class="text-sm text-gray-600 font-medium">Notes</p>
          <p class="text-base text-gray-900 mt-1 whitespace-pre-wrap">{{ triage.notes }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TriageSummaryWidgetComponent implements OnInit {
  @Input() patientId!: string;
  @Input() visitId?: string;

  triage: TriageRecord | null = null;
  loading = false;

  constructor(private triageService: TriageService) {}

  ngOnInit(): void {
    if (this.visitId) {
      this.loadTriageByVisit();
    } else if (this.patientId) {
      this.loadLatestTriage();
    }
  }

  private loadLatestTriage(): void {
    this.loading = true;
    this.triageService.getLatestTriage(this.patientId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.triage = response.data;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadTriageByVisit(): void {
    if (!this.visitId) return;
    this.loading = true;
    this.triageService.getTriageByVisit(this.visitId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.triage = response.data;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateIMC(): string {
    if (this.triage) {
      const imc = this.triageService.calculateIMC(this.triage.weight, this.triage.height);
      return `${imc} kg/m²`;
    }
    return '-';
  }

  getUrgencyColor(): string {
    switch (this.triage?.urgencyLevel) {
      case UrgencyLevel.GREEN:
        return 'bg-green-100 text-green-800';
      case UrgencyLevel.YELLOW:
        return 'bg-yellow-100 text-yellow-800';
      case UrgencyLevel.RED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getUrgencyLabel(level?: number): string {
    switch (level) {
      case UrgencyLevel.GREEN:
        return '🟢 Vert - Non urgent';
      case UrgencyLevel.YELLOW:
        return '🟡 Jaune - Peu urgent';
      case UrgencyLevel.RED:
        return '🔴 Rouge - Très urgent';
      default:
        return '-';
    }
  }

  getFormattedTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
