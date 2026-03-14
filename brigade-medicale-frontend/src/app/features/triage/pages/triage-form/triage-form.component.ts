import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TriageService } from '../../core/services/triage.service';
import { UrgencyLevel, TriageStatus } from '../../core/models/triage.model';
import { PatientApiService } from '../../../../core/api/patient-api.service';
import { Patient } from '../../../../shared/models/patient.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Html5QrcodeScanner } from 'html5-qrcode';

@Component({
  selector: 'app-triage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">Prise de Constantes</h1>
        <p class="text-lg text-gray-600 mt-2">Enregistrement des constantes vitales du patient</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <form [formGroup]="triageForm" (ngSubmit)="onSubmit()">
          <!-- Error Alert -->
          <div *ngIf="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800 text-sm">{{ error }}</p>
          </div>

          <!-- Success Alert -->
          <div *ngIf="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-green-800 text-sm">✓ Triage enregistré avec succès</p>
          </div>

          <!-- Offline Mode Badge -->
          <div *ngIf="offlineMode" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2M6.938 3a48.702 48.702 0 0110.124 0c1.803.209 3.467 1.279 4.381 2.915.383.645.643 1.37.737 2.132.196 2.113.292 4.233.292 6.353s-.096 4.24-.292 6.353c-.094.762-.354 1.487-.737 2.132-1.164 1.978-2.959 3.276-4.381 3.583-2.041.351-4.111.353-6.248 0-1.803-.209-3.467-1.279-4.381-2.915-.383-.645-.643-1.37-.737-2.132-.196-2.113-.292-4.233-.292-6.353s.096-4.24.292-6.353c.094-.762.354-1.487.737-2.132C3.505 4.279 5.198 3.209 6.938 3Z"/>
            </svg>
            <div>
              <p class="font-medium text-amber-800">Mode hors ligne</p>
              <p class="text-sm text-amber-600 mt-1">Les données seront synchronisées une fois la connexion rétablie</p>
            </div>
          </div>

          <!-- Patient Selection -->
          <div class="mb-8">
            <label class="label">Patient <span class="text-red-500">*</span></label>

            <!-- Selected Patient Display -->
            <div *ngIf="selectedPatient" class="mb-4 p-4 bg-teal-50 border-2 border-teal-200 rounded-xl">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="font-semibold text-lg text-teal-900">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</p>
                  <p class="text-sm text-teal-600 font-medium">{{ selectedPatient.patientNumber }}</p>
                </div>
                <button type="button" (click)="clearPatientSelection()"
                        class="text-teal-600 hover:text-teal-900 font-medium text-sm">
                  ✕ Changer
                </button>
              </div>
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div class="bg-white bg-opacity-60 p-2 rounded">
                  <p class="text-teal-700 font-medium">Âge</p>
                  <p class="text-teal-900 font-semibold">{{ selectedPatient.age }} ans</p>
                </div>
                <div class="bg-white bg-opacity-60 p-2 rounded">
                  <p class="text-teal-700 font-medium">Sexe</p>
                  <p class="text-teal-900 font-semibold">{{ getGenderLabel(selectedPatient.gender) }}</p>
                </div>
                <div class="bg-white bg-opacity-60 p-2 rounded">
                  <p class="text-teal-700 font-medium">Téléphone</p>
                  <p class="text-teal-900 font-semibold text-xs">{{ selectedPatient.phoneNumber }}</p>
                </div>
              </div>
            </div>

            <!-- QR Code Scanner Panel -->
            <div *ngIf="!selectedPatient" class="mb-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
              <div class="flex gap-2 mb-4">
                <button type="button" (click)="openQrScanner()"
                        [class.ring-2]="qrScanMode === 'scanner'"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all font-medium text-sm text-blue-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Scanner QR
                </button>
                <button type="button" (click)="openManualInput()"
                        [class.ring-2]="qrScanMode === 'manual'"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-all font-medium text-sm text-blue-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  N° Patient
                </button>
                <button type="button" (click)="closeQrPanel()" *ngIf="qrScanMode"
                        class="px-3 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-gray-600 font-medium">
                  ✕
                </button>
              </div>

              <!-- QR Scanner -->
              <div *ngIf="qrScanMode === 'scanner'" #qrScannerContainer class="mb-4">
                <div id="qr-scanner" style="width: 100%; margin-bottom: 1rem;"></div>
              </div>

              <!-- Manual Input -->
              <div *ngIf="qrScanMode === 'manual'" class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-700 block mb-2">Numéro patient (ex: BM-2026-00002)</label>
                  <input type="text" [(ngModel)]="manualPatientNumber" [ngModelOptions]="{standalone: true}"
                         placeholder="BM-XXXX-XXXXX"
                         class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <button type="button" (click)="searchByPatientNumber()" [disabled]="qrSearchLoading"
                        class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2">
                  <svg *ngIf="!qrSearchLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <svg *ngIf="qrSearchLoading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Rechercher
                </button>
              </div>

              <!-- Error Message -->
              <div *ngIf="qrSearchError" class="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-sm">
                {{ qrSearchError }}
              </div>
            </div>

            <!-- Patient List Button -->
            <div class="relative">
              <button type="button" (click)="togglePatientList()"
                      [class.ring-2]="isPatientListOpen"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 transition-all flex items-center justify-between
                             focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      [class.input-error]="isFieldInvalid('patientId')">
                <span *ngIf="!selectedPatient" class="text-gray-500">Sélectionner un patient...</span>
                <span *ngIf="patientListLoading" class="text-gray-600">Chargement...</span>
                <svg class="w-5 h-5 text-gray-400 transition-transform"
                     [class.rotate-180]="isPatientListOpen"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </button>

              <!-- Patient List Dropdown -->
              <div *ngIf="isPatientListOpen"
                   class="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                <div *ngIf="patientListLoading" class="p-4 text-center text-gray-500">
                  Chargement de la liste...
                </div>
                <div *ngFor="let patient of patientList"
                     (click)="selectPatient(patient)"
                     class="p-3 border-b border-gray-100 hover:bg-teal-50 cursor-pointer transition">
                  <p class="font-medium text-gray-900">{{ patient.firstName }} {{ patient.lastName }}</p>
                  <p class="text-sm text-gray-500">{{ patient.patientNumber }}</p>
                </div>
                <div *ngIf="patientList.length === 0 && !patientListLoading" class="p-4 text-center text-gray-500">
                  Aucun patient disponible
                </div>
              </div>
            </div>

            <input type="hidden" formControlName="patientId">
          </div>

          <!-- Vital Signs Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Temperature -->
            <div>
              <label class="label">Température (°C) <span class="text-red-500">*</span></label>
              <input type="number" step="0.1" formControlName="temperature"
                     class="input" [class.input-error]="isFieldInvalid('temperature')"
                     placeholder="36.5">
              <p *ngIf="isFieldInvalid('temperature')" class="error-text">Requise</p>
            </div>

            <!-- Pulse -->
            <div>
              <label class="label">Pouls (bpm) <span class="text-red-500">*</span></label>
              <input type="number" formControlName="pulse"
                     class="input" [class.input-error]="isFieldInvalid('pulse')"
                     placeholder="72">
              <p *ngIf="isFieldInvalid('pulse')" class="error-text">Requise</p>
            </div>

            <!-- Systolic -->
            <div>
              <label class="label">Tension Systolique (mmHg) <span class="text-red-500">*</span></label>
              <input type="number" formControlName="systolic"
                     class="input" [class.input-error]="isFieldInvalid('systolic')"
                     placeholder="120">
              <p *ngIf="isFieldInvalid('systolic')" class="error-text">Requise</p>
            </div>

            <!-- Diastolic -->
            <div>
              <label class="label">Tension Diastolique (mmHg) <span class="text-red-500">*</span></label>
              <input type="number" formControlName="diastolic"
                     class="input" [class.input-error]="isFieldInvalid('diastolic')"
                     placeholder="80">
              <p *ngIf="isFieldInvalid('diastolic')" class="error-text">Requise</p>
            </div>

            <!-- Weight -->
            <div>
              <label class="label">Poids (kg) <span class="text-red-500">*</span></label>
              <input type="number" step="0.1" formControlName="weight"
                     class="input" [class.input-error]="isFieldInvalid('weight')"
                     placeholder="70"
                     (change)="calculateIMC()">
              <p *ngIf="isFieldInvalid('weight')" class="error-text">Requise</p>
            </div>

            <!-- Height -->
            <div>
              <label class="label">Taille (cm) <span class="text-red-500">*</span></label>
              <input type="number" formControlName="height"
                     class="input" [class.input-error]="isFieldInvalid('height')"
                     placeholder="175"
                     (change)="calculateIMC()">
              <p *ngIf="isFieldInvalid('height')" class="error-text">Requise</p>
            </div>

            <!-- SpO2 (optional) -->
            <div>
              <label class="label">SpO2 (%) <span class="text-gray-400">Optionnel</span></label>
              <input type="number" min="70" max="100" formControlName="spO2"
                     class="input" placeholder="98">
            </div>

            <!-- IMC (calculated) -->
            <div>
              <label class="label">IMC</label>
              <input type="text" [value]="calculateIMCValue()" readonly
                     class="input bg-gray-50 cursor-not-allowed">
            </div>
          </div>

          <!-- Complaint & Urgency -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Chief Complaint -->
            <div class="md:col-span-1">
              <label class="label">Motif de consultation <span class="text-red-500">*</span></label>
              <input type="text" formControlName="complaint"
                     class="input" [class.input-error]="isFieldInvalid('complaint')"
                     placeholder="Ex: Fièvre, mal de tête...">
              <p *ngIf="isFieldInvalid('complaint')" class="error-text">Requis</p>
            </div>

            <!-- Urgency Level -->
            <div class="md:col-span-1">
              <label class="label">Niveau d'urgence <span class="text-red-500">*</span></label>
              <select formControlName="urgencyLevel"
                      class="input" [class.input-error]="isFieldInvalid('urgencyLevel')">
                <option value="">Sélectionner...</option>
                <option [value]="0">🟢 Vert - Non urgent</option>
                <option [value]="1">🟡 Jaune - Peu urgent</option>
                <option [value]="2">🔴 Rouge - Très urgent</option>
              </select>
              <p *ngIf="isFieldInvalid('urgencyLevel')" class="error-text">Requise</p>
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="mb-8">
            <label class="label">Notes supplémentaires <span class="text-gray-400">Optionnel</span></label>
            <textarea formControlName="notes"
                      class="input resize-none" rows="3"
                      placeholder="Observations complémentaires..."></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <button type="button" (click)="cancel()"
                    class="btn btn-secondary">
              Annuler
            </button>
            <button type="button" (click)="saveDraft()" [disabled]="loading"
                    class="btn btn-secondary">
              💾 Enregistrer brouillon
            </button>
            <button type="submit" [disabled]="loading || triageForm.invalid"
                    class="btn btn-primary flex items-center gap-2">
              <svg *ngIf="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ loading ? 'Enregistrement...' : 'Enregistrer le triage' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Offline Draft Info -->
      <div *ngIf="hasDraft" class="mt-6 bg-blue-50 rounded-lg p-5 border border-blue-200">
        <div class="flex items-start gap-4">
          <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="font-medium text-blue-800">Brouillon existant</p>
            <p class="text-sm text-blue-600 mt-1">Un triage en attente a été trouvé. Souhaitez-vous le charger ou continuer avec un nouveau?</p>
            <button type="button" (click)="loadDraft()" class="mt-3 text-sm text-blue-700 underline font-medium">
              Charger le brouillon
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .label {
      @apply block text-sm font-medium text-gray-700 mb-2;
    }
    .input {
      @apply w-full px-4 py-3 border border-gray-300 rounded-lg
             focus:ring-2 focus:ring-teal-500 focus:border-transparent
             transition-all;
    }
    .input-error {
      @apply border-red-300 focus:ring-red-500;
    }
    .error-text {
      @apply mt-1 text-sm text-red-600;
    }
    .btn {
      @apply px-6 py-3 rounded-lg font-medium transition-all text-sm;
    }
    .btn-primary {
      @apply bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .btn-secondary {
      @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
    }
  `]
})
export class TriageFormComponent implements OnInit, OnDestroy {
  @ViewChild('qrScannerContainer') qrScannerContainer!: ElementRef;

  triageForm!: FormGroup;
  loading = false;
  error = '';
  success = false;
  offlineMode = false;
  hasDraft = false;
  patientList: Patient[] = [];
  patientListLoading = false;
  isPatientListOpen = false;
  selectedPatient: Patient | null = null;

  // QR Scanner properties
  qrScanMode: 'scanner' | 'manual' | null = null;
  qrScanner: Html5QrcodeScanner | null = null;
  manualPatientNumber = '';
  qrSearchLoading = false;
  qrSearchError = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private triageService: TriageService,
    private patientApiService: PatientApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkOfflineMode();
    this.checkForDraft();
    this.loadPatientList();

    // Si patientId en route param, charger le patient
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        this.triageForm.patchValue({ patientId: params['patientId'] });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPatientList(): void {
    this.patientListLoading = true;
    // Load first page of all active patients (max 1000 per page typically)
    this.patientApiService.getPatients(undefined, 1, 1000).subscribe({
      next: (response) => {
        this.patientListLoading = false;
        if (response.success && response.data?.items) {
          this.patientList = response.data.items;
        }
      },
      error: (error) => {
        this.patientListLoading = false;
        console.error('Patient list loading error:', error);
      }
    });
  }

  togglePatientList(): void {
    this.isPatientListOpen = !this.isPatientListOpen;
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.triageForm.get('patientId')?.setValue(patient.id);
    this.isPatientListOpen = false;
  }

  clearPatientSelection(): void {
    this.selectedPatient = null;
    this.triageForm.patchValue({ patientId: '' });
  }

  getGenderLabel(gender: number): string {
    const genderMap: { [key: number]: string } = {
      0: 'Homme',
      1: 'Femme',
      2: 'Autre'
    };
    return genderMap[gender] || 'N/A';
  }

  private initForm(): void {
    this.triageForm = this.fb.group({
      patientId: ['', Validators.required],
      temperature: ['', [Validators.required, Validators.min(35), Validators.max(42)]],
      pulse: ['', [Validators.required, Validators.min(30), Validators.max(200)]],
      systolic: ['', [Validators.required, Validators.min(70), Validators.max(250)]],
      diastolic: ['', [Validators.required, Validators.min(40), Validators.max(150)]],
      weight: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      height: ['', [Validators.required, Validators.min(50), Validators.max(250)]],
      spO2: [''],
      complaint: ['', Validators.required],
      urgencyLevel: ['', Validators.required],
      notes: ['']
    });
  }

  private checkOfflineMode(): void {
    this.offlineMode = !navigator.onLine;
    window.addEventListener('online', () => this.offlineMode = false);
    window.addEventListener('offline', () => this.offlineMode = true);
  }

  private checkForDraft(): void {
    this.hasDraft = !!this.triageService.getDraft();
  }

  loadDraft(): void {
    const draft = this.triageService.getDraft();
    if (draft) {
      this.triageForm.patchValue({
        patientId: draft.patientId,
        temperature: draft.temperature,
        pulse: draft.pulse,
        systolic: draft.systolicBP,
        diastolic: draft.diastolicBP,
        weight: draft.weight,
        height: draft.height,
        spO2: draft.spO2,
        complaint: draft.complaint,
        urgencyLevel: draft.urgencyLevel,
        notes: draft.notes
      });
      this.hasDraft = false;
    }
  }

  saveDraft(): void {
    if (this.triageForm.get('patientId')?.valid) {
      const formValue = this.triageForm.value;
      this.triageService.saveDraft({
        patientId: formValue.patientId,
        temperature: formValue.temperature,
        systolicBP: formValue.systolic,
        diastolicBP: formValue.diastolic,
        pulse: formValue.pulse,
        weight: formValue.weight,
        height: formValue.height,
        spO2: formValue.spO2,
        complaint: formValue.complaint,
        notes: formValue.notes,
        urgencyLevel: formValue.urgencyLevel
      });
      this.success = true;
      setTimeout(() => this.success = false, 3000);
    }
  }

  calculateIMC(): void {
    const weight = this.triageForm.get('weight')?.value;
    const height = this.triageForm.get('height')?.value;
    if (weight && height) {
      // Just trigger reactivity, value is computed in template
    }
  }

  calculateIMCValue(): string {
    const weight = this.triageForm.get('weight')?.value;
    const height = this.triageForm.get('height')?.value;
    if (weight && height) {
      const imc = this.triageService.calculateIMC(weight, height);
      return `${imc} kg/m²`;
    }
    return '-';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.triageForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.triageForm.invalid) {
      Object.keys(this.triageForm.controls).forEach(key => {
        this.triageForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    const formValue = this.triageForm.value;

    const payload = {
      patientId: formValue.patientId,
      temperature: parseFloat(formValue.temperature),
      systolicBP: parseInt(formValue.systolic),
      diastolicBP: parseInt(formValue.diastolic),
      pulse: parseInt(formValue.pulse),
      weight: parseFloat(formValue.weight),
      height: parseFloat(formValue.height),
      spO2: formValue.spO2 ? parseInt(formValue.spO2) : null,
      complaint: formValue.complaint,
      notes: formValue.notes || null,
      urgencyLevel: parseInt(formValue.urgencyLevel)
    };

    this.triageService.createTriage(payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.success = true;
          this.triageService.clearDraft();
          setTimeout(() => {
            this.router.navigate(['/patients']);
          }, 2000);
        } else {
          this.error = response.message || 'Erreur lors de l\'enregistrement';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erreur lors de l\'enregistrement du triage';
        console.error('Triage error:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }

  // QR Scanner Methods
  openQrScanner(): void {
    this.qrScanMode = 'scanner';
    this.qrSearchError = '';
    this.manualPatientNumber = '';

    // Initialize scanner after view is rendered
    setTimeout(() => {
      if (!this.qrScanner && this.qrScannerContainer) {
        this.qrScanner = new Html5QrcodeScanner(
          'qr-scanner',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        this.qrScanner.render(
          (decodedText) => this.onQrSuccess(decodedText),
          (error) => {
            // Ignore scanning errors
          }
        );
      }
    }, 100);
  }

  openManualInput(): void {
    this.qrScanMode = 'manual';
    this.qrSearchError = '';
    this.manualPatientNumber = '';
    this.closeQrScanner();
  }

  closeQrPanel(): void {
    this.qrScanMode = null;
    this.qrSearchError = '';
    this.manualPatientNumber = '';
    this.closeQrScanner();
  }

  private closeQrScanner(): void {
    if (this.qrScanner) {
      this.qrScanner.clear().catch(() => {
        // Ignore cleanup errors
      });
      this.qrScanner = null;
    }
  }

  onQrSuccess(decodedText: string): void {
    // Extract patient number from QR code (it should be the patient number itself)
    const patientNumber = decodedText.trim();
    this.searchByPatientNumber(patientNumber);
  }

  searchByPatientNumber(patientNumber?: string): void {
    const searchValue = patientNumber || this.manualPatientNumber.trim();

    if (!searchValue) {
      this.qrSearchError = 'Veuillez entrer un numéro patient';
      return;
    }

    this.qrSearchLoading = true;
    this.qrSearchError = '';

    this.patientApiService.getPatientByNumber(searchValue).subscribe({
      next: (response) => {
        this.qrSearchLoading = false;
        if (response.success && response.data) {
          this.selectPatient(response.data);
          this.closeQrPanel();
        } else {
          this.qrSearchError = response.message || 'Patient introuvable';
        }
      },
      error: (error) => {
        this.qrSearchLoading = false;
        this.qrSearchError = error.error?.message || 'Patient introuvable';
      }
    });
  }
}
