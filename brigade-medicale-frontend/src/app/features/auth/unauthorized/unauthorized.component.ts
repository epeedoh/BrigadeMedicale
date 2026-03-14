import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full mx-4 text-center">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-4">Accès refusé</h1>

          <p class="text-gray-600 mb-8">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              (click)="goBack()"
              class="btn btn-secondary"
            >
              Retour
            </button>

            <a
              routerLink="/dashboard"
              class="btn btn-primary"
            >
              Tableau de bord
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    window.history.back();
  }
}
