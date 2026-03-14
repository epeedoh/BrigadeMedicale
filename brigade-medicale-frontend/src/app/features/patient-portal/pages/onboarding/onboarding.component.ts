import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PatientPublicService } from '../../core/services/patient-public.service';
import { Gender, PatientRegisterDto } from '../../../../shared/models/patient.model';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4">
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
      <main class="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <!-- Progress Steps -->
        <div class="mb-6 sm:mb-8">
          <div class="flex items-center justify-center gap-2 sm:gap-4">
            <div class="flex items-center gap-2">
              <div [class]="currentStep >= 1 ? 'step-active' : 'step-inactive'" class="step-circle">
                <span *ngIf="currentStep <= 1">1</span>
                <svg *ngIf="currentStep > 1" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="text-sm font-medium hidden sm:inline" [class]="currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'">Identité</span>
            </div>
            <div class="w-8 sm:w-16 h-0.5" [class]="currentStep > 1 ? 'bg-teal-500' : 'bg-gray-200'"></div>
            <div class="flex items-center gap-2">
              <div [class]="currentStep >= 2 ? 'step-active' : 'step-inactive'" class="step-circle">
                <span *ngIf="currentStep <= 2">2</span>
                <svg *ngIf="currentStep > 2" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="text-sm font-medium hidden sm:inline" [class]="currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'">Infos complémentaires</span>
            </div>
          </div>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <!-- Card Header -->
          <div class="bg-gradient-to-r from-teal-500 to-teal-600 px-4 sm:px-6 py-4 sm:py-5">
            <h2 class="text-lg sm:text-xl font-semibold text-white">
              {{ currentStep === 1 ? 'Vos informations personnelles' : 'Informations complémentaires' }}
            </h2>
            <p class="text-teal-100 text-sm mt-1">
              {{ currentStep === 1 ? 'Ces informations sont obligatoires' : 'Ces informations nous aideront à mieux vous accompagner' }}
            </p>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-4 sm:p-6">
            <!-- Step 1: Identity -->
            <div *ngIf="currentStep === 1" class="space-y-4 sm:space-y-5">
              <!-- Nom -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom <span class="text-red-500">*</span>
                </label>
                <input type="text" formControlName="lastName"
                       class="input-patient"
                       [class.input-error]="isFieldInvalid('lastName')"
                       placeholder="Votre nom de famille">
                <p *ngIf="isFieldInvalid('lastName')" class="mt-1.5 text-sm text-red-500">
                  Le nom est obligatoire
                </p>
              </div>

              <!-- Prénom -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Prénom(s) <span class="text-red-500">*</span>
                </label>
                <input type="text" formControlName="firstName"
                       class="input-patient"
                       [class.input-error]="isFieldInvalid('firstName')"
                       placeholder="Votre(vos) prénom(s)">
                <p *ngIf="isFieldInvalid('firstName')" class="mt-1.5 text-sm text-red-500">
                  Le prénom est obligatoire
                </p>
              </div>

              <!-- Date de naissance -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Date de naissance <span class="text-red-500">*</span>
                </label>
                <input type="date" formControlName="dateOfBirth"
                       class="input-patient"
                       [class.input-error]="isFieldInvalid('dateOfBirth')"
                       [max]="maxDate">
                <p *ngIf="isFieldInvalid('dateOfBirth')" class="mt-1.5 text-sm text-red-500">
                  La date de naissance est obligatoire
                </p>
              </div>

              <!-- Sexe -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Sexe <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" (click)="setGender(Gender.Male)"
                          [class]="form.get('gender')?.value === Gender.Male ? 'gender-btn-active' : 'gender-btn'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Homme
                  </button>
                  <button type="button" (click)="setGender(Gender.Female)"
                          [class]="form.get('gender')?.value === Gender.Female ? 'gender-btn-active' : 'gender-btn'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Femme
                  </button>
                </div>
                <p *ngIf="isFieldInvalid('gender')" class="mt-1.5 text-sm text-red-500">
                  Veuillez sélectionner votre sexe
                </p>
              </div>

              <!-- Téléphone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </span>
                  <input type="tel" formControlName="phoneNumber"
                         class="input-patient pl-12"
                         [class.input-error]="isFieldInvalid('phoneNumber')"
                         placeholder="Ex: 06 12 34 56 78">
                </div>
                <p *ngIf="isFieldInvalid('phoneNumber')" class="mt-1.5 text-sm text-red-500">
                  Le numéro de téléphone est obligatoire
                </p>
              </div>

            </div>

            <!-- Step 2: Additional Info -->
            <div *ngIf="currentStep === 2" class="space-y-4 sm:space-y-5">
              <!-- Êtes-vous de l'église ? -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Êtes-vous membre de l'église ?
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" (click)="setIsFromChurch(true)"
                          [class]="form.get('isFromChurch')?.value === true ? 'gender-btn-active' : 'gender-btn'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Oui
                  </button>
                  <button type="button" (click)="setIsFromChurch(false)"
                          [class]="form.get('isFromChurch')?.value === false ? 'gender-btn-active' : 'gender-btn'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Non
                  </button>
                </div>
              </div>

              <!-- Secteur église (conditionnel) -->
              <div *ngIf="form.get('isFromChurch')?.value === true" class="animate-fade-in">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Secteur / Zone Église
                </label>
                <select formControlName="churchSector"
                        class="input-patient">
                  <option value="">-- Sélectionnez votre secteur --</option>
                  <option *ngFor="let s of churchSectorOptions" [value]="s">{{ s }}</option>
                </select>
              </div>

              <!-- Adresse -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse
                </label>
                <input type="text" formControlName="address"
                       class="input-patient"
                       placeholder="Votre adresse complète">
              </div>

              <!-- Ville -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Ville
                </label>
                <div class="relative">
                  <input type="text"
                         [(ngModel)]="cityFilterValue"
                         [ngModelOptions]="{standalone: true}"
                         (input)="filterCities($event.target.value)"
                         (focus)="showCityDropdown = filteredCityOptions.length > 0"
                         placeholder="Recherchez votre ville..."
                         class="input-patient w-full">
                  <div *ngIf="showCityDropdown && filteredCityOptions.length > 0"
                       class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    <div *ngFor="let city of filteredCityOptions"
                         (click)="selectCity(city)"
                         class="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm text-gray-700 transition-colors">
                      {{ city }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Groupe sanguin -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Groupe sanguin
                </label>
                <select formControlName="bloodType" class="input-patient">
                  <option value="">-- Sélectionner --</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <!-- Allergies -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Allergies connues
                </label>
                <textarea formControlName="allergies"
                          class="input-patient resize-none"
                          rows="2"
                          placeholder="Listez vos allergies connues (médicaments, aliments, etc.)"></textarea>
              </div>

              <!-- Maladies chroniques -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Maladies chroniques
                </label>
                <textarea formControlName="chronicDiseases"
                          class="input-patient resize-none"
                          rows="2"
                          placeholder="Diabète, hypertension, asthme, etc."></textarea>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
              <button *ngIf="currentStep > 1" type="button" (click)="previousStep()"
                      class="btn-secondary-patient order-2 sm:order-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Retour
              </button>

              <button *ngIf="currentStep === 1" type="button" (click)="nextStep()"
                      [disabled]="!isStep1Valid()"
                      class="btn-primary-patient flex-1 order-1 sm:order-2">
                Continuer
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <button *ngIf="currentStep === 2" type="submit"
                      [disabled]="loading"
                      class="btn-primary-patient flex-1 order-1 sm:order-2">
                <svg *ngIf="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span *ngIf="!loading">M'enregistrer</span>
                <span *ngIf="loading">Inscription en cours...</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Already registered link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm sm:text-base">
            Déjà inscrit ?
            <a routerLink="/patient/login" class="text-teal-600 hover:text-teal-700 font-medium ml-1">
              Accéder à mon carnet
            </a>
          </p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .step-circle {
      @apply w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all;
    }
    .step-active {
      @apply bg-teal-500 text-white shadow-lg shadow-teal-500/30;
    }
    .step-inactive {
      @apply bg-gray-100 text-gray-400;
    }
    .input-patient {
      @apply w-full px-4 py-3 text-base border border-gray-200 rounded-xl
             focus:ring-2 focus:ring-teal-500 focus:border-teal-500
             transition-all placeholder-gray-400;
    }
    .input-patient.input-error {
      @apply border-red-300 focus:ring-red-500 focus:border-red-500;
    }
    .gender-btn {
      @apply flex items-center justify-center gap-2 px-4 py-3 border border-gray-200
             rounded-xl text-gray-600 font-medium transition-all
             hover:border-teal-300 hover:bg-teal-50;
    }
    .gender-btn-active {
      @apply flex items-center justify-center gap-2 px-4 py-3
             bg-teal-50 border-2 border-teal-500 rounded-xl
             text-teal-700 font-medium shadow-sm;
    }
    .btn-primary-patient {
      @apply flex items-center justify-center gap-2 px-6 py-3.5
             bg-gradient-to-r from-teal-500 to-teal-600 text-white
             font-semibold rounded-xl shadow-lg shadow-teal-500/30
             hover:from-teal-600 hover:to-teal-700
             disabled:opacity-50 disabled:cursor-not-allowed
             transition-all text-base;
    }
    .btn-secondary-patient {
      @apply flex items-center justify-center gap-2 px-6 py-3.5
             bg-gray-100 text-gray-700 font-semibold rounded-xl
             hover:bg-gray-200 transition-all text-base;
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class OnboardingComponent implements OnInit {
  form!: FormGroup;
  currentStep = 1;
  loading = false;
  errorMessage = '';
  maxDate: string;
  Gender = Gender;

  // Liste des secteurs d'église
  churchSectorOptions: string[] = [
    'EST 1',
    'EST 2',
    'OUEST 1',
    'OUEST 2',
    'SUD 1',
    'SUD 2',
    'NORD 1'
  ];

  // Liste des villes de Côte d'Ivoire
  cityOptions: string[] = [
    'Abidjan', 'Abobo', 'Aboisso', 'Agboville', 'Adzopé', 'Akoupé', 'Anyama',
    'Bangolo', 'Béoumi', 'Bingervillé', 'Blolequin', 'Bonoua', 'Bongouanou',
    'Bouaflé', 'Bouaké', 'Boualé', 'Bouloum', 'Boundiali', 'Bouna',
    'Dabakala', 'Dabou', 'Daloa', 'Divo', 'Duekoué',
    'Gagnoa', 'Gaoua', 'Gbarnga', 'Gboguhé', 'Grandville',
    'Guiglo', 'Guessabo', 'Guinajou',
    'Hiré', 'Houenou',
    'Issia', 'Ivoirien',
    'Jacqueville', 'Jenahon',
    'Kadiokouma', 'Kakaote', 'Kangasso', 'Karakro', 'Kawajoussi', 'Katiola', 'Kidira', 'Kohourou', 'Korhogo', 'Koro', 'Korogho', 'Koumaguié', 'Koumoundjia', 'Koumounta', 'Kousséboué', 'Kouto', 'Koutoubire', 'Kouyabilou', 'Krébri', 'Kourou', 'Krindjabo',
    'Lakota', 'Lamto', 'Lauzoua', 'Layo', 'Lobada', 'Lokoa', 'Loto',
    'M\'Bahiakro', 'M\'Batto', 'Madiakro', 'Mafessou', 'Maféré', 'Magré', 'Makongo', 'Malathéa', 'Malendomè', 'Mamarama', 'Mamébé', 'Mamié', 'Mamillakro', 'Mankouma', 'Mankoran', 'Manobia', 'Manouané', 'Mans', 'Mansoa', 'Mantahé', 'Mantékro', 'Manteroro', 'Manthoury', 'Mantio', 'Mantogoli', 'Mantougoéri', 'Mantouri', 'Mantouroué', 'Mantouroso', 'Mantoussi', 'Mantoutou', 'Mantouyéhé', 'Manuguié', 'Manuéa', 'Manugbéa', 'Manuhi', 'Manundo', 'Manugbé', 'Manyamara', 'Manyamiakro', 'Manyami', 'Manyamiékro', 'Manyangoréa', 'Manyansopla', 'Manyassa', 'Manyassato', 'Manyaya', 'Manyayo', 'Manyayokro', 'Manyayou', 'Manzegnéa', 'Manzenko', 'Manzikoko', 'Manzina', 'Manzina-Kaolé', 'Manzina-Konidala', 'Manzinakro', 'Manzire', 'Manzoa', 'Manzogbo', 'Manzogui', 'Manzoï', 'Manzokro', 'Manzola', 'Manzolékro', 'Manzolé', 'Manzolia', 'Manzon', 'Manzonakro', 'Manzone', 'Manzoni', 'Manzonikro', 'Manzoniné', 'Manzonkro', 'Manzora', 'Manzoré', 'Manzoro', 'Manzorokro', 'Manzorou', 'Manzorouè', 'Manzorouékro', 'Manzoroy', 'Manzoroyé', 'Manzoroyékro', 'Manzoté', 'Manzo-Tokro', 'Manzoua', 'Manzouadougou', 'Manzouakro', 'Manzouala', 'Manzouala', 'Manzouama', 'Manzouamadougou', 'Manzouambakro', 'Manzouame', 'Manzouamé', 'Manzouamékro', 'Manzouami', 'Manzouamiékro', 'Manzouamo', 'Manzouamokro', 'Manzouamou', 'Manzouamouékro', 'Manzouamouékro', 'Manzouamouékro', 'Manzouamouékro', 'Manzouamouékro', 'Manzouamouékro', 'Manzouamouékro', 'Manzouamouékro', 'Manzouamouékro',
    'Odienné', 'Okromodzo', 'Oté',
    'Pekoa', 'Péhé', 'Péhékou', 'Péhékro', 'Péléa', 'Péléakro', 'Pélébé', 'Pélébékro', 'Pélédo', 'Péléhéa', 'Péléhéakro', 'Péléhéa', 'Pélékoro', 'Pélékorodougou', 'Pélékorokro', 'Pélékourou', 'Pélékourouékro', 'Pélékouro', 'Pélékouroki', 'Pélékou', 'Pélékoua', 'Pélékoubé', 'Pélékoubékro', 'Pélékoubé', 'Pélékoubékro', 'Pélékoubékro', 'Pélékoubékro', 'Pélékoubékro', 'Pélékoubékro', 'Pélékoubékro', 'Pélékoubékro',
    'San Pédro', 'Sassandra', 'Séguela', 'Sikensi', 'Sinématiali', 'Sinfra', 'Sinkékro', 'Sipilou', 'Sirana', 'Siranekro', 'Sissia', 'Sitiédougou', 'Sitiékro', 'Sitiessé', 'Soa', 'Soakoma', 'Soakaré', 'Soakodou', 'Soakope', 'Soakoro', 'Soakouakou', 'Soakoubé', 'Soakoubékro', 'Soakouéa', 'Soakouékro', 'Soakouékro', 'Soakouékro', 'Soakouékro', 'Soakouékro', 'Soakouékro', 'Soakouékro', 'Soakouékro',
    'Tabakoto', 'Tabakouba', 'Tabakouébé', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro', 'Tabakouékro',
    'Tanda', 'Tendakro', 'Tete', 'Teuléa', 'Teuléakro', 'Teuléa', 'Teuléakro', 'Teuléakro', 'Teuléakro', 'Teuléakro', 'Teuléakro', 'Teuléakro', 'Teuléakro',
    'Tiassalé', 'Tiassélé', 'Tiébissou', 'Tiébougou', 'Tiekro', 'Tiémé', 'Tiémékro', 'Tiémé', 'Tiémékro', 'Tiémékro', 'Tiémékro', 'Tiémékro', 'Tiémékro',
    'Toébakouta', 'Toébakoué', 'Toébakoué', 'Toébakoué', 'Toébakoué', 'Toébakoué',
    'Vavoua', 'Viapalavé', 'Viapalavé', 'Viapalavé', 'Viapalavé', 'Viapalavé',
    'Yamoussoukro', 'Yohan', 'Yopougon', 'Youkoromakro', 'Yoysso', 'Youpla', 'Youplakro', 'Youplakro', 'Youplakro', 'Youplakro', 'Youplakro',
    'Zégoua', 'Zéprégué', 'Zéréa', 'Zéréakro', 'Zéréakro', 'Zéréakro', 'Zéréakro', 'Zéréakro'
  ].sort();

  // Villes filtrées (mise à jour lors de la saisie)
  filteredCityOptions: string[] = [];
  cityFilterValue = '';
  showCityDropdown = false;

  constructor(
    private fb: FormBuilder,
    private patientPublicService: PatientPublicService,
    private router: Router
  ) {
    // Date max = aujourd'hui
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForm();
    // Initialiser avec toutes les villes
    this.filteredCityOptions = this.cityOptions;
  }

  filterCities(searchValue: string): void {
    this.cityFilterValue = searchValue;
    if (!searchValue.trim()) {
      this.filteredCityOptions = this.cityOptions;
    } else {
      const lowerSearch = searchValue.toLowerCase();
      this.filteredCityOptions = this.cityOptions.filter(city =>
        city.toLowerCase().includes(lowerSearch)
      );
    }
    this.showCityDropdown = this.filteredCityOptions.length > 0;
  }

  selectCity(city: string): void {
    this.form.patchValue({ city });
    this.cityFilterValue = city;
    this.showCityDropdown = false;
  }

  private initForm(): void {
    this.form = this.fb.group({
      // Step 1 - Obligatoires
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: [null, Validators.required],
      phoneNumber: ['', [Validators.required, Validators.minLength(8)]],
      // Step 2 - Optionnels
      isFromChurch: [false],
      churchSector: [''],
      address: [''],
      city: [''],
      bloodType: [''],
      allergies: [''],
      chronicDiseases: ['']
    });
  }

  setGender(gender: Gender): void {
    this.form.patchValue({ gender });
  }

  setIsFromChurch(value: boolean): void {
    this.form.patchValue({ isFromChurch: value });
    if (!value) {
      this.form.patchValue({ churchSector: '' });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  isStep1Valid(): boolean {
    const fields = ['lastName', 'firstName', 'dateOfBirth', 'gender', 'phoneNumber'];
    return fields.every(f => this.form.get(f)?.valid);
  }

  nextStep(): void {
    if (this.isStep1Valid()) {
      this.currentStep = 2;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Marquer tous les champs du step 1 comme touched
      ['lastName', 'firstName', 'dateOfBirth', 'gender', 'phoneNumber'].forEach(f => {
        this.form.get(f)?.markAsTouched();
      });
    }
  }

  previousStep(): void {
    this.currentStep = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit(): void {
    if (!this.isStep1Valid()) {
      this.currentStep = 1;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.form.value;
    const payload: PatientRegisterDto = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      dateOfBirth: formValue.dateOfBirth,
      gender: formValue.gender,
      phoneNumber: formValue.phoneNumber.trim(),
      isFromChurch: formValue.isFromChurch || false,
      churchSector: formValue.churchSector?.trim() || undefined,
      address: formValue.address?.trim() || undefined,
      city: formValue.city?.trim() || undefined,
      bloodType: formValue.bloodType || undefined,
      allergies: formValue.allergies?.trim() || undefined,
      chronicDiseases: formValue.chronicDiseases?.trim() || undefined
    };

    this.patientPublicService.register(payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          // Afficher un avertissement si c'est le mode fallback DEV
          if (response.message?.includes('[DEV MODE]')) {
            console.warn('⚠️ Mode développement : backend absent, utilisation fallback');
          }
          // Rediriger vers la page de succès
          this.router.navigate(['/patient/success']);
        } else {
          this.errorMessage = response.message || 'Une erreur est survenue lors de l\'inscription.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur inscription:', error);

        // Gestion détaillée des erreurs
        if (error.status === 0) {
          // Erreur réseau / serveur inaccessible
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.';
        } else if (error.status === 404) {
          // Endpoint non trouvé (backend pas encore implémenté)
          this.errorMessage = 'Le service d\'inscription n\'est pas disponible actuellement. Veuillez contacter l\'accueil de la Brigade Médicale.';
        } else if (error.status === 409) {
          this.errorMessage = 'Un patient avec ce numéro de téléphone existe déjà. Utilisez la connexion si vous êtes déjà inscrit.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Données invalides. Veuillez vérifier les informations saisies.';
        } else if (error.status === 500) {
          this.errorMessage = 'Une erreur serveur est survenue. Veuillez réessayer dans quelques instants.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer ou contacter l\'accueil.';
        }
      }
    });
  }
}
