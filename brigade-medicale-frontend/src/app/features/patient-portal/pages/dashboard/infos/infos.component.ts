import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientPortalService } from '../../../core/services/patient-portal.service';
import { PatientAnnouncement } from '../../../../../shared/models/patient.model';

@Component({
  selector: 'app-infos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900">Informations</h1>
        <p class="text-lg text-gray-500 mt-2">Actualités et conseils santé</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Announcements List -->
      <div *ngIf="!loading" class="space-y-4">
        <div *ngFor="let announcement of announcements"
             class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Announcement Header -->
          <div [class]="getHeaderClass(announcement.type)" class="p-4 sm:p-5">
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div [class]="getIconBgClass(announcement.type)"
                   class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span [innerHTML]="getIcon(announcement.type)"></span>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span [class]="getBadgeClass(announcement.type)" class="px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ getTypeLabel(announcement.type) }}
                  </span>
                </div>
                <h3 class="font-semibold text-gray-900 text-sm sm:text-base">{{ announcement.title }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(announcement.publishedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="px-4 sm:px-5 pb-4 sm:pb-5">
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{{ announcement.content }}</p>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="announcements.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="mt-4 text-gray-600 font-medium">Aucune information</p>
          <p class="mt-1 text-sm text-gray-500">Les actualités et conseils santé apparaîtront ici</p>
        </div>
      </div>

      <!-- Contact Card -->
      <div class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-5 sm:p-6 text-white">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-lg">Besoin d'aide ?</h3>
            <p class="text-teal-100 text-sm mt-1">
              Pour toute question concernant votre santé ou vos rendez-vous, n'hésitez pas à nous contacter ou à vous présenter à l'accueil de la Brigade Médicale.
            </p>
          </div>
        </div>
      </div>

      <!-- Opening Hours -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">Horaires d'ouverture</h3>
        </div>
        <div class="p-4 sm:p-5">
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Lundi - Vendredi</span>
              <span class="text-sm font-medium text-gray-900">8h00 - 17h00</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <span class="text-sm text-gray-600">Samedi</span>
              <span class="text-sm font-medium text-gray-900">8h00 - 12h00</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-600">Dimanche</span>
              <span class="text-sm font-medium text-red-600">Fermé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InfosComponent implements OnInit {
  announcements: PatientAnnouncement[] = [];
  loading = true;

  constructor(private patientPortalService: PatientPortalService) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  private loadAnnouncements(): void {
    this.loading = true;
    this.patientPortalService.getAnnouncements().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.announcements = response.data || [];
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading announcements:', err);
      }
    });
  }

  getHeaderClass(type: string): string {
    switch (type) {
      case 'warning': return 'bg-amber-50';
      case 'health-tip': return 'bg-green-50';
      case 'announcement': return 'bg-blue-50';
      default: return 'bg-gray-50';
    }
  }

  getIconBgClass(type: string): string {
    switch (type) {
      case 'warning': return 'bg-amber-100';
      case 'health-tip': return 'bg-green-100';
      case 'announcement': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'warning': return 'bg-amber-200 text-amber-800';
      case 'health-tip': return 'bg-green-200 text-green-800';
      case 'announcement': return 'bg-blue-200 text-blue-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'warning':
        return '<svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
      case 'health-tip':
        return '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>';
      case 'announcement':
        return '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>';
      default:
        return '<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'warning': return 'Important';
      case 'health-tip': return 'Conseil santé';
      case 'announcement': return 'Annonce';
      default: return 'Information';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
