import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - Try to refresh token
        const isRefreshEndpoint = req.url.includes('/auth/refresh');

        if (!isRefreshEndpoint) {
          // Attempt to refresh token
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry original request with new token
              return next(req);
            }),
            catchError((refreshError) => {
              // Refresh failed, redirect to login
              authService.logout().subscribe();
              return throwError(() => refreshError);
            })
          );
        } else {
          // Refresh endpoint failed, redirect to login
          authService.logout().subscribe();
        }
      }

      if (error.status === 403) {
        // Forbidden - Insufficient permissions
        router.navigate(['/unauthorized']);
      }

      if (error.status === 500) {
        // Server error
        console.error('Server error:', error);
        // You could show a toast notification here
      }

      return throwError(() => error);
    })
  );
};
