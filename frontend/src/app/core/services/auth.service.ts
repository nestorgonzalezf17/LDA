import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { UsuarioMe } from '../models/usuario-me.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly tokenKey = 'edd_token';
  private readonly userKey = 'edd_user';
  private readonly mustChangePasswordKey = 'edd_debe_cambiar_clave';

  private readonly currentUserSubject = new BehaviorSubject<UsuarioMe | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(
          this.mustChangePasswordKey,
          response.debeCambiarClave ? 'true' : 'false'
        );

        const user: UsuarioMe = {
        idUsuario: response.idUsuario,
        login: response.login,
        nombreCompleto: response.nombreCompleto,
        correo: response.correo ?? undefined,
        rolModulo: response.rolModulo?.toUpperCase() ?? ''
      };

        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  me(): Observable<UsuarioMe | null> {
    return this.http.get<UsuarioMe>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        if (user) {
          user.rolModulo = user.rolModulo?.toUpperCase() ?? '';
        }

        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      map((user) => user),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  cambiarPassword(nuevaClave: string): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/cambiar-password`, {
      nuevaClave: nuevaClave.trim()
    }).pipe(
      tap(() => {
        localStorage.setItem(this.mustChangePasswordKey, 'false');
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.mustChangePasswordKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): UsuarioMe | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  mustChangePassword(): boolean {
    return localStorage.getItem(this.mustChangePasswordKey) === 'true';
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const userRole = user.rolModulo?.toUpperCase();

    return roles.map(r => r.toUpperCase()).includes(userRole);
  }

  private getStoredUser(): UsuarioMe | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;

    try {
      const user = JSON.parse(raw) as UsuarioMe;
      user.rolModulo = user.rolModulo?.toUpperCase() ?? '';
      return user;
    } catch {
      return null;
    }
  }
}