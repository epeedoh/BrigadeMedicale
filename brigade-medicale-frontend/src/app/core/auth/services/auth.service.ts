import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { LoginDto, RefreshTokenDto } from '../models/login.model';
import { TokenResponseDto } from '../models/token-response.model';
import { UserInfoDto } from '../models/user.model';
import { ApiResponse } from '../../models/api-response.model';
import { ConfigService } from '../../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfoDto | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router,
    private configService: ConfigService
  ) {
    this.initializeCurrentUser();
  }

  private getAuthUrl(): string {
    return `${this.configService.getApiUrl()}/auth`;
  }

  private initializeCurrentUser(): void {
    const token = this.tokenService.getAccessToken();
    if (token && !this.tokenService.isTokenExpired()) {
      // In a real app, you might want to validate the token with backend
      const userId = this.tokenService.getUserId();
      const roles = this.tokenService.getUserRoles();

      if (userId && roles.length > 0) {
        // Create a minimal user object from token
        // In production, you might fetch full user details from API
        const user: UserInfoDto = {
          id: userId,
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          roles: roles
        };
        this.currentUserSubject.next(user);
      }
    }
  }

  login(username: string, password: string): Observable<ApiResponse<TokenResponseDto>> {
    const loginDto: LoginDto = { username, password };

    return this.http.post<ApiResponse<TokenResponseDto>>(`${this.getAuthUrl()}/login`, loginDto).pipe(
      tap(response => {
        if (response.success && response.data) {
          const tokenResponse = response.data;
          this.tokenService.setTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
          this.currentUserSubject.next(tokenResponse.user);
        }
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.getAuthUrl()}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.clearTokens();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  refreshToken(): Observable<ApiResponse<TokenResponseDto>> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshDto: RefreshTokenDto = { refreshToken };

    return this.http.post<ApiResponse<TokenResponseDto>>(`${this.getAuthUrl()}/refresh`, refreshDto).pipe(
      tap(response => {
        if (response.success && response.data) {
          const tokenResponse = response.data;
          this.tokenService.setTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
          this.currentUserSubject.next(tokenResponse.user);
        }
      })
    );
  }

  getCurrentUser(): Observable<UserInfoDto | null> {
    return this.currentUser$;
  }

  isAuthenticated(): boolean {
    return this.tokenService.getAccessToken() !== null && !this.tokenService.isTokenExpired();
  }

  hasRole(roles: string[]): boolean {
    return this.tokenService.hasRole(roles);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.tokenService.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }
}
