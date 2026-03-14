import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrainingModule, ProgressStatus, TrainingRole } from '../../core/models/training.models';
import { TrainingService } from '../../core/services/training.service';
import { TrainingStorageService } from '../../core/services/training-storage.service';

@Component({
  selector: 'app-training-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="w-full h-full flex flex-col">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 p-4 sm:p-6">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Centre de Formation
          </h1>
          <p class="text-gray-600 text-sm sm:text-base">
            Améliorez vos connaissances en santé avec nos modules de formation
          </p>

          <!-- Offline Badge -->
          @if (isOffline) {
            <div class="mt-3 inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
              </svg>
              Mode hors ligne
            </div>
          }
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100 p-4 sm:p-6">
        <div class="max-w-6xl mx-auto grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-teal-600">{{ stats.completed }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">Complétés</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ stats.inProgress }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">En cours</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600">{{ totalModules }}</div>
            <div class="text-xs sm:text-sm text-gray-600 mt-1">Total</div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="bg-white border-b border-gray-200 p-4 sm:p-6">
        <div class="max-w-6xl mx-auto">
          <div class="relative">
            <input
              [(ngModel)]="searchTerm"
              type="text"
              placeholder="Rechercher un module..."
              class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div class="max-w-6xl mx-auto">
          <!-- Loading State -->
          @if (isLoading) {
            <div class="flex items-center justify-center py-12">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Chargement des modules...</p>
              </div>
            </div>
          }

          <!-- Error State -->
          @if (error && !isLoading) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p class="font-semibold">Erreur de chargement</p>
              <p class="text-sm mt-1">{{ error }}</p>
            </div>
          }

          <!-- Empty State -->
          @if (filteredModules.length === 0 && !isLoading && !error) {
            <div class="text-center py-12">
              <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <p class="text-gray-600 font-medium">Aucun module trouvé</p>
              <p class="text-sm text-gray-500 mt-1">Essayez une autre recherche</p>
            </div>
          }

          <!-- Modules Grid -->
          @if (filteredModules.length > 0 && !isLoading && !error) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              @for (module of filteredModules; track module.id) {
                <div
                  class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                  (click)="navigateToModule(module.id)"
                >
                  <!-- Module Image -->
                  <div class="h-40 sm:h-48 bg-gradient-to-br from-teal-100 to-blue-100 overflow-hidden">
                    @if (module.imageUrl) {
                      <img
                        [src]="module.imageUrl"
                        [alt]="module.title"
                        class="w-full h-full object-cover"
                      />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center">
                        <svg class="w-16 h-16 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747m0-13c5.5 0 10 4.745 10 10.747S17.5 27.747 12 27.747m0-13V6.253m0 13v13m0-13c-5.5 0-10 4.745-10 10.747S6.5 27.747 12 27.747m0-13c5.5 0 10 4.745 10 10.747S17.5 27.747 12 27.747"/>
                        </svg>
                      </div>
                    }
                  </div>

                  <!-- Content -->
                  <div class="p-4 sm:p-5">
                    <!-- Status Badge -->
                    <div class="flex items-center justify-between mb-3">
                      <span [ngClass]="'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' + getStatusClass(getModuleStatus(module.id))">
                        {{ getStatusLabel(getModuleStatus(module.id)) }}
                      </span>
                      <span class="text-xs text-gray-500 font-medium">
                        ⏱ {{ module.durationMinutes }} min
                      </span>
                    </div>

                    <!-- Title -->
                    <h3 class="font-semibold text-gray-900 line-clamp-2 mb-2">
                      {{ module.title }}
                    </h3>

                    <!-- Description -->
                    <p class="text-sm text-gray-600 line-clamp-2 mb-3">
                      {{ module.shortDescription || module.description }}
                    </p>

                    <!-- Level & Tags -->
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded">
                        {{ module.level }}
                      </span>
                      <div class="flex gap-1">
                        @for (tag of module.tags.slice(0, 1); track tag) {
                          <span class="text-xs text-gray-500">
                            {{ tag }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Progress Bar (if in progress or completed) -->
                    @if (getModuleStatus(module.id) !== 'NOT_STARTED') {
                      <div class="mb-3">
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-xs text-gray-600">Progression</span>
                          <span class="text-xs font-medium text-teal-600">{{ getModuleScore(module.id) }}%</span>
                        </div>
                        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-teal-500 transition-all"
                            [style.width.%]="getModuleScore(module.id)"
                          ></div>
                        </div>
                      </div>
                    }

                    <!-- CTA Button -->
                    <button
                      class="w-full py-2 px-3 rounded-lg font-medium text-sm transition-colors"
                      [ngClass]="getCTAButtonClass(getModuleStatus(module.id))"
                    >
                      {{ getCTAButtonLabel(getModuleStatus(module.id)) }}
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      @apply flex flex-col h-screen w-full bg-gray-50;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TrainingCatalogComponent implements OnInit {
  searchTerm = '';
  modules: TrainingModule[] = [];
  isLoading = true;
  isOffline = false;
  error: string | null = null;
  stats = { completed: 0, inProgress: 0, notStarted: 0 };
  totalModules = 0;

  constructor(
    private trainingService: TrainingService,
    private trainingStorage: TrainingStorageService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadModules();
  }

  private loadModules(): void {
    this.isLoading = true;
    this.error = null;
    this.trainingService.getModulesByRole('PATIENT').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (modules) => {
        this.modules = modules;
        this.totalModules = modules.length;
        this.isOffline = this.trainingService.isOffline();
        this.updateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.error = 'Impossible de charger les modules de formation';
        this.isLoading = false;
        this.isOffline = this.trainingService.isOffline();
      }
    });
  }

  private updateStats(): void {
    this.stats = this.trainingStorage.getStats();
  }

  get filteredModules(): TrainingModule[] {
    if (!this.searchTerm.trim()) {
      return this.modules;
    }

    const term = this.searchTerm.toLowerCase();
    return this.modules.filter(m =>
      m.title.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  getModuleStatus(moduleId: string): ProgressStatus {
    return this.trainingStorage.getStatus(moduleId);
  }

  getModuleScore(moduleId: string): number {
    const progress = this.trainingStorage.getProgress(moduleId);
    return progress?.score || 0;
  }

  getStatusLabel(status: ProgressStatus): string {
    const labels: Record<ProgressStatus, string> = {
      'NOT_STARTED': 'Commencer',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Complété'
    };
    return labels[status];
  }

  getStatusClass(status: ProgressStatus): string {
    const classes: Record<ProgressStatus, string> = {
      'NOT_STARTED': ' bg-gray-100 text-gray-800',
      'IN_PROGRESS': ' bg-blue-100 text-blue-800',
      'COMPLETED': ' bg-green-100 text-green-800'
    };
    return classes[status];
  }

  getCTAButtonLabel(status: ProgressStatus): string {
    const labels: Record<ProgressStatus, string> = {
      'NOT_STARTED': 'Commencer',
      'IN_PROGRESS': 'Continuer',
      'COMPLETED': 'Revoir'
    };
    return labels[status];
  }

  getCTAButtonClass(status: ProgressStatus): string {
    const classes: Record<ProgressStatus, string> = {
      'NOT_STARTED': 'bg-teal-600 text-white hover:bg-teal-700',
      'IN_PROGRESS': 'bg-blue-600 text-white hover:bg-blue-700',
      'COMPLETED': 'bg-gray-600 text-white hover:bg-gray-700'
    };
    return classes[status];
  }

  navigateToModule(moduleId: string): void {
    const status = this.getModuleStatus(moduleId);
    if (status === 'NOT_STARTED') {
      this.trainingStorage.markStarted(moduleId);
    }
    this.router.navigate(['/patient/dashboard/training', moduleId]);
  }
}
