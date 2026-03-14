import { Injectable } from '@angular/core';

/**
 * Service de gestion du token patient (séparé du JWT staff)
 * Le token est stocké dans localStorage pour persister entre sessions
 */
@Injectable({
  providedIn: 'root'
})
export class PatientTokenService {
  private readonly PATIENT_TOKEN_KEY = 'patientToken';
  private readonly PATIENT_NUMBER_KEY = 'patientNumber';
  private readonly QR_CODE_KEY = 'patientQrCode';

  /**
   * Stocke le token patient et les infos associées
   */
  setPatientData(token: string, patientNumber: string, qrCodeDataUrl?: string): void {
    localStorage.setItem(this.PATIENT_TOKEN_KEY, token);
    localStorage.setItem(this.PATIENT_NUMBER_KEY, patientNumber);
    if (qrCodeDataUrl) {
      localStorage.setItem(this.QR_CODE_KEY, qrCodeDataUrl);
    }
  }

  /**
   * Récupère le token patient
   */
  getToken(): string | null {
    return localStorage.getItem(this.PATIENT_TOKEN_KEY);
  }

  /**
   * Récupère le numéro patient
   */
  getPatientNumber(): string | null {
    return localStorage.getItem(this.PATIENT_NUMBER_KEY);
  }

  /**
   * Récupère le QR code stocké
   */
  getQrCode(): string | null {
    return localStorage.getItem(this.QR_CODE_KEY);
  }

  /**
   * Vérifie si un token patient est présent
   */
  hasToken(): boolean {
    const token = this.getToken();
    return token !== null && token.length > 0;
  }

  /**
   * Efface toutes les données patient
   */
  clearPatientData(): void {
    localStorage.removeItem(this.PATIENT_TOKEN_KEY);
    localStorage.removeItem(this.PATIENT_NUMBER_KEY);
    localStorage.removeItem(this.QR_CODE_KEY);
  }

  /**
   * Met à jour uniquement le token (en cas de refresh)
   */
  updateToken(token: string): void {
    localStorage.setItem(this.PATIENT_TOKEN_KEY, token);
  }
}
