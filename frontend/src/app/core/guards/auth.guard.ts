import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const isChangingPasswordRoute = state.url.startsWith('/cambiar-password');

  if (authService.mustChangePassword() && !isChangingPasswordRoute) {
    return router.createUrlTree(['/cambiar-password']);
  }

  return true;
};