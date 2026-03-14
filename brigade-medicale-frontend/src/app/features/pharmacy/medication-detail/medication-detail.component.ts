import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PharmacyApiService } from '../../../core/api/pharmacy-api.service';
import { Medication, MedicationForm, StockMovement, StockMovementType, CreateStockMovementDto } from '../../../shared/models/prescription.model';

@Component({
  selector: 'app-medication-detail',
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
                <h1 class="text-2xl font-bold text-gray-900">{{ medication?.name }}</h1>
                <p class="text-sm text-gray-600">{{ medication?.genericName }}</p>
              </div>
            </div>
            <button (click)="showStockModal = true" class="btn btn-primary">
              + Mouvement stock
            </button>
          </div>
        </div>
      </header>

      <main *ngIf="medication" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Info Card -->
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">Informations</h3>
            <dl class="space-y-3">
              <div class="flex justify-between">
                <dt class="text-gray-500">Forme</dt>
                <dd class="font-medium">{{ getFormLabel(medication.form) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Dosage</dt>
                <dd class="font-medium">{{ medication.strength }} {{ medication.unit }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Stock actuel</dt>
                <dd [class]="medication.currentStock <= medication.minimumStock ? 'text-red-600 font-bold' : 'font-medium'">
                  {{ medication.currentStock }}
                </dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Stock minimum</dt>
                <dd class="font-medium">{{ medication.minimumStock }}</dd>
              </div>
            </dl>
          </div>

          <!-- Stock History -->
          <div class="lg:col-span-2 card">
            <h3 class="text-lg font-semibold mb-4">Historique des mouvements</h3>
            <div class="space-y-3">
              <div *ngFor="let movement of stockHistory"
                   class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span [class]="getMovementClass(movement.type)" class="font-medium">
                    {{ getMovementLabel(movement.type) }}
                  </span>
                  <span class="mx-2">{{ movement.quantity }}</span>
                  <span *ngIf="movement.reason" class="text-sm text-gray-500">- {{ movement.reason }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ formatDate(movement.performedAt) }}</span>
              </div>
              <div *ngIf="stockHistory.length === 0" class="text-center py-8 text-gray-500">
                Aucun mouvement enregistré
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Stock Movement Modal -->
      <div *ngIf="showStockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">Nouveau mouvement de stock</h3>

          <div class="space-y-4">
            <div>
              <label class="label">Type de mouvement</label>
              <select [(ngModel)]="newMovement.type" class="input">
                <option [value]="StockMovementType.Entry">Entrée</option>
                <option [value]="StockMovementType.Exit">Sortie</option>
                <option [value]="StockMovementType.Adjustment">Ajustement</option>
                <option [value]="StockMovementType.Loss">Perte</option>
              </select>
            </div>

            <div>
              <label class="label">Quantité</label>
              <input type="number" [(ngModel)]="newMovement.quantity" class="input" min="1">
            </div>

            <div>
              <label class="label">Raison</label>
              <input type="text" [(ngModel)]="newMovement.reason" class="input">
            </div>

            <div>
              <label class="label">N° Lot</label>
              <input type="text" [(ngModel)]="newMovement.batchNumber" class="input">
            </div>

            <div>
              <label class="label">Date d'expiration</label>
              <input type="date" [(ngModel)]="newMovement.expirationDate" class="input">
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button (click)="showStockModal = false" class="btn btn-secondary">Annuler</button>
            <button (click)="addStockMovement()" [disabled]="savingMovement" class="btn btn-primary">
              {{ savingMovement ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MedicationDetailComponent implements OnInit {
  medication: Medication | null = null;
  stockHistory: StockMovement[] = [];
  showStockModal = false;
  savingMovement = false;
  StockMovementType = StockMovementType;

  newMovement: Partial<CreateStockMovementDto> = {
    type: StockMovementType.Entry,
    quantity: 1,
    reason: '',
    batchNumber: '',
    expirationDate: ''
  };

  private medicationId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pharmacyApiService: PharmacyApiService
  ) {}

  ngOnInit(): void {
    this.medicationId = this.route.snapshot.paramMap.get('id') || '';
    if (this.medicationId) {
      this.loadMedication();
      this.loadStockHistory();
    }
  }

  loadMedication(): void {
    this.pharmacyApiService.getMedicationById(this.medicationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.medication = response.data;
        }
      }
    });
  }

  loadStockHistory(): void {
    this.pharmacyApiService.getMedicationStockHistory(this.medicationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.stockHistory = response.data.items;
        }
      }
    });
  }

  addStockMovement(): void {
    this.savingMovement = true;

    const movement: CreateStockMovementDto = {
      medicationId: this.medicationId,
      type: this.newMovement.type!,
      quantity: this.newMovement.quantity!,
      reason: this.newMovement.reason || undefined,
      batchNumber: this.newMovement.batchNumber || undefined,
      expirationDate: this.newMovement.expirationDate || undefined
    };

    this.pharmacyApiService.addStockMovement(movement).subscribe({
      next: (response) => {
        if (response.success) {
          this.showStockModal = false;
          this.loadMedication();
          this.loadStockHistory();
          this.resetMovementForm();
        }
        this.savingMovement = false;
      },
      error: () => {
        this.savingMovement = false;
      }
    });
  }

  resetMovementForm(): void {
    this.newMovement = {
      type: StockMovementType.Entry,
      quantity: 1,
      reason: '',
      batchNumber: '',
      expirationDate: ''
    };
  }

  goBack(): void {
    this.router.navigate(['/pharmacy/medications']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getFormLabel(form: MedicationForm): string {
    const labels: Record<MedicationForm, string> = {
      [MedicationForm.Tablet]: 'Comprimé',
      [MedicationForm.Capsule]: 'Gélule',
      [MedicationForm.Syrup]: 'Sirop',
      [MedicationForm.Injection]: 'Injection',
      [MedicationForm.Cream]: 'Crème',
      [MedicationForm.Ointment]: 'Pommade',
      [MedicationForm.Drops]: 'Gouttes',
      [MedicationForm.Inhaler]: 'Inhalateur',
      [MedicationForm.Suppository]: 'Suppositoire',
      [MedicationForm.Other]: 'Autre'
    };
    return labels[form] || 'Autre';
  }

  getMovementLabel(type: StockMovementType): string {
    switch (type) {
      case StockMovementType.Entry: return 'Entrée';
      case StockMovementType.Exit: return 'Sortie';
      case StockMovementType.Adjustment: return 'Ajustement';
      case StockMovementType.Loss: return 'Perte';
      default: return 'Inconnu';
    }
  }

  getMovementClass(type: StockMovementType): string {
    switch (type) {
      case StockMovementType.Entry: return 'text-green-600';
      case StockMovementType.Exit: return 'text-blue-600';
      case StockMovementType.Adjustment: return 'text-yellow-600';
      case StockMovementType.Loss: return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
}
