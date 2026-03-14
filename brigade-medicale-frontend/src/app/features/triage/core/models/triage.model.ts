/**
 * Modèle pour les données de Triage (prise de constantes)
 */

export enum TriageStatus {
  PENDING = 0,
  COMPLETED = 1,
  CANCELLED = 2
}

export enum UrgencyLevel {
  GREEN = 0,
  YELLOW = 1,
  RED = 2
}

export interface TriageRecord {
  id?: string;
  patientId: string;
  patientName?: string; // Nom du patient (depuis le backend)
  patientNumber?: string; // Numéro patient
  visitId?: string;
  consultationId?: string;
  recordedAt: string; // ISO datetime
  recordedBy?: string; // User ID who recorded
  infirmierId?: string; // ID infirmier
  infirmierName?: string; // Nom infirmier

  // Constantes vitales
  temperature: number; // °C, ex: 36.5
  systolic?: number; // Tension systolique (alt: systolicBP)
  systolicBP?: number; // Tension systolique
  diastolic?: number; // Tension diastolique (alt: diastolicBP)
  diastolicBP?: number; // Tension diastolique
  pulse: number; // Pouls en bpm
  weight: number; // Poids en kg
  height: number; // Taille en cm
  spO2?: number; // Saturation en O2 (%), optionnel
  respiratoryRate?: number; // Fréquence respiratoire
  imc?: number; // IMC calculé (poids/(hauteur*hauteur))
  bmi?: number; // BMI (alt name from backend)

  // Notes
  complaint: string; // Motif de consultation
  notes?: string; // Notes supplémentaires

  // Triage
  urgencyLevel: UrgencyLevel;
  status: TriageStatus;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTriageDto {
  patientId: string;
  temperature: number;
  systolicBP: number;
  diastolicBP: number;
  pulse: number;
  weight: number;
  height: number;
  spO2?: number | null;
  complaint: string;
  notes?: string | null;
  urgencyLevel: UrgencyLevel;
}

export interface TriageDraft {
  patientId: string;
  patientNumber?: string;
  patientName?: string;
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  pulse?: number;
  weight?: number;
  height?: number;
  spO2?: number;
  complaint?: string;
  notes?: string;
  urgencyLevel?: UrgencyLevel;
  savedAt?: number; // timestamp
}
