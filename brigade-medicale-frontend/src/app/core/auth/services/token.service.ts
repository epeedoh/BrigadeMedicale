import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ConfigService } from '../../services/config.service';

interface JwtPayload {
  sub: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string | string[];
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private configService: ConfigService) {}

  private getTokenKey(): string {
    try {
      return this.configService.getTokenKey();
    } catch {
      // Fallback to default key if config not loaded yet
      return 'brigade_access_token';
    }
  }

  private getRefreshTokenKey(): string {
    try {
      return this.configService.getRefreshTokenKey();
    } catch {
      // Fallback to default key if config not loaded yet
      return 'brigade_refresh_token';
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(this.getTokenKey(), accessToken);
    sessionStorage.setItem(this.getRefreshTokenKey(), refreshToken);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.getTokenKey());
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.getRefreshTokenKey());
  }

  clearTokens(): void {
    sessionStorage.removeItem(this.getTokenKey());
    sessionStorage.removeItem(this.getRefreshTokenKey());
  }

  getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserRoles(): string[] {
    const token = this.getAccessToken();
    if (!token) {
      return [];
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (Array.isArray(roles)) {
        return roles;
      } else if (typeof roles === 'string') {
        return [roles];
      }
      return [];
    } catch (error) {
      console.error('Error decoding token:', error);
      return [];
    }
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const expirationDate = new Date(decoded.exp * 1000);
      const now = new Date();

      // Add 30 second buffer to consider token expired slightly before actual expiration
      return expirationDate.getTime() - now.getTime() < 30000;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  hasRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.some(role => userRoles.includes(role));
  }
}
