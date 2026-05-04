import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  hasRole(roles: string[]): boolean {
    return this.authService.hasRole(roles);
  }
}