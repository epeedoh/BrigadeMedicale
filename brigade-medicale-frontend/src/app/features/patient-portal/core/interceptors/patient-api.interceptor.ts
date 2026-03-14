import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PatientTokenService } from '../services/patient-token.service';

/**
 * Intercepteur pour ajouter le header X-Patient-Token aux requêtes patient
 * Ne s'applique qu'aux endpoints /api/patient/*
 * N'impacte pas les appels staff protégés par JWT
 */
export const patientApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const patientTokenService = inject(PatientTokenService);

  // Ne traiter que les requêtes vers /api/patient/
  // Les endpoints publics (/api/public/patients/*) n'ont pas besoin de token
  if (!req.url.includes('/api/patient/')) {
    return next(req);
  }

  const token = patientTokenService.getToken();

  if (!token) {
    // Pas de token, continuer sans modification
    // Le backend retournera une erreur 401
    return next(req);
  }

  // Cloner la requête et ajouter le header X-Patient-Token
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Patient-Token': token
    }
  });

  return next(modifiedReq);
};
