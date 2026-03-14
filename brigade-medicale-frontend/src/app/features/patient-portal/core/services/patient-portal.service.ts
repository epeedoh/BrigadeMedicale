import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../../../../core/services/config.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import {
  PatientProfile,
  PatientVisit,
  PatientConsultation,
  PatientLabTest,
  PatientPrescription,
  PatientAnnouncement
} from '../../../../shared/models/patient.model';

/**
 * Service pour les endpoints du portail patient (authentification par token patient requise)
 * Lecture seule du carnet de santé
 */
@Injectable({
  providedIn: 'root'
})
export class PatientPortalService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/patient`;
  }

  /**
   * Récupère le profil du patient connecté
   * GET /api/patient/me
   */
  getProfile(): Observable<ApiResponse<PatientProfile>> {
    return this.http.get<ApiResponse<PatientProfile>>(`${this.getApiUrl()}/me`);
  }

  /**
   * Récupère la liste des visites du patient
   * GET /api/patient/visits
   * Fallback: retourne liste vide si 404
   */
  getVisits(): Observable<ApiResponse<PatientVisit[]>> {
    return this.http.get<ApiResponse<PatientVisit[]>>(`${this.getApiUrl()}/visits`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn('⚠️ Endpoint /api/patient/visits absent (404) → Retour liste vide');
            return of({ success: true, message: 'Aucune visite', data: [] });
          }
          throw error;
        })
      );
  }

  /**
   * Récupère les consultations du patient
   * GET /api/patient/consultations
   * Fallback: retourne liste vide si 404
   */
  getConsultations(): Observable<ApiResponse<PatientConsultation[]>> {
    return this.http.get<ApiResponse<PatientConsultation[]>>(`${this.getApiUrl()}/consultations`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn('⚠️ Endpoint /api/patient/consultations absent (404) → Retour liste vide');
            return of({ success: true, message: 'Aucune consultation', data: [] });
          }
          throw error;
        })
      );
  }

  /**
   * Récupère le détail d'une consultation
   * GET /api/patient/consultations/{id}
   */
  getConsultationById(id: string): Observable<ApiResponse<PatientConsultation>> {
    return this.http.get<ApiResponse<PatientConsultation>>(`${this.getApiUrl()}/consultations/${id}`);
  }

  /**
   * Récupère les analyses de laboratoire du patient
   * GET /api/patient/lab-tests
   * Fallback: retourne liste vide si 404
   */
  getLabTests(): Observable<ApiResponse<PatientLabTest[]>> {
    return this.http.get<ApiResponse<PatientLabTest[]>>(`${this.getApiUrl()}/lab-tests`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn('⚠️ Endpoint /api/patient/lab-tests absent (404) → Retour liste vide');
            return of({ success: true, message: 'Aucune analyse', data: [] });
          }
          throw error;
        })
      );
  }

  /**
   * Récupère le détail d'une analyse
   * GET /api/patient/lab-tests/{id}
   */
  getLabTestById(id: string): Observable<ApiResponse<PatientLabTest>> {
    return this.http.get<ApiResponse<PatientLabTest>>(`${this.getApiUrl()}/lab-tests/${id}`);
  }

  /**
   * Récupère les prescriptions et dispensations du patient
   * GET /api/patient/prescriptions
   * Fallback: retourne liste vide si 404
   */
  getPrescriptions(): Observable<ApiResponse<PatientPrescription[]>> {
    return this.http.get<ApiResponse<PatientPrescription[]>>(`${this.getApiUrl()}/prescriptions`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            console.warn('⚠️ Endpoint /api/patient/prescriptions absent (404) → Retour liste vide');
            return of({ success: true, message: 'Aucune prescription', data: [] });
          }
          throw error;
        })
      );
  }

  /**
   * Récupère les annonces et conseils santé
   * GET /api/patient/announcements
   * NOTE: Si endpoint non disponible, retourne des données mock
   */
  getAnnouncements(): Observable<ApiResponse<PatientAnnouncement[]>> {
    // TODO: Remplacer par appel API réel quand endpoint disponible
    // return this.http.get<ApiResponse<PatientAnnouncement[]>>(`${this.getApiUrl()}/announcements`);

    // Mock data temporaire
    const mockAnnouncements: PatientAnnouncement[] = [
      {
        id: '1',
        title: 'Bienvenue à la Brigade Médicale',
        content: 'Nous sommes heureux de vous accueillir dans notre centre de santé. N\'hésitez pas à nous contacter pour toute question.',
        type: 'announcement',
        publishedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Conseil santé : Hydratation',
        content: 'Pensez à boire au moins 1,5L d\'eau par jour, surtout pendant les périodes de chaleur. L\'hydratation est essentielle pour votre santé.',
        type: 'health-tip',
        publishedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Horaires d\'ouverture',
        content: 'Notre centre est ouvert du lundi au vendredi de 8h à 17h, et le samedi de 8h à 12h. En cas d\'urgence, veuillez vous rendre aux urgences les plus proches.',
        type: 'info',
        publishedAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Campagne de vaccination',
        content: 'Une campagne de vaccination contre la grippe saisonnière est en cours. Renseignez-vous auprès de l\'accueil pour plus d\'informations.',
        type: 'announcement',
        publishedAt: new Date().toISOString()
      }
    ];

    return of({
      success: true,
      message: 'Annonces récupérées',
      data: mockAnnouncements
    });
  }

  /**
   * Récupère un résumé global pour le dashboard patient
   * GET /api/patient/summary
   */
  getSummary(): Observable<ApiResponse<PatientSummary>> {
    // TODO: Remplacer par appel API réel quand endpoint disponible
    // return this.http.get<ApiResponse<PatientSummary>>(`${this.getApiUrl()}/summary`);

    // Pour l'instant, on va construire le résumé à partir des autres appels
    // Cette méthode sera appelée côté composant qui aggregera les données
    return this.http.get<ApiResponse<PatientSummary>>(`${this.getApiUrl()}/summary`);
  }
}

// Interface pour le résumé dashboard
export interface PatientSummary {
  totalVisits: number;
  totalConsultations: number;
  pendingLabTests: number;
  pendingPrescriptions: number;
  lastVisitDate?: string;
  nextAppointment?: string;
}
