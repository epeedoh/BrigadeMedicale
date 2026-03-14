import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardStats {
  totalPatients: number;
  totalConsultationsToday: number;
  totalPrescriptionsPending: number;
  totalLabTestsPending: number;
}

export interface RecentConsultation {
  id: string;
  patientName: string;
  chiefComplaint: string;
  consultationDate: string;
  status: number;
  doctorName: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentConsultations: RecentConsultation[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/dashboard`;
  }

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.getApiUrl()}/stats`);
  }

  getRecentConsultations(limit: number = 5): Observable<ApiResponse<RecentConsultation[]>> {
    return this.http.get<ApiResponse<RecentConsultation[]>>(`${this.getApiUrl()}/recent-consultations`, {
      params: { limit: limit.toString() }
    });
  }

  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.getApiUrl()}`);
  }
}
