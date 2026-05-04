import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.scss'
})
export class CambiarPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group({
    nuevaClave: ['', [Validators.required, Validators.minLength(6)]],
    confirmarClave: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nuevaClave = this.form.value.nuevaClave!.trim();
    const confirmarClave = this.form.value.confirmarClave!.trim();

    if (nuevaClave !== confirmarClave) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.cambiarPassword(nuevaClave)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/inicio']);
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.mensaje ||
            error?.error ||
            'No fue posible actualizar la contraseña.';
        }
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}