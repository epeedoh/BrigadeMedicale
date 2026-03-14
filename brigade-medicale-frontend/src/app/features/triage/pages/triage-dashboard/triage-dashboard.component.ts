import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TriageService } from '../../core/services/triage.service';
import { TriageListComponent } from '../../components/triage-list/triage-list.component';

@Component({
  selector: 'app-triage-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TriageListComponent],
  template: `
    <div class="triage-dashboard">
      <div class="header">
        <h1>Tableau de Bord Infirmier</h1>
        <p class="subtitle">Prise en charge des triages du jour</p>
      </div>

      <app-triage-list></app-triage-list>
    </div>
  `,
  styles: [`
    .triage-dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #f0f9f9 0%, #f5fdfd 100%);
      padding: 24px;
    }

    .header {
      margin-bottom: 32px;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 600;
      color: #1a5555;
      margin: 0 0 8px 0;
    }

    .header .subtitle {
      font-size: 16px;
      color: #666;
      margin: 0;
    }

    @media (max-width: 768px) {
      .triage-dashboard {
        padding: 16px;
      }

      .header h1 {
        font-size: 24px;
      }

      .header .subtitle {
        font-size: 14px;
      }
    }
  `]
})
export class TriageDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private triageService: TriageService) {}

  ngOnInit(): void {
    // Dashboard initialization if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
