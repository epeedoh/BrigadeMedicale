import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrainingModule, TrainingAudience, TrainingProgress } from '../../core/models/training.models';
import { TrainingService } from '../../core/services/training.service';
import { TrainingStorageService } from '../../core/services/training-storage.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-training-staff-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="w-full h-full flex flex-col bg-gray-50">
      <!-- Header with Back Button -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div class="p-4 sm:p-6 max-w-4xl mx-auto">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Retour au catalogue
          </button>

          @if (module) {
            <div class="space-y-4">
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {{ module.title }}
                </h1>
                <p class="text-gray-600">{{ module.shortDescription || module.description }}</p>
              </div>

              <!-- Module Info Bar -->
              <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">⏱</span>
                  <span class="text-sm font-medium">{{ module.durationMinutes }} minutes</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">📚</span>
                  <span class="text-sm font-medium">{{ module.steps.length }} étapes</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">{{ getModuleStatus(module.id) === 'COMPLETED' ? '✓' : '📖' }}</span>
                  <span class="text-sm font-medium">{{ getStatusLabel(getModuleStatus(module.id)) }}</span>
                </div>
                <div>
                  <span class="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {{ module.level }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div class="max-w-4xl mx-auto space-y-6">
          <!-- Loading -->
          @if (isLoading) {
            <div class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Chargement du module...</p>
            </div>
          }

          <!-- Error State -->
          @if (errorMessage && !isLoading) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
              <div class="flex items-start gap-4">
                <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 class="font-semibold text-red-900 mb-2">Erreur de chargement</h3>
                  <p class="text-red-700 text-sm">{{ errorMessage }}</p>
                  <button
                    (click)="reload()"
                    class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Module Content -->
          @if (module && !isLoading && !errorMessage) {
            <div>
              <!-- Steps Accordion -->
              <div class="space-y-3">
                @for (step of module.steps; track step.id; let idx = $index) {
                  <div
                    class="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                <button
                  (click)="toggleStep(step.id)"
                  class="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center gap-4 text-left flex-1 min-w-0">
                    <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                      {{ idx + 1 }}
                    </div>
                    <h3 class="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {{ step.title }}
                    </h3>
                  </div>
                  <svg
                    [class.rotate-180]="expandedSteps.has(step.id)"
                    class="w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </button>

                <!-- Step Content -->
                @if (expandedSteps.has(step.id)) {
                  <div
                    class="border-t border-gray-200 bg-gray-50 p-4 sm:p-5 space-y-4"
                  >
                    <!-- Content Text -->
                    <div class="prose prose-sm max-w-none">
                      <p class="text-gray-700 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                        {{ step.content }}
                      </p>
                    </div>

                    <!-- Media if available -->
                    @if (step.media && step.media.length > 0) {
                      <div class="space-y-3">
                        @for (media of step.media; track media.url) {
                          <div class="bg-white rounded-lg p-3 sm:p-4">
                            @if (media.type === 'image') {
                              <div class="text-center">
                                <img
                                  [src]="media.url"
                                  [alt]="media.caption"
                                  class="max-w-full h-auto rounded-lg"
                                />
                                @if (media.caption) {
                                  <p class="text-xs sm:text-sm text-gray-600 mt-2">
                                    {{ media.caption }}
                                  </p>
                                }
                              </div>
                            }
                            @if (media.type === 'link') {
                              <div class="text-center">
                                <a
                                  [href]="media.url"
                                  target="_blank"
                                  rel="noopener"
                                  class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                  </svg>
                                  Voir la ressource
                                </a>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }

                    <!-- Step Navigation -->
                    <div class="flex gap-3 pt-4 border-t border-gray-200">
                      @if (idx > 0) {
                        <button
                          (click)="previousStep()"
                          class="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors"
                        >
                          ← Précédent
                        </button>
                      }
                      @if (idx < module.steps.length - 1) {
                        <button
                          (click)="nextStep()"
                          class="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors"
                        >
                          Suivant →
                        </button>
                      }
                    </div>
                  </div>
                }
                  </div>
                }
              </div>

              <!-- Bottom CTA - Completion Button -->
              <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mt-6">
                <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900">Vous avez terminé ce module?</h3>
                    <p class="text-sm text-gray-600 mt-1">
                      Marquez-le comme complété pour enregistrer votre progression
                    </p>
                  </div>
                  @if (getModuleStatus(module.id) !== 'COMPLETED') {
                    <button
                      (click)="markModuleComplete(module.id)"
                      class="flex-shrink-0 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors whitespace-nowrap"
                    >
                      Marquer comme terminé
                    </button>
                  }
                  @else {
                    <div class="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-50 text-green-700 font-medium">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Module complété
                    </div>
                  }
                </div>
              </div>
            </div>
          }
    </div>
  `,
  styles: [`
    :host {
      @apply flex flex-col h-screen w-full;
    }

    .prose {
      color: inherit;
      font-size: inherit;
    }
  `]
})
export class TrainingStaffDetailComponent implements OnInit {
  module: TrainingModule | null = null;
  expandedSteps = new Set<string>();
  currentStepIndex = 0;
  audience: TrainingAudience = 'StaffAdmin';
  isLoading = true;
  errorMessage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private trainingService: TrainingService,
    private trainingStorage: TrainingStorageService,
    private authService: AuthService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // First, determine the audience from user's role
    this.authService.getCurrentUser().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(user => {
      if (user && user.roles && user.roles.length > 0) {
        const userRole = user.roles[0];
        this.audience = this.trainingService.getRoleToAudience(userRole);
        console.log(`User role: ${userRole}, mapped to audience: ${this.audience}`);
      }

      // Then load the module
      this.activatedRoute.paramMap.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(params => {
        const moduleId = params.get('id');
        if (moduleId) {
          console.log(`Loading module ${moduleId} for audience ${this.audience}`);
          this.trainingService.getModuleByIdAndAudience(moduleId, this.audience).pipe(
            takeUntilDestroyed(this.destroyRef)
          ).subscribe({
            next: (module) => {
              console.log(`Successfully loaded module:`, module);
              this.module = module;
              this.isLoading = false;
              this.errorMessage = '';
              // Auto-expand first step
              if (module.steps.length > 0) {
                this.expandedSteps.add(module.steps[0].id);
              }
            },
            error: (error) => {
              console.error('Error loading module:', error);
              this.isLoading = false;
              this.errorMessage = `Erreur lors du chargement du module: ${error.message}. Si le problème persiste, veuillez rafraîchir la page.`;
            }
          });
        } else {
          this.isLoading = false;
          this.errorMessage = 'Aucun module spécifié dans l\'URL';
        }
      });
    });
  }

  toggleStep(stepId: string): void {
    if (this.expandedSteps.has(stepId)) {
      this.expandedSteps.delete(stepId);
    } else {
      this.expandedSteps.clear();
      this.expandedSteps.add(stepId);
    }
  }

  nextStep(): void {
    if (this.module && this.currentStepIndex < this.module.steps.length - 1) {
      this.currentStepIndex++;
      const nextStep = this.module.steps[this.currentStepIndex];
      this.expandedSteps.clear();
      this.expandedSteps.add(nextStep.id);
    }
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      const prevStep = this.module!.steps[this.currentStepIndex];
      this.expandedSteps.clear();
      this.expandedSteps.add(prevStep.id);
    }
  }

  getModuleStatus(moduleId: string) {
    return this.trainingStorage.getStatus(moduleId);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'NOT_STARTED': 'Non commencé',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Complété'
    };
    return labels[status] || status;
  }

  markModuleComplete(moduleId: string): void {
    const progress: TrainingProgress = {
      moduleId,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      startedAt: this.trainingStorage.getProgress(moduleId)?.startedAt || new Date().toISOString(),
      currentStepIndex: this.module?.steps.length || 0,
      completedSteps: this.module?.steps.map(s => s.id) || []
    };
    this.trainingStorage.setProgress(moduleId, progress);
  }

  goBack(): void {
    this.router.navigate(['/training']);
  }

  reload(): void {
    // Reload the page to retry loading the module
    window.location.reload();
  }
}
