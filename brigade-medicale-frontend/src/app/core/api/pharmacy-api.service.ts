import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  Prescription,
  PrescriptionStatus,
  DispensePrescriptionDto,
  Medication,
  CreateMedicationDto,
  StockMovement,
  CreateStockMovementDto
} from '../../shared/models/prescription.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyApiService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/staff/pharmacy`;
  }

  // Prescriptions
  getPendingPrescriptions(
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<Prescription>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('status', PrescriptionStatus.Pending.toString());

    return this.http.get<ApiResponse<PaginatedResponse<Prescription>>>(`${this.getApiUrl()}/prescriptions`, { params });
  }

  getAllPrescriptions(
    status?: PrescriptionStatus,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<Prescription>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined) {
      params = params.set('status', status.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<Prescription>>>(`${this.getApiUrl()}/prescriptions`, { params });
  }

  dispensePrescription(id: string, dto: DispensePrescriptionDto): Observable<ApiResponse<Prescription>> {
    return this.http.post<ApiResponse<Prescription>>(`${this.getApiUrl()}/prescriptions/${id}/dispense`, dto);
  }

  // Medications
  getMedications(
    search?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<Medication>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Medication>>>(`${this.getApiUrl()}/medications`, { params });
  }

  getMedicationById(id: string): Observable<ApiResponse<Medication>> {
    return this.http.get<ApiResponse<Medication>>(`${this.getApiUrl()}/medications/${id}`);
  }

  createMedication(medication: CreateMedicationDto): Observable<ApiResponse<Medication>> {
    return this.http.post<ApiResponse<Medication>>(`${this.getApiUrl()}/medications`, medication);
  }

  updateMedication(id: string, medication: Partial<CreateMedicationDto>): Observable<ApiResponse<Medication>> {
    return this.http.put<ApiResponse<Medication>>(`${this.getApiUrl()}/medications/${id}`, medication);
  }

  searchMedications(query: string): Observable<ApiResponse<Medication[]>> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<Medication[]>>(`${this.getApiUrl()}/medications/search`, { params });
  }

  getLowStockMedications(): Observable<ApiResponse<Medication[]>> {
    return this.http.get<ApiResponse<Medication[]>>(`${this.getApiUrl()}/medications/low-stock`);
  }

  // Stock Movements
  addStockMovement(dto: CreateStockMovementDto): Observable<ApiResponse<StockMovement>> {
    return this.http.post<ApiResponse<StockMovement>>(`${this.getApiUrl()}/stock-movements`, dto);
  }

  getMedicationStockHistory(
    medicationId: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<StockMovement>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResponse<StockMovement>>>(
      `${this.getApiUrl()}/medications/${medicationId}/stock-history`,
      { params }
    );
  }

  getCurrentStock(medicationId: string): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.getApiUrl()}/medications/${medicationId}/current-stock`);
  }
}
