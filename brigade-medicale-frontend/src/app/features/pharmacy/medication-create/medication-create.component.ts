import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmacyApiService } from '../../../core/api/pharmacy-api.service';
import { CreateMedicationDto, MedicationForm } from '../../../shared/models/prescription.model';

@Component({
  selector: 'app-medication-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center gap-4">
            <button (click)="goBack()" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Nouveau Médicament</h1>
              <p class="text-sm text-gray-600">Ajouter un médicament au stock</p>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form [formGroup]="medicationForm" (ngSubmit)="onSubmit()" class="card">
          <div *ngIf="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-700">{{ error }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="label">Nom commercial *</label>
              <input type="text" formControlName="name" class="input"
                     [class.input-error]="isFieldInvalid('name')">
            </div>

            <div class="md:col-span-2">
              <label class="label">Nom générique (DCI)</label>
              <input type="text" formControlName="genericName" class="input">
            </div>

            <div>
              <label class="label">Forme pharmaceutique *</label>
              <select formControlName="form" class="input"
                      [class.input-error]="isFieldInvalid('form')">
                <option value="">Sélectionner...</option>
                <option [value]="MedicationForm.Tablet">Comprimé</option>
                <option [value]="MedicationForm.Capsule">Gélule</option>
                <option [value]="MedicationForm.Syrup">Sirop</option>
                <option [value]="MedicationForm.Injection">Injection</option>
                <option [value]="MedicationForm.Cream">Crème</option>
                <option [value]="MedicationForm.Ointment">Pommade</option>
                <option [value]="MedicationForm.Drops">Gouttes</option>
                <option [value]="MedicationForm.Inhaler">Inhalateur</option>
                <option [value]="MedicationForm.Suppository">Suppositoire</option>
                <option [value]="MedicationForm.Other">Autre</option>
              </select>
            </div>

            <div>
              <label class="label">Dosage *</label>
              <input type="text" formControlName="strength" class="input"
                     [class.input-error]="isFieldInvalid('strength')"
                     placeholder="ex: 500">
            </div>

            <div>
              <label class="label">Unité *</label>
              <input type="text" formControlName="unit" class="input"
                     [class.input-error]="isFieldInvalid('unit')"
                     placeholder="ex: mg, ml">
            </div>

            <div>
              <label class="label">Stock minimum *</label>
              <input type="number" formControlName="minimumStock" class="input"
                     [class.input-error]="isFieldInvalid('minimumStock')"
                     min="0">
            </div>

            <div class="md:col-span-2">
              <label class="label">Description</label>
              <textarea formControlName="description" class="input" rows="3"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button type="button" (click)="goBack()" class="btn btn-secondary">Annuler</button>
            <button type="submit" [disabled]="submitting || medicationForm.invalid" class="btn btn-primary">
              {{ submitting ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </main>
    </div>
  `
})
export class MedicationCreateComponent implements OnInit {
  medicationForm!: FormGroup;
  submitting = false;
  error = '';
  MedicationForm = MedicationForm;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pharmacyApiService: PharmacyApiService
  ) {}

  ngOnInit(): void {
    this.medicationForm = this.fb.group({
      name: ['', [Validators.required]],
      genericName: [''],
      form: ['', [Validators.required]],
      strength: ['', [Validators.required]],
      unit: ['', [Validators.required]],
      minimumStock: [10, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.medicationForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.medicationForm.invalid) {
      Object.keys(this.medicationForm.controls).forEach(key => {
        this.medicationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = '';

    const formValue = this.medicationForm.value;
    const medication: CreateMedicationDto = {
      name: formValue.name,
      genericName: formValue.genericName || undefined,
      form: parseInt(formValue.form, 10),
      strength: formValue.strength,
      unit: formValue.unit,
      minimumStock: formValue.minimumStock,
      description: formValue.description || undefined
    };

    this.pharmacyApiService.createMedication(medication).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/pharmacy/medications', response.data.id]);
        } else {
          this.error = response.message || 'Erreur';
          this.submitting = false;
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur';
        this.submitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pharmacy/medications']);
  }
}
