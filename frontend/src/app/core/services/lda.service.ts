import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificacionDto {
  idNotificacion: number;
  cedulaEmpleado: string;
  nombreCompletoEmpleado: string;
  placaVehiculoAsignado: string;
  tituloRelacionHecho: string;
  tituloTipoCarga: string;
  operacion?: string;
  fechaHecho: string;
  fechaNotificacion: string;
  registro?: string;
}

export interface NotificacionSaveDto {
  cedulaEmpleado: string;
  nombreCompletoEmpleado: string;
  placaVehiculoAsignado: string;
  idRelacionHecho: number;
  idTipoCarga: number;
  operacion?: string;
  fechaHecho: string;
  registro?: string;
}

export interface TipoCarga {
  idTipoCarga: number;
  tituloTipoCarga: string;
}

export interface RelacionHecho {
  idRelacionHecho: number;
  tituloRel: string;
}

@Injectable({ providedIn: 'root' })
export class LdaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/lda/notificaciones`;

  listar(filtros: any = {}): Observable<NotificacionDto[]> {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) params = params.set(key, filtros[key]);
    });
    return this.http.get<NotificacionDto[]>(this.baseUrl, { params });
  }

  crear(dto: NotificacionSaveDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, dto);
  }

  actualizarRegistro(id: number, registro: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/registro`, registro);
  }

  // Catálogos
  listarTiposCarga(): Observable<TipoCarga[]> {
    return this.http.get<TipoCarga[]>(`${this.baseUrl}/catalogos/tipo-carga`);
  }

  listarRelacionesHecho(): Observable<RelacionHecho[]> {
    return this.http.get<RelacionHecho[]>(`${this.baseUrl}/catalogos/relacion-hecho`);
  }
}
