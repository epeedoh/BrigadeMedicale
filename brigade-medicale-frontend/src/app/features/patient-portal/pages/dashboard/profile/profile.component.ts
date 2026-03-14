import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPortalService } from '../../../core/services/patient-portal.service';
import { PatientTokenService } from '../../../core/services/patient-token.service';
import { PatientProfile, Gender } from '../../../../../shared/models/patient.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900">Mon profil</h1>
          <p class="text-xl text-gray-500 mt-2">Vos informations personnelles</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="w-14 h-14 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Profile Content -->
      <div *ngIf="!loading && profile" class="space-y-6">
        <!-- Profile Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Header with Avatar -->
          <div class="bg-gradient-to-r from-teal-500 to-teal-600 p-8 sm:p-10 text-center">
            <div class="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-full bg-white/20 flex items-center justify-center text-white text-5xl sm:text-6xl font-bold mb-6">
              {{ getInitials() }}
            </div>
            <h2 class="text-4xl sm:text-5xl font-bold text-white">{{ profile.fullName }}</h2>
            <p class="text-teal-100 font-mono mt-3 text-xl">{{ profile.patientNumber }}</p>
          </div>

          <!-- QR Code Section -->
          <div *ngIf="qrCodeUrl" class="p-6 sm:p-8 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-6">
            <img [src]="qrCodeUrl" alt="QR Code" class="w-40 h-40 sm:w-44 sm:h-44 rounded-lg shadow">
            <div class="text-center sm:text-left">
              <p class="font-medium text-gray-900 text-lg">Votre QR Code personnel</p>
              <p class="text-base text-gray-500 mt-2">Présentez-le à l'accueil pour une prise en charge rapide</p>
              <button (click)="downloadQrCode()" class="mt-4 text-lg text-teal-600 hover:text-teal-700 font-medium flex items-center gap-3 mx-auto sm:mx-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Télécharger
              </button>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="p-5 sm:p-7">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Personal Info -->
              <div class="space-y-5">
                <h3 class="font-semibold text-gray-900 text-base uppercase tracking-wider">Identité</h3>

                <div class="info-item">
                  <span class="info-label">Nom complet</span>
                  <span class="info-value">{{ profile.fullName }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">Date de naissance</span>
                  <span class="info-value">{{ formatDate(profile.dateOfBirth) }} ({{ profile.age }} ans)</span>
                </div>

                <div class="info-item">
                  <span class="info-label">Sexe</span>
                  <span class="info-value">{{ getGenderLabel(profile.gender) }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">Téléphone</span>
                  <span class="info-value font-mono">{{ profile.phoneNumber }}</span>
                </div>
              </div>

              <!-- Contact & Location -->
              <div class="space-y-5">
                <h3 class="font-semibold text-gray-900 text-base uppercase tracking-wider">Coordonnées</h3>

                <div class="info-item">
                  <span class="info-label">Secteur</span>
                  <span class="info-value">{{ profile.sector || 'Non renseigné' }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">Adresse</span>
                  <span class="info-value">{{ profile.address || 'Non renseignée' }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">Ville</span>
                  <span class="info-value">{{ profile.city || 'Non renseignée' }}</span>
                </div>

                <div *ngIf="profile.isFromChurch" class="info-item">
                  <span class="info-label">Secteur Église</span>
                  <span class="info-value">{{ profile.churchSector || 'Non renseigné' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Medical Info Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-5 sm:p-7 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900 text-xl">Informations médicales</h3>
          </div>
          <div class="p-5 sm:p-7 space-y-5">
            <!-- Blood Type -->
            <div class="flex items-center gap-5 p-5 bg-red-50 rounded-xl">
              <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-base text-red-600">Groupe sanguin</p>
                <p class="text-2xl font-bold text-red-700">{{ profile.bloodType || 'Non renseigné' }}</p>
              </div>
            </div>

            <!-- Allergies -->
            <div *ngIf="profile.allergies" class="p-5 bg-amber-50 rounded-xl border border-amber-200">
              <div class="flex items-start gap-4">
                <svg class="w-7 h-7 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div>
                  <p class="font-medium text-amber-800 text-base">Allergies connues</p>
                  <p class="text-base text-amber-700 mt-1">{{ profile.allergies }}</p>
                </div>
              </div>
            </div>

            <!-- Chronic Diseases -->
            <div *ngIf="profile.chronicDiseases" class="p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div class="flex items-start gap-4">
                <svg class="w-7 h-7 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <div>
                  <p class="font-medium text-blue-800 text-base">Maladies chroniques</p>
                  <p class="text-base text-blue-700 mt-1">{{ profile.chronicDiseases }}</p>
                </div>
              </div>
            </div>

            <!-- No medical info -->
            <div *ngIf="!profile.allergies && !profile.chronicDiseases && !profile.bloodType"
                 class="text-center py-8 text-gray-500">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-base">Aucune information médicale renseignée</p>
            </div>
          </div>
        </div>

        <!-- Registration Info -->
        <div class="bg-gray-50 rounded-xl p-5 text-center">
          <p class="text-sm text-gray-500">
            Inscrit le {{ formatDate(profile.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .info-item {
      @apply flex flex-col gap-1;
    }
    .info-label {
      @apply text-sm text-gray-500 uppercase tracking-wider;
    }
    .info-value {
      @apply text-base text-gray-900;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: PatientProfile | null = null;
  qrCodeUrl: string | null = null;
  loading = true;

  constructor(
    private patientPortalService: PatientPortalService,
    private patientTokenService: PatientTokenService
  ) {}

  ngOnInit(): void {
    this.qrCodeUrl = this.patientTokenService.getQrCode();
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading = true;
    this.patientPortalService.getProfile().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.profile = response.data;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  getInitials(): string {
    if (!this.profile) return 'P';
    const first = this.profile.firstName?.charAt(0) || '';
    const last = this.profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'P';
  }

  getGenderLabel(gender: Gender): string {
    switch (gender) {
      case Gender.Male: return 'Homme';
      case Gender.Female: return 'Femme';
      default: return 'Autre';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  downloadQrCode(): void {
    if (!this.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `qr-code-${this.profile?.patientNumber || 'patient'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
