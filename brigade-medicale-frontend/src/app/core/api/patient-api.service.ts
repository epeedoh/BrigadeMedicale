import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Patient, CreatePatientDto, UpdatePatientDto } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientApiService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/patients`;
  }

  getPatients(
    search?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<ApiResponse<PaginatedResponse<Patient>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Patient>>>(this.getApiUrl(), { params });
  }

  getPatientById(id: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.getApiUrl()}/${id}`);
  }

  getPatientByNumber(patientNumber: string): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.getApiUrl()}/by-number/${patientNumber}`);
  }

  createPatient(patient: CreatePatientDto): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(this.getApiUrl(), patient);
  }

  updatePatient(id: string, patient: UpdatePatientDto): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(`${this.getApiUrl()}/${id}`, patient);
  }

  deactivatePatient(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.getApiUrl()}/${id}`);
  }

  searchPatients(query: string): Observable<ApiResponse<Patient[]>> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<Patient[]>>(`${this.getApiUrl()}/search`, { params });
  }
}
