import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ConsultationApiService } from '../../../core/api/consultation-api.service';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { Patient } from '../../../shared/models/patient.model';
import { CreateConsultationDto } from '../../../shared/models/consultation.model';

@Component({
  selector: 'app-consultation-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center gap-4">
            <button (click)="goBack()" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Nouvelle Consultation</h1>
              <p class="text-sm text-gray-600">Créer une consultation médicale</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form [formGroup]="consultationForm" (ngSubmit)="onSubmit()">
          <!-- Error -->
          <div *ngIf="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-700">{{ error }}</p>
          </div>

          <!-- Patient Selection -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Patient</h3>

            <div *ngIf="selectedPatient" class="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-semibold text-gray-900">{{ selectedPatient.lastName }} {{ selectedPatient.firstName }}</p>
                  <p class="text-sm text-gray-600">{{ selectedPatient.patientNumber }} - {{ selectedPatient.phoneNumber }}</p>
                </div>
                <button type="button" (click)="clearPatient()" class="text-red-600 hover:text-red-800">
                  Changer
                </button>
              </div>
            </div>

            <div *ngIf="!selectedPatient">
              <input type="text"
                     [(ngModel)]="patientSearch"
                     [ngModelOptions]="{standalone: true}"
                     (ngModelChange)="searchPatients($event)"
                     placeholder="Rechercher un patient par nom ou numéro..."
                     class="input mb-2">

              <div *ngIf="searchResults.length > 0" class="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                <button *ngFor="let patient of searchResults"
                        type="button"
                        (click)="selectPatient(patient)"
                        class="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  <p class="font-medium text-gray-900">{{ patient.lastName }} {{ patient.firstName }}</p>
                  <p class="text-sm text-gray-500">{{ patient.patientNumber }}</p>
                </button>
              </div>

              <p *ngIf="patientSearch && searchResults.length === 0 && !searchingPatients" class="text-sm text-gray-500 mt-2">
                Aucun patient trouvé
              </p>
            </div>
          </div>

          <!-- Chief Complaint -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Motif de consultation *</h3>
            <textarea formControlName="chiefComplaint" class="input" rows="3"
                      [class.input-error]="isFieldInvalid('chiefComplaint')"
                      placeholder="Décrivez le motif principal de la consultation..."></textarea>
            <p *ngIf="isFieldInvalid('chiefComplaint')" class="mt-1 text-sm text-red-600">
              Le motif de consultation est requis
            </p>
          </div>

          <!-- History -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Anamnèse</h3>
            <textarea formControlName="historyOfPresentIllness" class="input" rows="4"
                      placeholder="Histoire de la maladie actuelle..."></textarea>
          </div>

          <!-- Vital Signs -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Signes vitaux</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4" formGroupName="vitalSigns">
              <div>
                <label class="label">TA Systolique</label>
                <input type="number" formControlName="bloodPressureSystolic" class="input" placeholder="120">
              </div>
              <div>
                <label class="label">TA Diastolique</label>
                <input type="number" formControlName="bloodPressureDiastolic" class="input" placeholder="80">
              </div>
              <div>
                <label class="label">Pouls (bpm)</label>
                <input type="number" formControlName="heartRate" class="input" placeholder="72">
              </div>
              <div>
                <label class="label">Température (°C)</label>
                <input type="number" formControlName="temperature" class="input" step="0.1" placeholder="37.0">
              </div>
              <div>
                <label class="label">SpO2 (%)</label>
                <input type="number" formControlName="oxygenSaturation" class="input" placeholder="98">
              </div>
              <div>
                <label class="label">FR (cpm)</label>
                <input type="number" formControlName="respiratoryRate" class="input" placeholder="16">
              </div>
              <div>
                <label class="label">Poids (kg)</label>
                <input type="number" formControlName="weight" class="input" step="0.1" placeholder="70">
              </div>
              <div>
                <label class="label">Taille (cm)</label>
                <input type="number" formControlName="height" class="input" placeholder="170">
              </div>
            </div>
          </div>

          <!-- Physical Examination -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Examen physique</h3>
            <textarea formControlName="physicalExamination" class="input" rows="4"
                      placeholder="Résultats de l'examen physique..."></textarea>
          </div>

          <!-- Diagnosis -->
          <div class="card mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Diagnostic & Traitement</h3>
            <div class="space-y-4">
              <div>
                <label class="label">Diagnostic</label>
                <textarea formControlName="diagnosis" class="input" rows="2"
                          placeholder="Diagnostic principal et différentiel..."></textarea>
              </div>
              <div>
                <label class="label">Traitement</label>
                <textarea formControlName="treatment" class="input" rows="3"
                          placeholder="Plan de traitement proposé..."></textarea>
              </div>
              <div>
                <label class="label">Notes</label>
                <textarea formControlName="notes" class="input" rows="2"
                          placeholder="Notes additionnelles..."></textarea>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-4">
            <button type="button" (click)="goBack()" class="btn btn-secondary">
              Annuler
            </button>
            <button type="submit"
                    [disabled]="submitting || consultationForm.invalid || !selectedPatient"
                    class="btn btn-primary">
              <span *ngIf="submitting">Création...</span>
              <span *ngIf="!submitting">Créer la consultation</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  `
})
export class ConsultationCreateComponent implements OnInit {
  consultationForm!: FormGroup;
  selectedPatient: Patient | null = null;
  patientSearch = '';
  searchResults: Patient[] = [];
  searchingPatients = false;
  submitting = false;
  error = '';

  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private consultationApiService: ConsultationApiService,
    private patientApiService: PatientApiService
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Check if patient ID was passed via query params
    const patientId = this.route.snapshot.queryParamMap.get('patientId');
    if (patientId) {
      this.loadPatient(patientId);
    }

    // Setup patient search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.length >= 2) {
        this.performSearch(query);
      } else {
        this.searchResults = [];
      }
    });
  }

  initForm(): void {
    this.consultationForm = this.fb.group({
      chiefComplaint: ['', [Validators.required, Validators.minLength(5)]],
      historyOfPresentIllness: [''],
      physicalExamination: [''],
      diagnosis: [''],
      treatment: [''],
      notes: [''],
      vitalSigns: this.fb.group({
        bloodPressureSystolic: [null],
        bloodPressureDiastolic: [null],
        heartRate: [null],
        respiratoryRate: [null],
        temperature: [null],
        oxygenSaturation: [null],
        weight: [null],
        height: [null]
      })
    });
  }

  loadPatient(patientId: string): void {
    this.patientApiService.getPatientById(patientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedPatient = response.data;
        }
      }
    });
  }

  searchPatients(query: string): void {
    this.searchSubject.next(query);
  }

  performSearch(query: string): void {
    this.searchingPatients = true;
    this.patientApiService.searchPatients(query).subscribe({
      next: (response) => {
        if (response.success) {
          this.searchResults = response.data;
        }
        this.searchingPatients = false;
      },
      error: () => {
        this.searchingPatients = false;
      }
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.patientSearch = '';
    this.searchResults = [];
  }

  clearPatient(): void {
    this.selectedPatient = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.consultationForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.consultationForm.invalid || !this.selectedPatient) {
      Object.keys(this.consultationForm.controls).forEach(key => {
        this.consultationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = '';

    const formValue = this.consultationForm.value;
    const vitalSigns = formValue.vitalSigns;

    // Clean up vital signs - remove null values
    const cleanedVitalSigns: any = {};
    Object.keys(vitalSigns).forEach(key => {
      if (vitalSigns[key] !== null && vitalSigns[key] !== '') {
        cleanedVitalSigns[key] = vitalSigns[key];
      }
    });

    const consultation: CreateConsultationDto = {
      patientId: this.selectedPatient.id,
      chiefComplaint: formValue.chiefComplaint,
      historyOfPresentIllness: formValue.historyOfPresentIllness || undefined,
      physicalExamination: formValue.physicalExamination || undefined,
      diagnosis: formValue.diagnosis || undefined,
      treatment: formValue.treatment || undefined,
      notes: formValue.notes || undefined,
      vitalSigns: Object.keys(cleanedVitalSigns).length > 0 ? cleanedVitalSigns : undefined
    };

    this.consultationApiService.createConsultation(consultation).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/consultations', response.data.id]);
        } else {
          this.error = response.message || 'Erreur lors de la création';
          this.submitting = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création';
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/consultations']);
  }
}
