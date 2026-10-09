import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token';
import { SessionService } from '../services/session.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenService.removeToken();
        // Evitar bucle si ya estamos intentando loguearnos
        if (!req.url.includes('/auth/login')) {
          sessionService.triggerExpired();
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
