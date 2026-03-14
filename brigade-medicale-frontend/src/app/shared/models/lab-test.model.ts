export interface LabTest {
  id: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  testType: string;
  testName: string;
  instructions?: string;
  results?: string;
  normalRange?: string;
  status: LabTestStatus;
  requestedBy: string;
  requestedAt: string;
  performedBy?: string;
  performedAt?: string;
  completedAt?: string;
}

export enum LabTestStatus {
  Requested = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3
}

export interface CreateLabTestDto {
  consultationId: string;
  testType: string;
  testName: string;
  instructions?: string;
}

export interface UpdateLabTestResultsDto {
  results: string;
  normalRange?: string;
}

export interface LabTestType {
  id: string;
  name: string;
  category: string;
  description?: string;
  normalRange?: string;
  isActive: boolean;
}
