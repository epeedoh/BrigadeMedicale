import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  Consultation,
  ConsultationStatus,
  CreateConsultationDto,
  UpdateConsultationDto,
  CloseConsultationDto
} from '../../shared/models/consultation.model';
import {
  Prescription,
  CreatePrescriptionDto
} from '../../shared/models/prescription.model';
import {
  LabTest,
  CreateLabTestDto
} from '../../shared/models/lab-test.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationApiService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/consultations`;
  }

  getConsultations(
    status?: ConsultationStatus,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<Consultation>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined) {
      params = params.set('status', status.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<Consultation>>>(this.getApiUrl(), { params });
  }

  getConsultationById(id: string): Observable<ApiResponse<Consultation>> {
    return this.http.get<ApiResponse<Consultation>>(`${this.getApiUrl()}/${id}`);
  }

  getPatientConsultations(patientId: string): Observable<ApiResponse<Consultation[]>> {
    return this.http.get<ApiResponse<Consultation[]>>(`${this.getApiUrl()}/patient/${patientId}`);
  }

  getMyConsultations(
    status?: ConsultationStatus,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<Consultation>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined) {
      params = params.set('status', status.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<Consultation>>>(`${this.getApiUrl()}/my-consultations`, { params });
  }

  createConsultation(consultation: CreateConsultationDto): Observable<ApiResponse<Consultation>> {
    return this.http.post<ApiResponse<Consultation>>(this.getApiUrl(), consultation);
  }

  updateConsultation(id: string, consultation: UpdateConsultationDto): Observable<ApiResponse<Consultation>> {
    return this.http.put<ApiResponse<Consultation>>(`${this.getApiUrl()}/${id}`, consultation);
  }

  closeConsultation(id: string, dto: CloseConsultationDto): Observable<ApiResponse<Consultation>> {
    return this.http.post<ApiResponse<Consultation>>(`${this.getApiUrl()}/${id}/close`, dto);
  }

  cancelConsultation(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.getApiUrl()}/${id}/cancel`, {});
  }

  // Prescriptions within consultation
  addPrescription(consultationId: string, prescription: CreatePrescriptionDto): Observable<ApiResponse<Prescription>> {
    return this.http.post<ApiResponse<Prescription>>(`${this.getApiUrl()}/${consultationId}/prescriptions`, prescription);
  }

  getConsultationPrescriptions(consultationId: string): Observable<ApiResponse<Prescription[]>> {
    return this.http.get<ApiResponse<Prescription[]>>(`${this.getApiUrl()}/${consultationId}/prescriptions`);
  }

  // Lab tests within consultation
  requestLabTest(consultationId: string, labTest: CreateLabTestDto): Observable<ApiResponse<LabTest>> {
    return this.http.post<ApiResponse<LabTest>>(`${this.getApiUrl()}/${consultationId}/lab-tests`, labTest);
  }

  getConsultationLabTests(consultationId: string): Observable<ApiResponse<LabTest[]>> {
    return this.http.get<ApiResponse<LabTest[]>>(`${this.getApiUrl()}/${consultationId}/lab-tests`);
  }
}
