import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PatientTokenService } from '../services/patient-token.service';

/**
 * Guard pour protéger les routes du portail patient
 * Vérifie si un token patient est présent
 * Redirige vers /patient/onboarding si non authentifié
 */
export const patientGuard: CanActivateFn = (route, state) => {
  const patientTokenService = inject(PatientTokenService);
  const router = inject(Router);

  if (patientTokenService.hasToken()) {
    return true;
  }

  // Pas de token patient, rediriger vers l'onboarding
  // On peut aussi rediriger vers /patient/login si on préfère
  router.navigate(['/patient/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

/**
 * Guard inverse : redirige vers dashboard si déjà connecté
 * Utilisé pour les pages login/onboarding
 */
export const patientGuestGuard: CanActivateFn = (route, state) => {
  const patientTokenService = inject(PatientTokenService);
  const router = inject(Router);

  if (!patientTokenService.hasToken()) {
    return true;
  }

  // Déjà connecté, rediriger vers le dashboard
  router.navigate(['/patient/dashboard']);
  return false;
};
