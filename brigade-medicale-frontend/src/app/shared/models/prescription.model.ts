export interface Prescription {
  id: string;
  consultationId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantityPrescribed: number;
  quantityDispensed: number;
  status: PrescriptionStatus;
  prescribedBy: string;
  prescribedAt: string;
  dispensedBy?: string;
  dispensedAt?: string;
}

export enum PrescriptionStatus {
  Pending = 0,
  PartiallyDispensed = 1,
  Dispensed = 2,
  Cancelled = 3
}

export interface CreatePrescriptionDto {
  consultationId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantityPrescribed: number;
}

export interface DispensePrescriptionDto {
  quantityToDispense: number;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  form: MedicationForm;
  strength: string;
  unit: string;
  description?: string;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;
  createdAt: string;
}

export enum MedicationForm {
  Tablet = 0,
  Capsule = 1,
  Syrup = 2,
  Injection = 3,
  Cream = 4,
  Ointment = 5,
  Drops = 6,
  Inhaler = 7,
  Suppository = 8,
  Other = 9
}

export interface CreateMedicationDto {
  name: string;
  genericName?: string;
  form: MedicationForm;
  strength: string;
  unit: string;
  description?: string;
  minimumStock: number;
}

export interface StockMovement {
  id: string;
  medicationId: string;
  medicationName: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  batchNumber?: string;
  expirationDate?: string;
  performedBy: string;
  performedAt: string;
}

export enum StockMovementType {
  Entry = 0,
  Exit = 1,
  Adjustment = 2,
  Loss = 3
}

export interface CreateStockMovementDto {
  medicationId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  batchNumber?: string;
  expirationDate?: string;
}
