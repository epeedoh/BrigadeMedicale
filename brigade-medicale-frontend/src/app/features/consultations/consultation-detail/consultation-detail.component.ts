import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConsultationApiService } from '../../../core/api/consultation-api.service';
import { Consultation, ConsultationStatus } from '../../../shared/models/consultation.model';
import { Prescription, PrescriptionStatus } from '../../../shared/models/prescription.model';
import { LabTest, LabTestStatus } from '../../../shared/models/lab-test.model';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-consultation-detail',
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
                <h1 class="text-2xl font-bold text-gray-900">Détails de la consultation</h1>
                <p class="text-sm text-gray-600" *ngIf="consultation">{{ formatDate(consultation.consultationDate) }}</p>
              </div>
            </div>
            <div class="flex gap-3" *ngIf="consultation && canEdit">
              <button *ngIf="consultation.status === ConsultationStatus.InProgress"
                      (click)="closeConsultation()"
                      class="btn btn-success">
                Clôturer
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="max-w-7xl mx-auto px-4 py-8">
        <div class="card bg-red-50 border border-red-200">
          <p class="text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Content -->
      <main *ngIf="!loading && !error && consultation" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Status & Patient -->
            <div class="card">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ consultation.patientName }}</h3>
                  <p class="text-sm text-gray-500">{{ consultation.patientNumber }}</p>
                </div>
                <span [class]="getStatusClass(consultation.status)"
                      class="px-3 py-1 text-sm font-medium rounded-full">
                  {{ getStatusLabel(consultation.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600">Dr. {{ consultation.doctorName }}</p>
            </div>

            <!-- Chief Complaint -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Motif de consultation</h3>
              <p class="text-gray-700">{{ consultation.chiefComplaint }}</p>
            </div>

            <!-- Clinical Info -->
            <div class="card" *ngIf="consultation.historyOfPresentIllness || consultation.physicalExamination">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Examen clinique</h3>

              <div *ngIf="consultation.historyOfPresentIllness" class="mb-4">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Anamnèse</h4>
                <p class="text-gray-700">{{ consultation.historyOfPresentIllness }}</p>
              </div>

              <div *ngIf="consultation.physicalExamination">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Examen physique</h4>
                <p class="text-gray-700">{{ consultation.physicalExamination }}</p>
              </div>
            </div>

            <!-- Vital Signs -->
            <div class="card" *ngIf="consultation.vitalSigns">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Signes vitaux</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div *ngIf="consultation.vitalSigns.bloodPressureSystolic" class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-blue-600">
                    {{ consultation.vitalSigns.bloodPressureSystolic }}/{{ consultation.vitalSigns.bloodPressureDiastolic }}
                  </p>
                  <p class="text-xs text-gray-500">Tension (mmHg)</p>
                </div>
                <div *ngIf="consultation.vitalSigns.heartRate" class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-red-600">{{ consultation.vitalSigns.heartRate }}</p>
                  <p class="text-xs text-gray-500">Pouls (bpm)</p>
                </div>
                <div *ngIf="consultation.vitalSigns.temperature" class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-orange-600">{{ consultation.vitalSigns.temperature }}°C</p>
                  <p class="text-xs text-gray-500">Température</p>
                </div>
                <div *ngIf="consultation.vitalSigns.oxygenSaturation" class="text-center p-3 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-green-600">{{ consultation.vitalSigns.oxygenSaturation }}%</p>
                  <p class="text-xs text-gray-500">SpO2</p>
                </div>
              </div>
            </div>

            <!-- Diagnosis & Treatment -->
            <div class="card" *ngIf="consultation.diagnosis || consultation.treatment">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Diagnostic & Traitement</h3>

              <div *ngIf="consultation.diagnosis" class="mb-4">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Diagnostic</h4>
                <p class="text-gray-700">{{ consultation.diagnosis }}</p>
              </div>

              <div *ngIf="consultation.treatment">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Traitement</h4>
                <p class="text-gray-700">{{ consultation.treatment }}</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Prescriptions -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Prescriptions</h3>
              <div *ngIf="prescriptions.length === 0" class="text-center py-4 text-gray-500">
                Aucune prescription
              </div>
              <div *ngFor="let prescription of prescriptions" class="p-3 bg-gray-50 rounded-lg mb-2">
                <p class="font-medium text-gray-900">{{ prescription.medicationName }}</p>
                <p class="text-sm text-gray-600">{{ prescription.dosage }} - {{ prescription.frequency }}</p>
                <p class="text-sm text-gray-500">Qté: {{ prescription.quantityDispensed }}/{{ prescription.quantityPrescribed }}</p>
              </div>
            </div>

            <!-- Lab Tests -->
            <div class="card">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Analyses labo</h3>
              <div *ngIf="labTests.length === 0" class="text-center py-4 text-gray-500">
                Aucune analyse demandée
              </div>
              <div *ngFor="let test of labTests" class="p-3 bg-gray-50 rounded-lg mb-2">
                <div class="flex justify-between items-start">
                  <p class="font-medium text-gray-900">{{ test.testName }}</p>
                  <span [class]="getLabTestStatusClass(test.status)"
                        class="px-2 py-0.5 text-xs font-medium rounded-full">
                    {{ getLabTestStatusLabel(test.status) }}
                  </span>
                </div>
                <p *ngIf="test.results" class="text-sm text-gray-600 mt-1">{{ test.results }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ConsultationDetailComponent implements OnInit {
  consultation: Consultation | null = null;
  prescriptions: Prescription[] = [];
  labTests: LabTest[] = [];
  loading = false;
  error = '';
  canEdit = false;
  ConsultationStatus = ConsultationStatus;

  private consultationId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consultationApiService: ConsultationApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.consultationId = this.route.snapshot.paramMap.get('id') || '';
    this.canEdit = this.authService.hasAnyRole(['ADMIN', 'MEDECIN', 'SUPERVISEUR']);

    if (this.consultationId) {
      this.loadConsultation();
      this.loadPrescriptions();
      this.loadLabTests();
    }
  }

  loadConsultation(): void {
    this.loading = true;
    this.consultationApiService.getConsultationById(this.consultationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.consultation = response.data;
        } else {
          this.error = response.message || 'Erreur';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur';
        this.loading = false;
      }
    });
  }

  loadPrescriptions(): void {
    this.consultationApiService.getConsultationPrescriptions(this.consultationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.prescriptions = response.data;
        }
      }
    });
  }

  loadLabTests(): void {
    this.consultationApiService.getConsultationLabTests(this.consultationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.labTests = response.data;
        }
      }
    });
  }

  closeConsultation(): void {
    // Implementation would open a modal to enter final diagnosis
    alert('Fonctionnalité de clôture à implémenter');
  }

  goBack(): void {
    this.router.navigate(['/consultations']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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

  getLabTestStatusLabel(status: LabTestStatus): string {
    switch (status) {
      case LabTestStatus.Requested: return 'Demandé';
      case LabTestStatus.InProgress: return 'En cours';
      case LabTestStatus.Completed: return 'Terminé';
      case LabTestStatus.Cancelled: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  getLabTestStatusClass(status: LabTestStatus): string {
    switch (status) {
      case LabTestStatus.Requested: return 'bg-blue-100 text-blue-800';
      case LabTestStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
      case LabTestStatus.Completed: return 'bg-green-100 text-green-800';
      case LabTestStatus.Cancelled: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
