import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EvaluacionCreatePayload,
  EvaluacionCreateResponse,
  EvaluacionListItem,
  EvaluacionDetalleResponse,
  EvaluacionEdicionResponse,
  EvaluacionRespuestaEdicion,
  EmpleadoNomina
} from '../models/evaluacion.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/evaluaciones`;

  buscarEmpleadoNominaPorCedula(cedula: string): Observable<EmpleadoNomina> {
    return this.http.get<EmpleadoNomina>(
      `${this.baseUrl}/empleado-nomina/${encodeURIComponent(cedula)}`
    );
  }

  crear(dto: EvaluacionCreatePayload): Observable<EvaluacionCreateResponse> {
    return this.http.post<EvaluacionCreateResponse>(this.baseUrl, dto);
  }

  listar(filtros: {
    idEmpresa?: number | null;
    idArea?: number | null;
    idCargo?: number | null;
    cedula?: string | null;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
  }): Observable<EvaluacionListItem[]> {
    let params = new HttpParams();

    if (filtros.idEmpresa != null) params = params.set('idEmpresa', filtros.idEmpresa);
    if (filtros.idArea != null) params = params.set('idArea', filtros.idArea);
    if (filtros.idCargo != null) params = params.set('idCargo', filtros.idCargo);
    if (filtros.cedula) params = params.set('cedula', filtros.cedula);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);

    return this.http.get<EvaluacionListItem[]>(this.baseUrl, { params });
  }

  obtenerDetalle(idEvaluacion: number): Observable<EvaluacionDetalleResponse> {
    return this.http.get<EvaluacionDetalleResponse>(`${this.baseUrl}/${idEvaluacion}`);
  }

  obtenerParaEdicion(idEvaluacion: number): Observable<EvaluacionEdicionResponse> {
    return this.http.get<EvaluacionEdicionResponse>(`${this.baseUrl}/${idEvaluacion}/edicion`);
  }

  guardarRespuestas(
    idEvaluacion: number,
    payload: EvaluacionRespuestaEdicion[] | { respuestas: EvaluacionRespuestaEdicion[] }
  ): Observable<void> {
    const respuestas = Array.isArray(payload) ? payload : payload.respuestas;
    return this.http.put<void>(`${this.baseUrl}/${idEvaluacion}/respuestas`, respuestas);
  }

  finalizar(idEvaluacion: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${idEvaluacion}/finalizar`, {});
  }

  eliminarBorrador(idEvaluacion: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idEvaluacion}`);
  }
}