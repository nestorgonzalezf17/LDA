import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsuarioModulo } from '../models/usuario-modulo.model';
import { UsuarioCreate } from '../models/usuario-create.model';

export interface UsuarioRolPayload {
  rolModulo: 'ADMIN' | 'EVALUADOR';
  activo?: boolean;
}

export interface ResetPasswordPayload {
  nuevaClave: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosModuloService {
  private readonly http = inject(HttpClient);
  private readonly apiUsuariosAdminUrl = `${environment.apiUrl}/usuariosadmin`;

  listarUsuariosModulo(): Observable<UsuarioModulo[]> {
    return this.http.get<UsuarioModulo[]>(this.apiUsuariosAdminUrl);
  }

  crear(payload: UsuarioCreate): Observable<{ mensaje: string; idUsuario: number }> {
    return this.http.post<{ mensaje: string; idUsuario: number }>(
      this.apiUsuariosAdminUrl,
      payload
    );
  }

  actualizarRol(idUsuario: number, payload: UsuarioRolPayload): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.apiUsuariosAdminUrl}/${idUsuario}/roles`,
      payload
    );
  }

  resetPassword(idUsuario: number, payload: ResetPasswordPayload): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(
      `${this.apiUsuariosAdminUrl}/${idUsuario}/reset-password`,
      payload
    );
  }

  cambiarEstado(idUsuario: number, activo: boolean): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(
      `${this.apiUsuariosAdminUrl}/${idUsuario}/estado`,
      activo
    );
  }
}