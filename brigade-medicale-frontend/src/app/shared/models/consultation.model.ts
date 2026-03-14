export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  doctorId: string;
  doctorName: string;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  physicalExamination?: string;
  vitalSigns?: VitalSigns;
  diagnosis?: string;
  differentialDiagnosis?: string;
  treatment?: string;
  notes?: string;
  status: ConsultationStatus;
  consultationDate: string;
  closedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

export enum ConsultationStatus {
  InProgress = 0,
  Completed = 1,
  Cancelled = 2
}

export interface CreateConsultationDto {
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  physicalExamination?: string;
  vitalSigns?: VitalSigns;
  diagnosis?: string;
  differentialDiagnosis?: string;
  treatment?: string;
  notes?: string;
}

export interface UpdateConsultationDto {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  physicalExamination?: string;
  vitalSigns?: VitalSigns;
  diagnosis?: string;
  differentialDiagnosis?: string;
  treatment?: string;
  notes?: string;
}

export interface CloseConsultationDto {
  finalDiagnosis: string;
  treatmentSummary?: string;
}
