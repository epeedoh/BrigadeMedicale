import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientPortalService } from '../../../core/services/patient-portal.service';
import { PatientTokenService } from '../../../core/services/patient-token.service';
import {
  PatientProfile,
  PatientConsultation,
  PatientLabTest,
  PatientPrescription,
  PatientAnnouncement
} from '../../../../../shared/models/patient.model';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 sm:p-10 text-white">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 class="text-4xl sm:text-5xl font-bold">Bonjour, {{ profile?.firstName || 'Patient' }} !</h1>
            <p class="text-teal-100 mt-3 text-xl sm:text-2xl">Bienvenue dans votre espace santé personnalisé</p>
          </div>
          <div class="flex items-center gap-4 bg-white/20 rounded-xl px-6 py-4 self-start">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="font-mono text-lg sm:text-xl">{{ patientNumber }}</span>
          </div>
        </div>
      </div>

      <!-- QR Code Card (mobile) -->
      <div *ngIf="qrCodeUrl" class="sm:hidden bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-5">
          <img [src]="qrCodeUrl" alt="QR Code" class="w-24 h-24 rounded-lg">
          <div class="flex-1">
            <p class="font-medium text-gray-900 text-base">Votre QR Code</p>
            <p class="text-sm text-gray-500 mt-1">Présentez-le à l'accueil pour une prise en charge rapide</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg class="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <p class="text-3xl sm:text-4xl font-bold text-gray-900">{{ consultations.length }}</p>
              <p class="text-base text-gray-500 mt-1">Consultations</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg class="w-9 h-9 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
              </svg>
            </div>
            <div>
              <p class="text-3xl sm:text-4xl font-bold text-gray-900">{{ labTests.length }}</p>
              <p class="text-base text-gray-500 mt-1">Analyses</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center">
              <svg class="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <div>
              <p class="text-3xl sm:text-4xl font-bold text-gray-900">{{ prescriptions.length }}</p>
              <p class="text-base text-gray-500 mt-1">Ordonnances</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg class="w-9 h-9 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-3xl sm:text-4xl font-bold text-gray-900">{{ getPendingCount() }}</p>
              <p class="text-base text-gray-500 mt-1">En attente</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <!-- Recent Consultations -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900 text-2xl">Dernières consultations</h2>
            <a routerLink="/patient/dashboard/consultations" class="text-lg text-teal-600 hover:text-teal-700 font-medium">
              Voir tout
            </a>
          </div>
          <div class="p-6">
            <div *ngIf="loading" class="flex items-center justify-center py-10">
              <div class="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div *ngIf="!loading && consultations.length === 0" class="text-center py-10">
              <svg class="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <p class="mt-4 text-lg text-gray-500">Aucune consultation</p>
            </div>
            <div *ngIf="!loading && consultations.length > 0" class="space-y-5">
              <div *ngFor="let consultation of consultations.slice(0, 3)"
                   class="p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 text-lg truncate">{{ consultation.chiefComplaint }}</p>
                    <p class="text-base text-gray-500 mt-2">Dr. {{ consultation.doctorName }}</p>
                  </div>
                  <span [class]="getStatusClass(consultation.status)" class="text-base px-4 py-2 rounded-full whitespace-nowrap">
                    {{ getStatusLabel(consultation.status) }}
                  </span>
                </div>
                <p class="text-base text-gray-400 mt-3">{{ formatDate(consultation.consultationDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Announcements -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-bold text-gray-900 text-2xl">Informations</h2>
            <a routerLink="/patient/dashboard/infos" class="text-lg text-teal-600 hover:text-teal-700 font-medium">
              Voir tout
            </a>
          </div>
          <div class="p-5 space-y-4">
            <div *ngFor="let announcement of announcements.slice(0, 3)"
                 class="p-4 rounded-lg"
                 [class]="getAnnouncementClass(announcement.type)">
              <div class="flex items-start gap-3">
                <span [innerHTML]="getAnnouncementIcon(announcement.type)" class="flex-shrink-0 mt-0.5"></span>
                <div>
                  <p class="font-medium text-base">{{ announcement.title }}</p>
                  <p class="text-sm mt-1 line-clamp-2">{{ announcement.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Items Alert -->
      <div *ngIf="getPendingLabTests().length > 0 || getPendingPrescriptions().length > 0"
           class="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-medium text-amber-800 text-lg">Éléments en attente</p>
            <ul class="mt-3 space-y-2">
              <li *ngIf="getPendingLabTests().length > 0" class="text-base text-amber-700">
                • {{ getPendingLabTests().length }} analyse(s) en cours
              </li>
              <li *ngIf="getPendingPrescriptions().length > 0" class="text-base text-amber-700">
                • {{ getPendingPrescriptions().length }} médicament(s) à récupérer
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class OverviewComponent implements OnInit {
  profile: PatientProfile | null = null;
  patientNumber: string | null = null;
  qrCodeUrl: string | null = null;
  consultations: PatientConsultation[] = [];
  labTests: PatientLabTest[] = [];
  prescriptions: PatientPrescription[] = [];
  announcements: PatientAnnouncement[] = [];
  loading = true;

  constructor(
    private patientPortalService: PatientPortalService,
    private patientTokenService: PatientTokenService
  ) {}

  ngOnInit(): void {
    this.patientNumber = this.patientTokenService.getPatientNumber();
    this.qrCodeUrl = this.patientTokenService.getQrCode();
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    // Load profile
    this.patientPortalService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.profile = response.data;
        }
      },
      error: (err) => console.error('Error loading profile:', err)
    });

    // Load consultations
    this.patientPortalService.getConsultations().subscribe({
      next: (response) => {
        if (response.success) {
          this.consultations = response.data || [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading consultations:', err);
        this.loading = false;
      }
    });

    // Load lab tests
    this.patientPortalService.getLabTests().subscribe({
      next: (response) => {
        if (response.success) {
          this.labTests = response.data || [];
        }
      },
      error: (err) => console.error('Error loading lab tests:', err)
    });

    // Load prescriptions
    this.patientPortalService.getPrescriptions().subscribe({
      next: (response) => {
        if (response.success) {
          this.prescriptions = response.data || [];
        }
      },
      error: (err) => console.error('Error loading prescriptions:', err)
    });

    // Load announcements
    this.patientPortalService.getAnnouncements().subscribe({
      next: (response) => {
        if (response.success) {
          this.announcements = response.data || [];
        }
      },
      error: (err) => console.error('Error loading announcements:', err)
    });
  }

  getPendingCount(): number {
    const pendingLabs = this.labTests.filter(t => t.status < 2).length;
    const pendingRx = this.prescriptions.filter(p => p.status < 2).length;
    return pendingLabs + pendingRx;
  }

  getPendingLabTests(): PatientLabTest[] {
    return this.labTests.filter(t => t.status < 2);
  }

  getPendingPrescriptions(): PatientPrescription[] {
    return this.prescriptions.filter(p => p.status < 2);
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-blue-100 text-blue-700';
      case 1: return 'bg-green-100 text-green-700';
      case 2: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  getAnnouncementClass(type: string): string {
    switch (type) {
      case 'warning': return 'bg-amber-50 text-amber-800';
      case 'health-tip': return 'bg-green-50 text-green-800';
      case 'announcement': return 'bg-blue-50 text-blue-800';
      default: return 'bg-gray-50 text-gray-800';
    }
  }

  getAnnouncementIcon(type: string): string {
    switch (type) {
      case 'warning':
        return '<svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
      case 'health-tip':
        return '<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>';
      case 'announcement':
        return '<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>';
      default:
        return '<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
