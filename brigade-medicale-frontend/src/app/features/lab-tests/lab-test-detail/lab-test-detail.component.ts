import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabTestApiService } from '../../../core/api/lab-test-api.service';
import { LabTest, LabTestStatus, UpdateLabTestResultsDto } from '../../../shared/models/lab-test.model';

@Component({
  selector: 'app-lab-test-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
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
                <h1 class="text-2xl font-bold text-gray-900">Analyse de laboratoire</h1>
                <p class="text-sm text-gray-600" *ngIf="labTest">{{ labTest.testName }}</p>
              </div>
            </div>
            <span *ngIf="labTest" [class]="getStatusClass(labTest.status)"
                  class="px-3 py-1 text-sm font-medium rounded-full">
              {{ getStatusLabel(labTest.status) }}
            </span>
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
      <main *ngIf="!loading && !error && labTest" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Patient Info -->
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Informations patient</h3>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-gray-500">Patient</dt>
                <dd class="font-medium">{{ labTest.patientName }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">N° Patient</dt>
                <dd class="font-medium">{{ labTest.patientNumber }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Demandé par</dt>
                <dd class="font-medium">Dr. {{ labTest.requestedBy }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Date demande</dt>
                <dd class="font-medium">{{ formatDate(labTest.requestedAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Test Info -->
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Détails de l'analyse</h3>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-gray-500">Type</dt>
                <dd class="font-medium">{{ labTest.testType }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Test</dt>
                <dd class="font-medium">{{ labTest.testName }}</dd>
              </div>
              <div *ngIf="labTest.normalRange" class="flex justify-between">
                <dt class="text-gray-500">Valeurs normales</dt>
                <dd class="font-medium">{{ labTest.normalRange }}</dd>
              </div>
            </dl>
            <div *ngIf="labTest.instructions" class="mt-4 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm font-medium text-blue-800">Instructions</p>
              <p class="text-blue-700">{{ labTest.instructions }}</p>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div class="card mt-6">
          <h3 class="text-lg font-semibold mb-4">Résultats</h3>

          <!-- Completed Results -->
          <div *ngIf="labTest.status === LabTestStatus.Completed">
            <div class="p-4 bg-green-50 rounded-lg">
              <p class="font-medium text-green-800 mb-2">Résultats de l'analyse</p>
              <p class="text-green-900 whitespace-pre-wrap">{{ labTest.results }}</p>
            </div>
            <p *ngIf="labTest.performedBy" class="mt-4 text-sm text-gray-500">
              Réalisé par {{ labTest.performedBy }} le {{ formatDate(labTest.completedAt!) }}
            </p>
          </div>

          <!-- Input Results Form -->
          <div *ngIf="labTest.status !== LabTestStatus.Completed && labTest.status !== LabTestStatus.Cancelled">
            <div *ngIf="labTest.status === LabTestStatus.Requested" class="mb-4">
              <button (click)="startTest()" [disabled]="processing" class="btn btn-secondary">
                {{ processing ? 'Traitement...' : 'Commencer l\'analyse' }}
              </button>
            </div>

            <div *ngIf="labTest.status === LabTestStatus.InProgress">
              <div class="space-y-4">
                <div>
                  <label class="label">Résultats *</label>
                  <textarea [(ngModel)]="results" class="input" rows="6"
                            placeholder="Saisissez les résultats de l'analyse..."></textarea>
                </div>
                <div>
                  <label class="label">Valeurs de référence</label>
                  <input type="text" [(ngModel)]="normalRange" class="input"
                         placeholder="ex: 70-100 mg/dL">
                </div>
                <div class="flex justify-end gap-3">
                  <button (click)="saveResults(false)" [disabled]="processing || !results"
                          class="btn btn-secondary">
                    Enregistrer
                  </button>
                  <button (click)="saveResults(true)" [disabled]="processing || !results"
                          class="btn btn-success">
                    {{ processing ? 'Traitement...' : 'Terminer l\'analyse' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cancelled -->
          <div *ngIf="labTest.status === LabTestStatus.Cancelled" class="p-4 bg-red-50 rounded-lg">
            <p class="text-red-700">Cette analyse a été annulée</p>
          </div>
        </div>
      </main>
    </div>
  `
})
export class LabTestDetailComponent implements OnInit {
  labTest: LabTest | null = null;
  loading = false;
  error = '';
  processing = false;
  results = '';
  normalRange = '';
  LabTestStatus = LabTestStatus;

  private labTestId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private labTestApiService: LabTestApiService
  ) {}

  ngOnInit(): void {
    this.labTestId = this.route.snapshot.paramMap.get('id') || '';
    if (this.labTestId) {
      this.loadLabTest();
    }
  }

  loadLabTest(): void {
    this.loading = true;
    this.labTestApiService.getLabTestById(this.labTestId).subscribe({
      next: (response) => {
        if (response.success) {
          this.labTest = response.data;
          this.results = response.data.results || '';
          this.normalRange = response.data.normalRange || '';
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

  startTest(): void {
    this.processing = true;
    this.labTestApiService.startLabTest(this.labTestId).subscribe({
      next: (response) => {
        if (response.success) {
          this.labTest = response.data;
        }
        this.processing = false;
      },
      error: () => {
        this.processing = false;
      }
    });
  }

  saveResults(complete: boolean): void {
    if (!this.results) return;

    this.processing = true;
    const dto: UpdateLabTestResultsDto = {
      results: this.results,
      normalRange: this.normalRange || undefined
    };

    const request = complete
      ? this.labTestApiService.completeLabTest(this.labTestId, dto)
      : this.labTestApiService.updateResults(this.labTestId, dto);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.labTest = response.data;
        }
        this.processing = false;
      },
      error: () => {
        this.processing = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/lab-tests']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getStatusLabel(status: LabTestStatus): string {
    switch (status) {
      case LabTestStatus.Requested: return 'Demandé';
      case LabTestStatus.InProgress: return 'En cours';
      case LabTestStatus.Completed: return 'Terminé';
      case LabTestStatus.Cancelled: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  getStatusClass(status: LabTestStatus): string {
    switch (status) {
      case LabTestStatus.Requested: return 'bg-blue-100 text-blue-800';
      case LabTestStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
      case LabTestStatus.Completed: return 'bg-green-100 text-green-800';
      case LabTestStatus.Cancelled: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
