import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { PatientApiService } from '../../../core/api/patient-api.service';
import { Patient, Gender } from '../../../shared/models/patient.model';
import { PaginationInfo } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Page Header -->
      <div class="card-medical mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Gestion des patients</h1>
              <p class="text-gray-500">Dossiers médicaux et informations des patients</p>
            </div>
          </div>
          <a routerLink="/patients/create" class="btn btn-primary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Nouveau patient
          </a>
        </div>
      </div>

      <!-- Search Section -->
      <div class="card mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Rechercher par nom, téléphone ou numéro patient..."
              class="input pl-12"
            />
          </div>
          <button (click)="loadPatients()" class="btn btn-secondary">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ pagination?.totalItems || patients.length }}</p>
            <p class="text-sm text-gray-500">Total patients</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getActiveCount() }}</p>
            <p class="text-sm text-gray-500">Patients actifs</p>
          </div>
        </div>

        <div class="card flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ getRecentCount() }}</p>
            <p class="text-sm text-gray-500">Ajoutés ce mois</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="spinner w-12 h-12 mb-4"></div>
          <p class="text-gray-500">Chargement des patients...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="card border-l-4 border-red-500 mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-red-800">Erreur de chargement</h3>
            <p class="text-red-600 text-sm mt-1">{{ error }}</p>
          </div>
          <button (click)="loadPatients()" class="btn btn-secondary">Réessayer</button>
        </div>
      </div>

      <!-- Patients Table -->
      <div *ngIf="!loading && !error" class="card">
        <div class="overflow-x-auto">
          <table class="table-medical">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Contact</th>
                <th>Âge / Genre</th>
                <th>Groupe sanguin</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let patient of patients"
                  class="cursor-pointer"
                  [routerLink]="['/patients', patient.id]">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-semibold text-teal-700">
                        {{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ patient.lastName }} {{ patient.firstName }}</p>
                      <p class="text-sm text-teal-600 font-mono">{{ patient.patientNumber }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span class="text-gray-600">{{ patient.phoneNumber }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <span class="text-gray-900 font-medium">{{ patient.age }} ans</span>
                    <span class="text-gray-400">•</span>
                    <span [class]="patient.gender === Gender.Male ? 'text-blue-600' : patient.gender === Gender.Female ? 'text-pink-600' : 'text-gray-600'">
                      {{ getGenderLabel(patient.gender) }}
                    </span>
                  </div>
                </td>
                <td>
                  <span *ngIf="patient.bloodType" class="badge badge-danger">
                    {{ patient.bloodType }}
                  </span>
                  <span *ngIf="!patient.bloodType" class="text-gray-400 text-sm">Non renseigné</span>
                </td>
                <td>
                  <span [class]="patient.isActive ? 'badge badge-success' : 'badge badge-danger'">
                    <span class="w-2 h-2 rounded-full mr-1" [class]="patient.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                    {{ patient.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="text-right">
                  <a [routerLink]="['/patients', patient.id]"
                     (click)="$event.stopPropagation()"
                     class="btn btn-sm btn-secondary">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Voir
                  </a>
                </td>
              </tr>
              <tr *ngIf="patients?.length === 0">
                <td colspan="6">
                  <div class="empty-state">
                    <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <p class="empty-state-title">Aucun patient trouvé</p>
                    <p class="empty-state-text">Commencez par ajouter votre premier patient</p>
                    <a routerLink="/patients/create" class="btn btn-primary mt-4">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      Nouveau patient
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="pagination && pagination.totalPages > 1" class="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
          <p class="text-sm text-gray-600">
            Affichage de
            <span class="font-medium">{{ (pagination.currentPage - 1) * pagination.pageSize + 1 }}</span>
            à
            <span class="font-medium">{{ Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems) }}</span>
            sur
            <span class="font-medium">{{ pagination.totalItems }}</span>
            patients
          </p>
          <div class="flex items-center gap-2">
            <button (click)="goToPage(pagination.currentPage - 1)"
                    [disabled]="!pagination.hasPreviousPage"
                    class="btn btn-secondary btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Précédent
            </button>
            <span class="px-4 py-2 text-sm font-medium text-gray-700">
              {{ pagination.currentPage }} / {{ pagination.totalPages }}
            </span>
            <button (click)="goToPage(pagination.currentPage + 1)"
                    [disabled]="!pagination.hasNextPage"
                    class="btn btn-secondary btn-sm">
              Suivant
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PatientListComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  pagination: PaginationInfo | null = null;
  searchQuery = '';
  loading = false;
  error = '';
  Math = Math;
  Gender = Gender;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private patientApiService: PatientApiService) {}

  ngOnInit(): void {
    this.loadPatients();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadPatients();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPatients(page: number = 1): void {
    this.loading = true;
    this.error = '';

    this.patientApiService.getPatients(this.searchQuery, page, 20).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            this.patients = response.data;
            this.pagination = null;
          } else {
            this.patients = response.data.items || [];
            this.pagination = response.data.pagination || null;
          }
        } else {
          this.patients = [];
          this.error = response.message || 'Erreur lors du chargement des patients';
        }
        this.loading = false;
      },
      error: (err) => {
        this.patients = [];
        this.error = err.error?.message || 'Erreur lors du chargement des patients';
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  goToPage(page: number): void {
    if (page >= 1 && this.pagination && page <= this.pagination.totalPages) {
      this.loadPatients(page);
    }
  }

  getGenderLabel(gender: Gender): string {
    switch (gender) {
      case Gender.Male: return 'Homme';
      case Gender.Female: return 'Femme';
      case Gender.Other: return 'Autre';
      default: return 'Non spécifié';
    }
  }

  getActiveCount(): number {
    return this.patients.filter(p => p.isActive).length;
  }

  getRecentCount(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.patients.filter(p => new Date(p.createdAt) >= startOfMonth).length;
  }
}
