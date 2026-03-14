import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  tokenKey: string;
  refreshTokenKey: string;
  environment: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Charge la configuration depuis le fichier assets/config.json
   * Appelé UNE SEULE FOIS au démarrage de l'application par APP_INITIALIZER
   *
   * SOURCE UNIQUE DE VÉRITÉ: /assets/config.json
   */
  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const timestamp = new Date().getTime();
      // Build an absolute URL to assets/config.json using the page base href.
      // Using a plain relative path like "assets/config.json" is resolved
      // relative to the current route (e.g. /login/assets/config.json) and
      // will 404 when the app is not at the origin root. We use document.baseURI
      // so the file is resolved correctly when the app is hosted under a
      // sub-path (example: https://host/container/ ).
      const base = document.baseURI || window.location.origin + '/';
      const requestUrl = new URL(`assets/config.json?v=${timestamp}`, base).toString();
      console.log('➡️ Chargement de la configuration depuis', requestUrl);
      this.config = await firstValueFrom(this.http.get<AppConfig>(requestUrl));
      console.log('✅ Configuration chargée depuis /assets/config.json:', this.config);
      return this.config;
    } catch (error) {
      console.warn('⚠️ Impossible de charger /assets/config.json, utilisation du fallback');
      console.warn('Détails:', error);
      // Fallback - permet à l'app de continuer
      this.config = {
        production: false,
        apiUrl: 'https://localhost:7288/api',
        tokenKey: 'brigade_access_token',
        refreshTokenKey: 'brigade_refresh_token',
        environment: 'development'
      };
      console.log('⚠️ Fallback utilisé:', this.config);
      return this.config;
    }
  }

  /**
   * Obtient la configuration chargée
   */
  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration non chargée. Assurez-vous que loadConfig() a été appelé.');
    }
    return this.config;
  }

  /**
   * Obtient l'URL de l'API
   */
  getApiUrl(): string {
    return this.getConfig().apiUrl;
  }

  /**
   * Obtient le token key
   */
  getTokenKey(): string {
    return this.getConfig().tokenKey;
  }

  /**
   * Obtient le refresh token key
   */
  getRefreshTokenKey(): string {
    return this.getConfig().refreshTokenKey;
  }

  /**
   * Vérifie si on est en production
   */
  isProduction(): boolean {
    return this.getConfig().production;
  }
}
