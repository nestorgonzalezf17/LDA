import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Area, AreaSaveDto } from '../models/area.model';

@Injectable({ providedIn: 'root' })
export class AreasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/areas`;

  listar(idEmpresa?: number | null): Observable<Area[]> {
    let params = new HttpParams();

    if (idEmpresa != null) {
      params = params.set('idEmpresa', idEmpresa);
    }

    return this.http.get<Area[]>(this.baseUrl, { params });
  }

  crear(dto: AreaSaveDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, dto);
  }

  actualizar(idArea: number, dto: AreaSaveDto): Observable<{ id: number }> {
    return this.http.put<{ id: number }>(`${this.baseUrl}/${idArea}`, dto);
  }

  cambiarEstado(idArea: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${idArea}/estado`, { activo });
  }
}