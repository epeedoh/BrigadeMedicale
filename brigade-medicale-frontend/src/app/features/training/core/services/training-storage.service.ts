import { Injectable } from '@angular/core';
import { TrainingProgress, ProgressStatus, QuizResult, TrainingAudience } from '../models/training.models';

/**
 * Service de stockage local pour la progression des modules de formation
 * Permet le suivi offline + synchronisation quand l'API est disponible
 * Support multi-audience : patient, staff-admin, staff-accueil, etc.
 */
@Injectable({
  providedIn: 'root'
})
export class TrainingStorageService {
  private readonly STORAGE_PREFIX = 'training_';
  private readonly PROGRESS_KEY = 'progress';
  private readonly LAST_SYNC_KEY = 'last_sync';
  private currentAudience: TrainingAudience = 'Patient'; // default

  /**
   * Définit l'audience active pour les opérations de stockage
   */
  setAudience(audience: TrainingAudience): void {
    this.currentAudience = audience;
  }

  /**
   * Obtient l'audience active
   */
  getAudience(): TrainingAudience {
    return this.currentAudience;
  }

  /**
   * Construit la clé de stockage en fonction de l'audience
   */
  private buildKey(suffix: string, moduleId?: string): string {
    const base = `${this.STORAGE_PREFIX}${this.currentAudience}_${suffix}`;
    return moduleId ? `${base}_${moduleId}` : base;
  }

  /**
   * Récupère la progression d'un module
   */
  getProgress(moduleId: string): TrainingProgress | null {
    const key = this.buildKey(this.PROGRESS_KEY, moduleId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Récupère tous les progressions pour l'audience actuelle
   */
  getAllProgress(): Map<string, TrainingProgress> {
    const result = new Map<string, TrainingProgress>();
    const audiencePrefix = `${this.STORAGE_PREFIX}${this.currentAudience}_${this.PROGRESS_KEY}`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(audiencePrefix)) {
        const data = localStorage.getItem(key);
        if (data) {
          const progress = JSON.parse(data) as TrainingProgress;
          result.set(progress.moduleId, progress);
        }
      }
    }
    return result;
  }

  /**
   * Marque un module comme démarré
   */
  markStarted(moduleId: string): TrainingProgress {
    const existing = this.getProgress(moduleId);
    const progress: TrainingProgress = {
      moduleId,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      currentStepIndex: 0,
      ...existing
    };
    this.setProgress(moduleId, progress);
    return progress;
  }

  /**
   * Sauvegarde la progression d'un module
   */
  setProgress(moduleId: string, progress: TrainingProgress): void {
    const key = this.buildKey(this.PROGRESS_KEY, moduleId);
    localStorage.setItem(
      key,
      JSON.stringify({
        ...progress,
        moduleId // Ensure moduleId is always set
      })
    );
  }

  /**
   * Marque un module comme terminé avec le score du quiz
   */
  markCompleted(moduleId: string, quizResult: QuizResult): TrainingProgress {
    const progress: TrainingProgress = {
      moduleId,
      status: 'COMPLETED',
      completedAt: quizResult.completedAt,
      score: quizResult.score
    };
    this.setProgress(moduleId, progress);
    return progress;
  }

  /**
   * Récupère le statut d'un module
   */
  getStatus(moduleId: string): ProgressStatus {
    const progress = this.getProgress(moduleId);
    return progress?.status || 'NOT_STARTED';
  }

  /**
   * Récupère le dernier timestamp de synchronisation avec l'API
   */
  getLastSync(): Date | null {
    const key = this.buildKey(this.LAST_SYNC_KEY);
    const timestamp = localStorage.getItem(key);
    return timestamp ? new Date(timestamp) : null;
  }

  /**
   * Définit le timestamp de dernière synchronisation
   */
  setLastSync(date: Date = new Date()): void {
    const key = this.buildKey(this.LAST_SYNC_KEY);
    localStorage.setItem(key, date.toISOString());
  }

  /**
   * Efface tous les progressions (utile pour le logout)
   */
  clearAll(): void {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Compte le nombre de modules complétés
   */
  getCompletedCount(): number {
    let count = 0;
    const allProgress = this.getAllProgress();
    allProgress.forEach(progress => {
      if (progress.status === 'COMPLETED') count++;
    });
    return count;
  }

  /**
   * Récupère les statistiques globales
   */
  getStats(): { completed: number; inProgress: number; notStarted: number } {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    const allProgress = this.getAllProgress();
    allProgress.forEach(progress => {
      switch (progress.status) {
        case 'COMPLETED':
          completed++;
          break;
        case 'IN_PROGRESS':
          inProgress++;
          break;
        case 'NOT_STARTED':
          notStarted++;
          break;
      }
    });

    return { completed, inProgress, notStarted };
  }
}
