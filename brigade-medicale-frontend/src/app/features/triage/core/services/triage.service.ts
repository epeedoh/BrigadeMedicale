import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../../../../core/services/config.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { TriageRecord, CreateTriageDto, TriageDraft } from '../models/triage.model';

interface QueuedTriage {
  id: string;
  data: CreateTriageDto;
  retries: number;
  lastRetry?: number;
}

/**
 * Service pour gérer les données de Triage (prise de constantes)
 * Endpoints: /api/triage
 * Fallback: localStorage pour mode offline avec queue de synchronisation
 */
@Injectable({
  providedIn: 'root'
})
export class TriageService {
  private readonly DRAFT_KEY = 'triageDraft';
  private readonly QUEUE_KEY = 'triageOfflineQueue';
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 5000; // 5 secondes

  private syncSubject = new Subject<boolean>();
  public sync$ = this.syncSubject.asObservable();

  private isSyncing = false;
  private syncTimer: any;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.initOnlineMonitoring();
  }

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/triage`;
  }

  /**
   * Initialise la surveillance du statut online/offline
   */
  private initOnlineMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('✓ Connexion rétablie → Synchronisation de la queue');
      this.syncOfflineQueue();
    });
  }

  /**
   * Enregistre un nouveau triage
   * POST /api/triage
   * Si offline: ajoute à la queue et tente la synchronisation
   */
  createTriage(data: CreateTriageDto): Observable<ApiResponse<TriageRecord>> {
    return this.http.post<ApiResponse<TriageRecord>>(`${this.getApiUrl()}`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Gestion du mode offline (pas de connexion ou 404)
          if (error.status === 404 || !navigator.onLine) {
            console.warn('⚠️ Mode offline détecté → Triage ajouté à la queue');
            const queuedItem: QueuedTriage = {
              id: `triage-${Date.now()}`,
              data,
              retries: 0
            };
            this.addToQueue(queuedItem);

            // Tenter la synchronisation si online
            if (navigator.onLine) {
              this.syncOfflineQueue();
            }

            // Retourner une réponse fictive
            return of({
              success: true,
              message: '[Mode offline] Triage en attente de synchronisation',
              data: {
                id: queuedItem.id,
                patientId: data.patientId,
                recordedAt: new Date().toISOString(),
                temperature: data.temperature,
                systolicBP: data.systolicBP,
                diastolicBP: data.diastolicBP,
                pulse: data.pulse,
                weight: data.weight,
                height: data.height,
                spO2: data.spO2,
                complaint: data.complaint,
                notes: data.notes,
                urgencyLevel: data.urgencyLevel,
                status: 0
              } as any
            });
          }
          throw error;
        })
      );
  }

  /**
   * Ajoute un triage à la queue offline
   */
  private addToQueue(item: QueuedTriage): void {
    const queue = this.getQueue();
    queue.push(item);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    console.log(`✓ Triage #${item.id} ajouté à la queue (${queue.length} items)`);
  }

  /**
   * Récupère la queue offline
   */
  private getQueue(): QueuedTriage[] {
    const queue = localStorage.getItem(this.QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  /**
   * Synchronise la queue offline avec le serveur
   */
  public syncOfflineQueue(): void {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    const queue = this.getQueue();

    if (queue.length === 0) {
      this.isSyncing = false;
      return;
    }

    console.log(`🔄 Synchronisation de la queue: ${queue.length} item(s)`);

    let completedRequests = 0;
    const totalRequests = queue.filter(item => item.retries < this.MAX_RETRIES).length;

    if (totalRequests === 0) {
      this.isSyncing = false;
      return;
    }

    queue.forEach(item => {
      if (item.retries < this.MAX_RETRIES) {
        this.http.post<ApiResponse<TriageRecord>>(`${this.getApiUrl()}`, item.data)
          .pipe(
            catchError(error => {
              item.retries++;
              item.lastRetry = Date.now();

              if (item.retries >= this.MAX_RETRIES) {
                console.error(`❌ Sync failed for ${item.id} after ${this.MAX_RETRIES} retries`);
              } else {
                console.warn(`⚠️ Sync failed for ${item.id}, retry ${item.retries}/${this.MAX_RETRIES}`);
              }

              return of(null);
            })
          )
          .subscribe(response => {
            if (response?.success) {
              console.log(`✓ Triage ${item.id} synchronized successfully`);
              this.removeFromQueue(item.id);
              this.syncSubject.next(true);
            } else {
              item.retries++;
              item.lastRetry = Date.now();
            }

            // Sauvegarder l'état de la queue
            const updatedQueue = this.getQueue();
            const itemIndex = updatedQueue.findIndex(q => q.id === item.id);
            if (itemIndex >= 0) {
              updatedQueue[itemIndex] = item;
              localStorage.setItem(this.QUEUE_KEY, JSON.stringify(updatedQueue));
            }

            completedRequests++;
            // Reset isSyncing only when all requests have completed
            if (completedRequests === totalRequests) {
              this.isSyncing = false;
            }
          });
      }
    });
  }

  /**
   * Supprime un triage de la queue
   */
  private removeFromQueue(id: string): void {
    let queue = this.getQueue();
    queue = queue.filter(item => item.id !== id);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    console.log(`✓ Triage ${id} removed from queue`);
  }

  /**
   * Obtient le nombre d'items en attente de synchronisation
   */
  getQueueLength(): number {
    return this.getQueue().length;
  }

  /**
   * Obtient le contenu complet de la queue
   */
  getQueueItems(): QueuedTriage[] {
    return this.getQueue();
  }

  /**
   * Récupère le triage le plus récent pour un patient
   * GET /api/triage/latest?patientId={id}
   */
  getLatestTriage(patientId: string): Observable<ApiResponse<TriageRecord>> {
    return this.http.get<ApiResponse<TriageRecord>>(`${this.getApiUrl()}/latest`, {
      params: { patientId }
    })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn('⚠️ Endpoint /api/triage/latest absent (404) → Pas de triage trouvé');
            return of({
              success: false,
              message: 'Aucun triage trouvé',
              data: null as any
            });
          }
          throw error;
        })
      );
  }

  /**
   * Récupère le triage pour une visite spécifique
   * GET /api/triage/by-visit/{visitId}
   */
  getTriageByVisit(visitId: string): Observable<ApiResponse<TriageRecord>> {
    return this.http.get<ApiResponse<TriageRecord>>(`${this.getApiUrl()}/by-visit/${visitId}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn(`⚠️ Aucun triage trouvé pour visite ${visitId}`);
            return of({
              success: false,
              message: 'Aucun triage pour cette visite',
              data: null as any
            });
          }
          throw error;
        })
      );
  }

  /**
   * Sauvegarde un brouillon de triage en localStorage (mode offline)
   */
  saveDraft(draft: TriageDraft): void {
    const draftWithTimestamp: TriageDraft = {
      ...draft,
      savedAt: Date.now()
    };
    localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draftWithTimestamp));
    console.log('✓ Triage en brouillon sauvegardé localement');
  }

  /**
   * Récupère le brouillon sauvegardé
   */
  getDraft(): TriageDraft | null {
    const draft = localStorage.getItem(this.DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  }

  /**
   * Efface le brouillon
   */
  clearDraft(): void {
    localStorage.removeItem(this.DRAFT_KEY);
    console.log('✓ Brouillon supprimé');
  }

  /**
   * Récupère les triages du jour
   * GET /api/triage/today
   */
  getTodayTriages(): Observable<ApiResponse<TriageRecord[]>> {
    return this.http.get<ApiResponse<TriageRecord[]>>(`${this.getApiUrl()}/today`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn('⚠️ Endpoint /api/triage/today absent (404) → Aucun triage trouvé');
            return of({
              success: true,
              message: 'Aucun triage trouvé pour aujourd\'hui',
              data: [] as any
            });
          }
          throw error;
        })
      );
  }

  /**
   * Calcul l'IMC
   */
  calculateIMC(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }
}
