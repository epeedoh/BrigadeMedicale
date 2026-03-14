import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TriageService } from '../../core/services/triage.service';
import { TriageRecord } from '../../core/models/triage.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-triage-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="triage-list-container">
      <!-- Header Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ triages.length }}</div>
          <div class="stat-label">Triages du jour</div>
        </div>
        <div class="stat-card completed">
          <div class="stat-value">{{ completedCount }}</div>
          <div class="stat-label">Complétés</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">En attente</div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Chargement des triages du jour...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && triages.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3>Aucun triage du jour</h3>
        <p>Tous les patients ont déjà été triés!</p>
        <button (click)="goToNewTriage()" class="btn btn-primary">
          ➕ Nouveau triage
        </button>
      </div>

      <!-- Triage List -->
      <div *ngIf="!loading && triages.length > 0" class="triage-list">
        <div *ngFor="let triage of triages; let i = index"
             class="triage-card"
             [class.completed]="isCompleted(triage)">

          <!-- Status Badge -->
          <div class="status-badge" [class]="getStatusClass(triage)">
            {{ getStatusLabel(triage) }}
          </div>

          <!-- Urgency Badge -->
          <div class="urgency-badge" [class]="getUrgencyClass(triage)">
            {{ getUrgencyLabel(triage.urgencyLevel) }}
          </div>

          <!-- Patient Info -->
          <div class="patient-info">
            <h4 class="patient-name">{{ triage.patientName }}</h4>
            <p class="patient-details">
              📋 {{ triage.complaint }}
            </p>
            <p class="patient-vitals">
              🌡️ {{ triage.temperature }}°C | 💓 {{ triage.pulse }} bpm | 📊 {{ getSystolic(triage) }}/{{ getDiastolic(triage) }}
            </p>
            <p class="record-time">
              ⏰ {{ formatTime(triage.recordedAt) }}
            </p>
          </div>

          <!-- Action Button -->
          <button *ngIf="!isCompleted(triage)"
                  (click)="viewTriage(triage)"
                  class="btn btn-action">
            👁️ Voir détails
          </button>
          <button *ngIf="isCompleted(triage)"
                  (click)="viewTriage(triage)"
                  class="btn btn-secondary">
            ✓ Consulter
          </button>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="action-footer">
        <button (click)="refreshList()" class="btn btn-secondary" [disabled]="loading">
          🔄 Actualiser
        </button>
        <button (click)="goToNewTriage()" class="btn btn-primary">
          ➕ Nouveau triage
        </button>
      </div>
    </div>
  `,
  styles: [`
    .triage-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-card.completed {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .stat-card.pending {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top: 4px solid #008B8B;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #f5f5f5;
      border-radius: 12px;
      border: 2px dashed #ddd;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      color: #999;
      margin: 0 auto 16px;
    }

    .empty-state h3 {
      font-size: 20px;
      color: #333;
      margin-bottom: 8px;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 24px;
    }

    .triage-list {
      display: grid;
      gap: 16px;
      margin-bottom: 24px;
    }

    .triage-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 20px;
      align-items: center;
      transition: all 0.3s;
      position: relative;
    }

    .triage-card:hover {
      border-color: #008B8B;
      box-shadow: 0 4px 12px rgba(0, 139, 139, 0.15);
      transform: translateY(-2px);
    }

    .triage-card.completed {
      background: #f0f8f8;
      opacity: 0.7;
    }

    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.completed {
      background: #d4edda;
      color: #155724;
    }

    .urgency-badge {
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: bold;
      text-align: center;
      min-width: 100px;
      font-size: 14px;
    }

    .urgency-badge.green {
      background: #d4edda;
      color: #155724;
    }

    .urgency-badge.yellow {
      background: #fff3cd;
      color: #856404;
    }

    .urgency-badge.red {
      background: #f8d7da;
      color: #721c24;
    }

    .patient-info {
      padding-right: 12px;
    }

    .patient-name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin: 0 0 8px 0;
    }

    .patient-details,
    .patient-vitals,
    .record-time {
      font-size: 13px;
      color: #666;
      margin: 4px 0;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .btn-primary {
      background: #008B8B;
      color: white;
    }

    .btn-primary:hover {
      background: #006666;
      transform: scale(1.05);
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .btn-action {
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
    }

    .btn-action:hover {
      background: #45a049;
      transform: scale(1.05);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
    }
  `]
})
export class TriageListComponent implements OnInit, OnDestroy {
  triages: TriageRecord[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private triageService: TriageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTriages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTriages(): void {
    this.loading = true;
    this.triageService.getTodayTriages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.triages = response.data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading triages:', error);
          this.loading = false;
        }
      });
  }

  refreshList(): void {
    this.loadTriages();
  }

  viewTriage(triage: TriageRecord): void {
    this.router.navigate(['/triage/view', triage.id]);
  }

  goToNewTriage(): void {
    this.router.navigate(['/triage/nouveau']);
  }

  get completedCount(): number {
    return this.triages.filter(t => this.isCompleted(t)).length;
  }

  get pendingCount(): number {
    return this.triages.filter(t => !this.isCompleted(t)).length;
  }

  isCompleted(triage: TriageRecord): boolean {
    return triage.status === 1; // TriageStatus.COMPLETED = 1
  }

  getStatusLabel(triage: TriageRecord): string {
    return this.isCompleted(triage) ? '✓ Complété' : '⏳ En attente';
  }

  getStatusClass(triage: TriageRecord): string {
    return this.isCompleted(triage) ? 'completed' : 'pending';
  }

  getUrgencyLabel(level?: number): string {
    switch (level) {
      case 0: return '🟢 Vert';
      case 1: return '🟡 Jaune';
      case 2: return '🔴 Rouge';
      default: return '-';
    }
  }

  getUrgencyClass(triage: TriageRecord): string {
    switch (triage.urgencyLevel) {
      case 0: return 'green';
      case 1: return 'yellow';
      case 2: return 'red';
      default: return 'green';
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getSystolic(triage: TriageRecord): number {
    return triage.systolicBP ?? triage.systolic ?? 0;
  }

  getDiastolic(triage: TriageRecord): number {
    return triage.diastolicBP ?? triage.diastolic ?? 0;
  }
}
