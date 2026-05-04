import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (authService.mustChangePassword()) {
    return router.createUrlTree(['/cambiar-password']);
  }

  const roles = route.data['roles'] as string[] | undefined;

  if (!roles || roles.length === 0) {
    return true;
  }

  if (authService.hasRole(roles)) {
    return true;
  }

  return router.createUrlTree(['/inicio']);
};