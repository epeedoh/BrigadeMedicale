export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  phoneNumber: string;
  address?: string;
  city?: string;
  sector?: string;
  isFromChurch?: boolean;
  churchSector?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  address?: string;
  city?: string;
  sector?: string;
  isFromChurch?: boolean;
  churchSector?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
}

export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phoneNumber?: string;
  address?: string;
  city?: string;
  sector?: string;
  isFromChurch?: boolean;
  churchSector?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
}

// DTOs pour l'enrôlement patient (auto-inscription)
export interface PatientRegisterDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  address?: string;
  city?: string;
  sector?: string;
  isFromChurch: boolean;
  churchSector?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
}

export interface PatientRegisterResponse {
  patientNumber: string;
  accessToken: string;
  qrCodeDataUrl: string;
}

// Modèle pour le profil patient (lecture seule côté portail)
export interface PatientProfile {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  phoneNumber: string;
  address?: string;
  city?: string;
  sector?: string;
  isFromChurch?: boolean;
  churchSector?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  createdAt: string;
}

// Modèle pour une visite (passage à la clinique)
export interface PatientVisit {
  id: string;
  visitDate: string;
  reason?: string;
  consultationId?: string;
  hasConsultation: boolean;
  hasLabTests: boolean;
  hasPrescriptions: boolean;
}

// Modèle simplifié de consultation pour le portail patient
export interface PatientConsultation {
  id: string;
  consultationDate: string;
  doctorName: string;
  chiefComplaint: string;
  diagnosis?: string;
  treatment?: string;
  status: number; // 0: InProgress, 1: Completed, 2: Cancelled
  notes?: string;
}

// Modèle simplifié d'analyse labo pour le portail patient
export interface PatientLabTest {
  id: string;
  testName: string;
  testType: string;
  requestedAt: string;
  completedAt?: string;
  results?: string;
  normalRange?: string;
  status: number; // 0: Requested, 1: InProgress, 2: Completed, 3: Cancelled
}

// Modèle simplifié de prescription/dispensation pour le portail patient
export interface PatientPrescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  quantityPrescribed: number;
  quantityDispensed: number;
  status: number; // 0: Pending, 1: PartiallyDispensed, 2: Dispensed, 3: Cancelled
  prescribedAt: string;
  dispensedAt?: string;
}

// Modèle pour les annonces/infos
export interface PatientAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'health-tip' | 'announcement';
  publishedAt: string;
  expiresAt?: string;
}
