import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { ConsultationApiService } from '../../../core/api/consultation-api.service';
import { Patient, Gender } from '../../../shared/models/patient.model';
import { Consultation, ConsultationStatus } from '../../../shared/models/consultation.model';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <button (click)="goBack()" class="text-gray-600 hover:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Dossier Patient</h1>
                <p class="text-sm text-gray-600" *ngIf="patient">{{ patient.patientNumber }}</p>
              </div>
            </div>
            <div class="flex gap-3" *ngIf="patient">
              <a [routerLink]="['/patients', patient.id, 'edit']" class="btn btn-secondary">
                Modifier
              </a>
              <a *ngIf="canCreateConsultation"
                 [routerLink]="['/consultations/create']"
                 [queryParams]="{patientId: patient.id}"
                 class="btn btn-primary">
                Nouvelle consultation
              </a>
            </div>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="card bg-red-50 border border-red-200">
          <p class="text-red-700">{{ error }}</p>
          <button (click)="loadPatient()" class="btn btn-secondary mt-4">Réessayer</button>
        </div>
      </div>

      <!-- Main Content -->
      <main *ngIf="!loading && !error && patient" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Patient Info Card -->
          <div class="lg:col-span-1">
            <div class="card">
              <div class="text-center mb-6">
                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-3xl font-bold text-blue-600">
                    {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
                  </span>
                </div>
                <h2 class="text-xl font-bold text-gray-900">
                  {{ patient.lastName }} {{ patient.firstName }}
                </h2>
                <p class="text-gray-500">{{ patient.patientNumber }}</p>
                <span [class]="patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="mt-2 px-3 py-1 inline-flex text-sm font-medium rounded-full">
                  {{ patient.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>

              <div class="space-y-4">
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Téléphone</span>
                  <span class="font-medium text-gray-900">{{ patient.phoneNumber }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Date de naissance</span>
                  <span class="font-medium text-gray-900">{{ formatDate(patient.dateOfBirth) }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Âge</span>
                  <span class="font-medium text-gray-900">{{ patient.age }} ans</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Genre</span>
                  <span class="font-medium text-gray-900">{{ getGenderLabel(patient.gender) }}</span>
                </div>
                <div *ngIf="patient.bloodType" class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Groupe sanguin</span>
                  <span class="font-medium text-gray-900">{{ patient.bloodType }}</span>
                </div>
                <div *ngIf="patient.address" class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Adresse</span>
                  <span class="font-medium text-gray-900 text-right">{{ patient.address }}</span>
                </div>
                <div *ngIf="patient.city" class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Ville</span>
                  <span class="font-medium text-gray-900">{{ patient.city }}</span>
                </div>
                <div *ngIf="patient.sector" class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-500">Secteur</span>
                  <span class="font-medium text-gray-900">{{ patient.sector }}</span>
                </div>
              </div>

              <!-- Church Info -->
              <div *ngIf="patient.isFromChurch" class="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 class="text-sm font-medium text-purple-800 mb-2">Membre d'église</h3>
                <p class="text-purple-700" *ngIf="patient.churchSector">Secteur : {{ patient.churchSector }}</p>
                <p class="text-purple-700" *ngIf="!patient.churchSector">Oui</p>
              </div>

              <!-- Allergies -->
              <div *ngIf="patient.allergies" class="mt-6 p-4 bg-red-50 rounded-lg">
                <h3 class="text-sm font-medium text-red-800 mb-2">Allergies</h3>
                <p class="text-red-700">{{ patient.allergies }}</p>
              </div>

              <!-- Chronic Diseases -->
              <div *ngIf="patient.chronicDiseases" class="mt-4 p-4 bg-orange-50 rounded-lg">
                <h3 class="text-sm font-medium text-orange-800 mb-2">Maladies chroniques</h3>
                <p class="text-orange-700">{{ patient.chronicDiseases }}</p>
              </div>
            </div>
          </div>

          <!-- Consultations History -->
          <div class="lg:col-span-2">
            <div class="card">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Historique des consultations</h3>
                <span class="text-sm text-gray-500">{{ consultations.length }} consultation(s)</span>
              </div>

              <!-- Loading consultations -->
              <div *ngIf="loadingConsultations" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <!-- Empty state -->
              <div *ngIf="!loadingConsultations && consultations.length === 0" class="text-center py-12">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="text-gray-500">Aucune consultation pour ce patient</p>
                <a *ngIf="canCreateConsultation"
                   [routerLink]="['/consultations/create']"
                   [queryParams]="{patientId: patient.id}"
                   class="btn btn-primary mt-4">
                  Créer une consultation
                </a>
              </div>

              <!-- Consultations list -->
              <div *ngIf="!loadingConsultations && consultations.length > 0" class="space-y-4">
                <div *ngFor="let consultation of consultations"
                     class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                     [routerLink]="['/consultations', consultation.id]">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <p class="font-medium text-gray-900">{{ consultation.chiefComplaint }}</p>
                      <p class="text-sm text-gray-500">Dr. {{ consultation.doctorName }}</p>
                    </div>
                    <span [class]="getStatusClass(consultation.status)"
                          class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ getStatusLabel(consultation.status) }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-sm text-gray-500">
                    <span>{{ formatDate(consultation.consultationDate) }}</span>
                    <span *ngIf="consultation.diagnosis" class="text-gray-700">
                      Diagnostic: {{ consultation.diagnosis | slice:0:50 }}{{ consultation.diagnosis.length > 50 ? '...' : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  consultations: Consultation[] = [];
  loading = false;
  loadingConsultations = false;
  error = '';
  canCreateConsultation = false;

  private patientId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientApiService: PatientApiService,
    private consultationApiService: ConsultationApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') || '';
    this.canCreateConsultation = this.authService.hasAnyRole(['ADMIN', 'MEDECIN', 'SUPERVISEUR']);

    if (this.patientId) {
      this.loadPatient();
      this.loadConsultations();
    }
  }

  loadPatient(): void {
    this.loading = true;
    this.error = '';

    this.patientApiService.getPatientById(this.patientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.patient = response.data;
        } else {
          this.error = response.message || 'Erreur lors du chargement du patient';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement du patient';
        this.loading = false;
      }
    });
  }

  loadConsultations(): void {
    this.loadingConsultations = true;

    this.consultationApiService.getPatientConsultations(this.patientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.consultations = response.data;
        }
        this.loadingConsultations = false;
      },
      error: () => {
        this.loadingConsultations = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getGenderLabel(gender: Gender): string {
    switch (gender) {
      case Gender.Male: return 'Homme';
      case Gender.Female: return 'Femme';
      case Gender.Other: return 'Autre';
      default: return 'Non spécifié';
    }
  }

  getStatusLabel(status: ConsultationStatus): string {
    switch (status) {
      case ConsultationStatus.InProgress: return 'En cours';
      case ConsultationStatus.Completed: return 'Terminée';
      case ConsultationStatus.Cancelled: return 'Annulée';
      default: return 'Inconnu';
    }
  }

  getStatusClass(status: ConsultationStatus): string {
    switch (status) {
      case ConsultationStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
      case ConsultationStatus.Completed: return 'bg-green-100 text-green-800';
      case ConsultationStatus.Cancelled: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
