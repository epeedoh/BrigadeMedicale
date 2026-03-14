import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import {
  LabTest,
  LabTestStatus,
  UpdateLabTestResultsDto,
  LabTestType
} from '../../shared/models/lab-test.model';

@Injectable({
  providedIn: 'root'
})
export class LabTestApiService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/staff/lab-tests`;
  }

  getLabTests(
    status?: LabTestStatus,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<LabTest>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status !== undefined) {
      params = params.set('status', status.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<LabTest>>>(this.getApiUrl(), { params });
  }

  getPendingLabTests(
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<LabTest>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('status', LabTestStatus.Requested.toString());

    return this.http.get<ApiResponse<PaginatedResponse<LabTest>>>(this.getApiUrl(), { params });
  }

  getInProgressLabTests(
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<LabTest>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('status', LabTestStatus.InProgress.toString());

    return this.http.get<ApiResponse<PaginatedResponse<LabTest>>>(this.getApiUrl(), { params });
  }

  getLabTestById(id: string): Observable<ApiResponse<LabTest>> {
    return this.http.get<ApiResponse<LabTest>>(`${this.getApiUrl()}/${id}`);
  }

  startLabTest(id: string): Observable<ApiResponse<LabTest>> {
    return this.http.post<ApiResponse<LabTest>>(`${this.getApiUrl()}/${id}/start`, {});
  }

  updateResults(id: string, dto: UpdateLabTestResultsDto): Observable<ApiResponse<LabTest>> {
    return this.http.put<ApiResponse<LabTest>>(`${this.getApiUrl()}/${id}/results`, dto);
  }

  completeLabTest(id: string, dto: UpdateLabTestResultsDto): Observable<ApiResponse<LabTest>> {
    return this.http.post<ApiResponse<LabTest>>(`${this.getApiUrl()}/${id}/complete`, dto);
  }

  cancelLabTest(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.getApiUrl()}/${id}/cancel`, {});
  }

  getPatientLabTests(patientId: string): Observable<ApiResponse<LabTest[]>> {
    return this.http.get<ApiResponse<LabTest[]>>(`${this.getApiUrl()}/patient/${patientId}`);
  }

  // Lab Test Types
  getLabTestTypes(): Observable<ApiResponse<LabTestType[]>> {
    return this.http.get<ApiResponse<LabTestType[]>>(`${this.getApiUrl()}/types`);
  }
}
