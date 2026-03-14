import { InjectionToken } from '@angular/core';

/**
 * Token pour injecter l'URL de base de l'API
 * Chargée dynamiquement depuis assets/config.json
 */
export const API_URL = new InjectionToken<string>('api-url');

/**
 * Token pour injecter le token key du localStorage
 */
export const TOKEN_KEY = new InjectionToken<string>('token-key');

/**
 * Token pour injecter le refresh token key du localStorage
 */
export const REFRESH_TOKEN_KEY = new InjectionToken<string>('refresh-token-key');
