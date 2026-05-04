import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  showPassword = false;

  form = this.fb.group({
    login: ['', [Validators.required]],
    clave: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const sessionExpired = this.route.snapshot.queryParamMap.get('sessionExpired');

    if (sessionExpired === 'true') {
      this.errorMessage = 'Tu sesión expiró. Por favor inicia sesión nuevamente.';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      login: this.form.value.login!.trim(),
      clave: this.form.value.clave!.trim()
    };

    this.authService.login(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.authService.me().subscribe({
            next: () => {
              if (response.debeCambiarClave) {
                this.router.navigate(['/cambiar-password']);
                return;
              }

              this.router.navigate(['/inicio']);
            },
            error: () => {
              if (response.debeCambiarClave) {
                this.router.navigate(['/cambiar-password']);
                return;
              }

              this.router.navigate(['/inicio']);
            }
          });
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.mensaje ||
            error?.error ||
            'No fue posible iniciar sesión.';
        }
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}