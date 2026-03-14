import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrainingModule, QuizResult } from '../../core/models/training.models';
import { TrainingService } from '../../core/services/training.service';
import { TrainingStorageService } from '../../core/services/training-storage.service';

@Component({
  selector: 'app-training-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="w-full h-full flex flex-col bg-gray-50">
      <!-- Header with Back Button -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div class="p-4 sm:p-6 max-w-4xl mx-auto">
          <button
            (click)="goBack()"
            class="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Retour au module
          </button>

          @if (module) {
            <div class="space-y-4">
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Quiz: {{ module.title }}
                </h1>
                <p class="text-gray-600">Testez vos connaissances sur ce module</p>
              </div>

              <!-- Progress Bar -->
              <div class="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Progression</span>
                    <span class="text-sm font-medium text-teal-600">{{ currentQuestionIndex + 1 }}/{{ module.quiz?.length || 0 }}</span>
                  </div>
                  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-teal-600 transition-all duration-300"
                      [style.width.%]="((currentQuestionIndex + 1) / (module.quiz?.length || 1)) * 100"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <div class="max-w-2xl mx-auto">
          <!-- Loading -->
          @if (!module) {
            <div class="text-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Chargement du quiz...</p>
            </div>
          }

          <!-- Quiz Content -->
          @if (module) {
            <div class="space-y-6">
              <!-- Results Screen -->
              @if (isResultsShown) {
                <div class="space-y-6">
                  <div class="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 text-center space-y-6">
                    <!-- Score Circle -->
                    <div class="flex justify-center">
                      <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-teal-600 flex items-center justify-center bg-teal-50">
                        <div class="text-center">
                          <div class="text-4xl sm:text-5xl font-bold text-teal-600">
                            {{ calculateScore() }}%
                          </div>
                          <div class="text-sm text-gray-600 mt-2">
                            {{ correctAnswers }}/{{ (module.quiz?.length || 0) }} correct
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Result Message -->
                    <div class="space-y-2">
                      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
                        {{ getResultMessage() }}
                      </h2>
                      <p class="text-gray-600">
                        {{ getResultDescription() }}
                      </p>
                    </div>

                    <!-- Passed/Failed Badge -->
                    <div class="pt-4 border-t border-gray-200">
                      <span
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                        [ngClass]="calculateScore() >= 60
                          ? 'bg-green-50 text-green-700'
                          : 'bg-orange-50 text-orange-700'"
                      >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          @if (calculateScore() >= 60) {
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                          } @else {
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                          }
                        </svg>
                        {{ calculateScore() >= 60 ? 'Module réussi !' : 'À réessayer' }}
                      </span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col sm:flex-row gap-3">
                    <button
                      (click)="resetQuiz()"
                      class="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                      Refaire le quiz
                    </button>
                    <button
                      (click)="goBack()"
                      class="flex-1 px-6 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-medium transition-colors"
                    >
                      Retour au module
                    </button>
                  </div>
                </div>
              }

              <!-- Question Screen -->
              @if (!isResultsShown && module.quiz && module.quiz[currentQuestionIndex]) {
                <div class="space-y-6">
                  <div class="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 space-y-8">
                    <!-- Question Text -->
                    <div class="space-y-4">
                      <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-semibold text-teal-700">
                          {{ currentQuestionIndex + 1 }}
                        </div>
                        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 pt-1">
                          {{ module.quiz[currentQuestionIndex].question }}
                        </h3>
                      </div>
                    </div>

                    <!-- Answer Options -->
                    <div class="space-y-3">
                      @for (option of module.quiz[currentQuestionIndex].options; track $index; let idx = $index) {
                        <div class="relative flex items-start">
                          <div class="flex items-center h-6">
                            <input
                              type="radio"
                              [id]="'option-' + idx"
                              [name]="'question-' + currentQuestionIndex"
                              [value]="idx"
                              [(ngModel)]="selectedAnswers[currentQuestionIndex]"
                              class="h-4 w-4 text-teal-600 border-gray-300 cursor-pointer"
                            />
                          </div>
                          <label
                            [for]="'option-' + idx"
                            class="ml-3 block text-gray-700 cursor-pointer hover:text-gray-900 transition-colors"
                          >
                            <span class="block text-sm sm:text-base font-medium">
                              {{ option }}
                            </span>
                          </label>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Navigation Buttons -->
                  <div class="flex gap-3">
                    @if (currentQuestionIndex > 0) {
                      <button
                        (click)="previousQuestion()"
                        class="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm sm:text-base transition-colors"
                      >
                        ← Précédent
                      </button>
                    }
                    @if (currentQuestionIndex < (module.quiz!.length || 0) - 1) {
                      <button
                        (click)="nextQuestion()"
                        [disabled]="selectedAnswers[currentQuestionIndex] === undefined"
                        class="flex-1 px-4 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-medium text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant →
                      </button>
                    }
                    @if (currentQuestionIndex === (module.quiz!.length || 0) - 1) {
                      <button
                        (click)="submitQuiz(module.id)"
                        [disabled]="selectedAnswers[currentQuestionIndex] === undefined"
                        class="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Soumettre le quiz
                      </button>
                    }
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
      @apply flex flex-col h-screen w-full;
    }
  `]
})
export class TrainingQuizComponent implements OnInit {
  module: TrainingModule | null = null;
  currentQuestionIndex = 0;
  selectedAnswers: (number | undefined)[] = [];
  isResultsShown = false;
  correctAnswers = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private trainingService: TrainingService,
    private trainingStorage: TrainingStorageService,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const moduleId = params.get('id');
      if (moduleId) {
        this.trainingService.getModuleById(moduleId, 'PATIENT').pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: (module) => {
            this.module = module;
            // Initialize selectedAnswers array
            this.selectedAnswers = new Array(module.quiz?.length || 0);
          },
          error: (error) => {
            console.error('Error loading module:', error);
          }
        });
      }
    });
  }

  nextQuestion(): void {
    if (this.module && this.currentQuestionIndex < this.module.quiz!.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitQuiz(moduleId: string): void {
    if (!this.module) return;

    // Calculate correct answers
    this.correctAnswers = 0;
    this.module.quiz!.forEach((question, idx) => {
      if (this.selectedAnswers[idx] === question.answerIndex) {
        this.correctAnswers++;
      }
    });

    // Create quiz result with proper answer structure
    const result: QuizResult = {
      moduleId,
      score: this.calculateScore(),
      correctAnswers: this.correctAnswers,
      totalQuestions: this.module.quiz!.length,
      completedAt: new Date().toISOString(),
      answers: this.module.quiz!.map((question, idx) => ({
        questionId: question.id,
        selectedIndex: this.selectedAnswers[idx] ?? -1
      }))
    };

    // Mark module as completed
    this.trainingStorage.markCompleted(moduleId, result);

    // Show results
    this.isResultsShown = true;
  }

  resetQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswers = new Array(this.module?.quiz?.length || 0);
    this.isResultsShown = false;
    this.correctAnswers = 0;
  }

  calculateScore(): number {
    if (!this.module?.quiz) return 0;
    return Math.round((this.correctAnswers / this.module.quiz.length) * 100);
  }

  getResultMessage(): string {
    const score = this.calculateScore();
    if (score >= 90) return 'Excellent !';
    if (score >= 75) return 'Très bien !';
    if (score >= 60) return 'Bien !';
    return 'À réessayer';
  }

  getResultDescription(): string {
    const score = this.calculateScore();
    if (score >= 90) {
      return 'Vous maîtrisez parfaitement ce module. Félicitations !';
    }
    if (score >= 75) {
      return 'Vous avez une bonne compréhension du module.';
    }
    if (score >= 60) {
      return 'Vous avez les notions essentielles du module.';
    }
    return 'Relisez le module et réessayez le quiz.';
  }

  goBack(): void {
    this.router.navigate(['/patient/dashboard/training', this.module?.id]);
  }
}
