import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PatientPublicService } from '../../core/services/patient-public.service';
import { PatientTokenService } from '../../core/services/patient-token.service';

@Component({
  selector: 'app-patient-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex flex-col">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div class="max-w-lg mx-auto px-4 sm:px-6 py-4">
          <div class="flex items-center gap-3">
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

      <!-- Main Content -->
      <main class="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div class="w-full max-w-lg">
          <!-- Login Card -->
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <!-- Card Header -->
            <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-4 sm:px-6 py-5 sm:py-6 text-center">
              <div class="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                <svg class="w-8 h-8 sm:w-9 sm:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h2 class="text-lg sm:text-xl font-semibold text-white">Accéder à mon carnet</h2>
              <p class="text-teal-100 text-sm mt-1">Connectez-vous avec vos identifiants</p>
            </div>

            <!-- Error Alert -->
            <div *ngIf="errorMessage" class="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>

            <!-- Login Tabs -->
            <div class="p-4 sm:p-6">
              <div class="flex border border-gray-200 rounded-xl p-1 mb-6">
                <button (click)="loginMode = 'phone'"
                        [class]="loginMode === 'phone' ? 'tab-active' : 'tab-inactive'"
                        class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all">
                  Par téléphone
                </button>
                <button (click)="loginMode = 'token'"
                        [class]="loginMode === 'token' ? 'tab-active' : 'tab-inactive'"
                        class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all">
                  Par token
                </button>
              </div>

              <!-- Phone Login Form -->
              <form *ngIf="loginMode === 'phone'" (ngSubmit)="loginWithPhone()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Numéro patient
                  </label>
                  <input type="text" [(ngModel)]="patientNumber" name="patientNumber"
                         class="input-patient"
                         placeholder="Ex: BM-2024-12345"
                         required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Téléphone
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </span>
                    <input type="tel" [(ngModel)]="phoneNumber" name="phoneNumber"
                           class="input-patient pl-12"
                           placeholder="Votre numéro de téléphone"
                           required>
                  </div>
                </div>
                <button type="submit" [disabled]="loading" class="btn-primary-patient w-full">
                  <svg *ngIf="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span *ngIf="!loading">Me connecter</span>
                  <span *ngIf="loading">Connexion...</span>
                </button>
              </form>

              <!-- Token Login Form -->
              <form *ngIf="loginMode === 'token'" (ngSubmit)="loginWithToken()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Token d'accès
                  </label>
                  <textarea [(ngModel)]="accessToken" name="accessToken"
                            class="input-patient resize-none font-mono text-sm"
                            rows="3"
                            placeholder="Collez votre token ici..."
                            required></textarea>
                  <p class="text-xs text-gray-500 mt-1.5">
                    Le token vous a été fourni lors de votre inscription
                  </p>
                </div>
                <button type="submit" [disabled]="loading" class="btn-primary-patient w-full">
                  <svg *ngIf="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span *ngIf="!loading">Accéder à mon carnet</span>
                  <span *ngIf="loading">Vérification...</span>
                </button>
              </form>
            </div>
          </div>

          <!-- New Patient Link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600 text-sm sm:text-base">
              Première visite ?
              <a routerLink="/patient/onboarding" class="text-teal-600 hover:text-teal-700 font-medium ml-1">
                M'inscrire maintenant
              </a>
            </p>
          </div>

          <!-- Help Section -->
          <div class="mt-4 bg-white/70 rounded-xl p-4 border border-gray-100">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-xs sm:text-sm text-gray-600">
                Vous avez perdu vos identifiants ? Présentez-vous à l'accueil avec une pièce d'identité.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .input-patient {
      @apply w-full px-4 py-3 text-base border border-gray-200 rounded-xl
             focus:ring-2 focus:ring-teal-500 focus:border-teal-500
             transition-all placeholder-gray-400;
    }
    .btn-primary-patient {
      @apply flex items-center justify-center gap-2 px-6 py-3.5
             bg-gradient-to-r from-teal-500 to-teal-600 text-white
             font-semibold rounded-xl shadow-lg shadow-teal-500/30
             hover:from-teal-600 hover:to-teal-700
             disabled:opacity-50 disabled:cursor-not-allowed
             transition-all text-base;
    }
    .tab-active {
      @apply bg-teal-500 text-white shadow-sm;
    }
    .tab-inactive {
      @apply bg-transparent text-gray-600 hover:bg-gray-50;
    }
  `]
})
export class PatientLoginComponent {
  loginMode: 'phone' | 'token' = 'phone';
  patientNumber = '';
  phoneNumber = '';
  accessToken = '';
  loading = false;
  errorMessage = '';

  constructor(
    private patientPublicService: PatientPublicService,
    private patientTokenService: PatientTokenService,
    private router: Router
  ) {}

  loginWithPhone(): void {
    if (!this.patientNumber.trim() || !this.phoneNumber.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.patientPublicService.loginWithPhone(this.patientNumber.trim(), this.phoneNumber.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/patient/dashboard']);
        } else {
          this.errorMessage = response.message || 'Identifiants incorrects.';
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401 || error.status === 404) {
          this.errorMessage = 'Numéro patient ou téléphone incorrect.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  loginWithToken(): void {
    if (!this.accessToken.trim()) {
      this.errorMessage = 'Veuillez entrer votre token.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.patientPublicService.loginWithToken(this.accessToken.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.router.navigate(['/patient/dashboard']);
        } else {
          this.errorMessage = response.message || 'Token invalide.';
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = 'Token invalide ou expiré.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}
