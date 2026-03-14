import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ConfigService } from '../../../../core/services/config.service';
import { PatientRegisterDto, PatientRegisterResponse } from '../../../../shared/models/patient.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { PatientTokenService } from './patient-token.service';

/**
 * Service pour les endpoints publics patient (pas d'authentification requise)
 * Utilisé pour l'auto-enrôlement
 */
@Injectable({
  providedIn: 'root'
})
export class PatientPublicService {
  constructor(
    private http: HttpClient,
    private patientTokenService: PatientTokenService,
    private configService: ConfigService
  ) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/public/patients`;
  }

  /**
   * Enregistre un nouveau patient (auto-enrôlement)
   * POST /api/public/patients/register
   * Fallback DEV si endpoint absent (404)
   */
  register(data: PatientRegisterDto): Observable<ApiResponse<PatientRegisterResponse>> {
    return this.http.post<ApiResponse<PatientRegisterResponse>>(
      `${this.getApiUrl()}/register`,
      data
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Stocker automatiquement le token après inscription réussie
          this.patientTokenService.setPatientData(
            response.data.accessToken,
            response.data.patientNumber,
            response.data.qrCodeDataUrl
          );
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Si 404 : endpoint backend absent → fallback DEV
        if (error.status === 404) {
          console.warn('⚠️ Endpoint /api/public/patients/register absent (404) → Utilisation du fallback DEV');
          return of(this.generateDevMockResponse(data));
        }
        // Autres erreurs : re-throw
        throw error;
      })
    );
  }

  /**
   * Génère une réponse mock pour dev quand l'endpoint backend est absent
   * Simule une inscription réussie avec données factices
   */
  private generateDevMockResponse(data: PatientRegisterDto): ApiResponse<PatientRegisterResponse> {
    const patientNumber = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const token = `dev-token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
    const qrCodeDataUrl = this.generateMockQRCode(patientNumber);

    return {
      success: true,
      message: '[DEV MODE] Inscription réussie (fallback - backend absent)',
      data: {
        patientNumber,
        accessToken: token,
        qrCodeDataUrl
      }
    };
  }

  /**
   * Génère un QR code simulé (SVG simple avec le numéro patient)
   */
  private generateMockQRCode(patientNumber: string): string {
    // QR code SVG simple contenant le numéro patient
    const encodedPatientNumber = encodeURIComponent(patientNumber);
    const qrSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect width="40" height="40" fill="black"/>
        <rect x="160" width="40" height="40" fill="black"/>
        <rect y="160" width="40" height="40" fill="black"/>
        <text x="100" y="110" text-anchor="middle" font-family="monospace" font-size="12" fill="black">${patientNumber}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(qrSvg)}`;
  }

  /**
   * Vérifie si un numéro de téléphone est déjà enregistré
   * GET /api/public/patients/check-phone/{phoneNumber}
   */
  checkPhoneNumber(phoneNumber: string): Observable<ApiResponse<{ exists: boolean; patientNumber?: string }>> {
    return this.http.get<ApiResponse<{ exists: boolean; patientNumber?: string }>>(
      `${this.getApiUrl()}/check-phone/${encodeURIComponent(phoneNumber)}`
    );
  }

  /**
   * Connexion patient avec token existant (récupération de session)
   * POST /api/public/patients/login
   */
  loginWithToken(token: string): Observable<ApiResponse<PatientRegisterResponse>> {
    return this.http.post<ApiResponse<PatientRegisterResponse>>(
      `${this.getApiUrl()}/login`,
      { token }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.patientTokenService.setPatientData(
            response.data.accessToken,
            response.data.patientNumber,
            response.data.qrCodeDataUrl
          );
        }
      })
    );
  }

  /**
   * Connexion patient avec numéro patient + téléphone
   * POST /api/public/patients/login-phone
   */
  loginWithPhone(patientNumber: string, phoneNumber: string): Observable<ApiResponse<PatientRegisterResponse>> {
    return this.http.post<ApiResponse<PatientRegisterResponse>>(
      `${this.getApiUrl()}/login-phone`,
      { patientNumber, phoneNumber }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.patientTokenService.setPatientData(
            response.data.accessToken,
            response.data.patientNumber,
            response.data.qrCodeDataUrl
          );
        }
      })
    );
  }
}
