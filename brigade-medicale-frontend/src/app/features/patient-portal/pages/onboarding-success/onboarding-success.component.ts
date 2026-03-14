import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PatientTokenService } from '../../core/services/patient-token.service';

@Component({
  selector: 'app-onboarding-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex flex-col">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-sm border-b border-gray-100 flex-shrink-0">
        <div class="w-full max-w-xl mx-auto px-4 sm:px-6 py-4">
          <div class="flex items-center justify-center gap-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg sm:text-xl font-bold text-gray-900">Brigade Médicale</h1>
              <p class="text-xs sm:text-sm text-gray-500">Espace Patient</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content - Centered -->
      <main class="flex-1 flex items-start justify-center w-full px-4 sm:px-6 py-6 sm:py-8">
        <div class="w-full max-w-xl">
        <!-- Success Card -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <!-- Success Header -->
          <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 py-6 sm:py-8 text-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <svg class="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">Inscription réussie !</h2>
            <p class="text-green-100 text-sm sm:text-base">Bienvenue dans votre espace santé personnalisé</p>
          </div>

          <div class="p-4 sm:p-6 space-y-6">
            <!-- Patient Number -->
            <div class="bg-teal-50 rounded-xl p-4 sm:p-6 text-center border-2 border-dashed border-teal-200">
              <p class="text-sm text-teal-600 font-medium mb-2">Votre numéro patient</p>
              <p class="text-2xl sm:text-3xl font-bold text-teal-700 font-mono tracking-wider">
                {{ patientNumber || 'BM-XXXX-XXXXX' }}
              </p>
              <p class="text-xs text-teal-500 mt-2">Conservez ce numéro précieusement</p>
            </div>

            <!-- QR Code Section -->
            <div *ngIf="qrCodeUrl" class="text-center">
              <p class="text-sm font-medium text-gray-700 mb-3">Votre QR Code personnel</p>
              <div class="inline-block bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <img [src]="qrCodeUrl" alt="QR Code Patient" class="w-40 h-40 sm:w-48 sm:h-48 mx-auto">
              </div>
              <p class="text-xs text-gray-500 mt-3">Présentez ce QR code à l'accueil pour une prise en charge rapide</p>
            </div>

            <!-- Download Button -->
            <button *ngIf="qrCodeUrl" (click)="downloadQrCode()"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Télécharger mon QR Code
            </button>

            <!-- Info Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div class="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-blue-800 text-sm">Carnet de santé</p>
                  <p class="text-xs text-blue-600 mt-0.5">Accédez à vos consultations et analyses</p>
                </div>
              </div>
              <div class="bg-purple-50 rounded-xl p-4 flex items-start gap-3">
                <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-purple-800 text-sm">Accès sécurisé</p>
                  <p class="text-xs text-purple-600 mt-0.5">Vos données sont protégées</p>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <button (click)="goToDashboard()"
                    class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-teal-700 transition-all text-base sm:text-lg">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Accéder à mon carnet de santé
            </button>
          </div>
        </div>

        <!-- Help Section -->
        <div class="mt-6 bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900 text-sm">Besoin d'aide ?</p>
              <p class="text-xs sm:text-sm text-gray-600 mt-1">
                Si vous avez des questions, présentez-vous à l'accueil de la Brigade Médicale avec votre QR code ou votre numéro patient.
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  `
})
export class OnboardingSuccessComponent implements OnInit {
  patientNumber: string | null = null;
  qrCodeUrl: string | null = null;

  constructor(
    private patientTokenService: PatientTokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientNumber = this.patientTokenService.getPatientNumber();
    this.qrCodeUrl = this.patientTokenService.getQrCode();

    // Si pas de token, rediriger vers onboarding
    if (!this.patientTokenService.hasToken()) {
      this.router.navigate(['/patient/onboarding']);
    }
  }

  downloadQrCode(): void {
    if (!this.qrCodeUrl) return;

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `qr-code-patient-${this.patientNumber || 'brigade'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  goToDashboard(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}
