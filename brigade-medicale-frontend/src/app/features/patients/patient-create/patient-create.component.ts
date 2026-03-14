import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { CreatePatientDto, Gender } from '../../../shared/models/patient.model';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="card-medical mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <button (click)="goBack()" class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Nouveau Patient</h1>
              <p class="text-sm text-gray-500">Créer un nouveau dossier patient</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="patientForm" (ngSubmit)="onSubmit()">
        <!-- Error Message -->
        <div *ngIf="error" class="card border-l-4 border-red-500 mb-6">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-red-700">{{ error }}</p>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="card mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Informations personnelles
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Nom <span class="text-red-500">*</span></label>
              <input type="text" formControlName="lastName" class="input"
                     [class.input-error]="isFieldInvalid('lastName')"
                     placeholder="Nom de famille">
              <p *ngIf="isFieldInvalid('lastName')" class="mt-1 text-sm text-red-600">
                Le nom est requis
              </p>
            </div>

            <div>
              <label class="label">Prénom <span class="text-red-500">*</span></label>
              <input type="text" formControlName="firstName" class="input"
                     [class.input-error]="isFieldInvalid('firstName')"
                     placeholder="Prénom(s)">
              <p *ngIf="isFieldInvalid('firstName')" class="mt-1 text-sm text-red-600">
                Le prénom est requis
              </p>
            </div>

            <div>
              <label class="label">Date de naissance <span class="text-red-500">*</span></label>
              <input type="date" formControlName="dateOfBirth" class="input"
                     [class.input-error]="isFieldInvalid('dateOfBirth')"
                     [max]="maxDate">
              <p *ngIf="isFieldInvalid('dateOfBirth')" class="mt-1 text-sm text-red-600">
                La date de naissance est requise
              </p>
            </div>

            <div>
              <label class="label">Genre <span class="text-red-500">*</span></label>
              <select formControlName="gender" class="input"
                      [class.input-error]="isFieldInvalid('gender')">
                <option value="">Sélectionner...</option>
                <option [value]="Gender.Male">Homme</option>
                <option [value]="Gender.Female">Femme</option>
                <option [value]="Gender.Other">Autre</option>
              </select>
              <p *ngIf="isFieldInvalid('gender')" class="mt-1 text-sm text-red-600">
                Le genre est requis
              </p>
            </div>

            <div>
              <label class="label">Téléphone <span class="text-red-500">*</span></label>
              <input type="tel" formControlName="phoneNumber" class="input"
                     [class.input-error]="isFieldInvalid('phoneNumber')"
                     placeholder="+243 XXX XXX XXX">
              <p *ngIf="isFieldInvalid('phoneNumber')" class="mt-1 text-sm text-red-600">
                Le numéro de téléphone est requis
              </p>
            </div>

          </div>
        </div>

        <!-- Church Information -->
        <div class="card mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Appartenance Église
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Membre de l'église ?</label>
              <div class="flex gap-4 mt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" formControlName="isFromChurch" [value]="true"
                         class="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500">
                  <span class="text-sm text-gray-700">Oui</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" formControlName="isFromChurch" [value]="false"
                         class="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500">
                  <span class="text-sm text-gray-700">Non</span>
                </label>
              </div>
            </div>

            <div *ngIf="patientForm.get('isFromChurch')?.value === true">
              <label class="label">Secteur</label>
              <select formControlName="churchSector" class="input">
                <option value="">-- Sélectionnez votre secteur --</option>
                <option *ngFor="let s of churchSectorOptions" [value]="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="card mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Adresse
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="label">Adresse complète</label>
              <input type="text" formControlName="address" class="input"
                     placeholder="Rue, numéro, quartier">
            </div>

            <div>
              <label class="label">Ville</label>
              <input type="text" formControlName="city" class="input"
                     placeholder="Ville">
            </div>
          </div>
        </div>

        <!-- Medical Information -->
        <div class="card mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            Informations médicales
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Groupe sanguin</label>
              <select formControlName="bloodType" class="input">
                <option value="">Non spécifié</option>
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

            <div class="md:col-span-2">
              <label class="label">Allergies connues</label>
              <textarea formControlName="allergies" class="input" rows="2"
                        placeholder="Médicaments, aliments, etc."></textarea>
            </div>

            <div class="md:col-span-2">
              <label class="label">Maladies chroniques</label>
              <textarea formControlName="chronicDiseases" class="input" rows="2"
                        placeholder="Diabète, hypertension, asthme, etc."></textarea>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button type="button" (click)="goBack()" class="btn btn-secondary">
            Annuler
          </button>
          <button type="submit" [disabled]="submitting || patientForm.invalid"
                  class="btn btn-primary">
            <svg *ngIf="submitting" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg *ngIf="!submitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ submitting ? 'Création...' : 'Créer le patient' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class PatientCreateComponent implements OnInit {
  patientForm!: FormGroup;
  submitting = false;
  error = '';
  maxDate = '';
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private patientApiService: PatientApiService
  ) {}

  ngOnInit(): void {
    this.maxDate = new Date().toISOString().split('T')[0];

    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.minLength(8)]],
      isFromChurch: [false],
      churchSector: [''],
      address: [''],
      city: [''],
      bloodType: [''],
      allergies: [''],
      chronicDiseases: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.patientForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = '';

    const formValue = this.patientForm.value;
    const patient: CreatePatientDto = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      dateOfBirth: formValue.dateOfBirth,
      gender: parseInt(formValue.gender, 10),
      phoneNumber: formValue.phoneNumber.trim(),
      isFromChurch: formValue.isFromChurch || false,
      churchSector: formValue.isFromChurch ? formValue.churchSector?.trim() || undefined : undefined,
      address: formValue.address?.trim() || undefined,
      city: formValue.city?.trim() || undefined,
      bloodType: formValue.bloodType || undefined,
      allergies: formValue.allergies?.trim() || undefined,
      chronicDiseases: formValue.chronicDiseases?.trim() || undefined
    };

    this.patientApiService.createPatient(patient).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/patients', response.data.id]);
        } else {
          this.error = response.message || 'Erreur lors de la création du patient';
          this.submitting = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création du patient';
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}
