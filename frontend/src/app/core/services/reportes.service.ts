import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReporteAreaItem } from '../models/reporte.model';
import { ReporteEmpleadoResponse } from '../models/reporte-empleado.model';

export interface EmpleadoBusquedaItem {
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  obtenerPorArea(esAdmin: boolean, idEmpresa?: number | null): Observable<any[]> {
    let params = new HttpParams().set('esAdmin', esAdmin);

    if (idEmpresa != null) {
      params = params.set('idEmpresa', idEmpresa);
    }

    return this.http.get<any[]>(`${this.baseUrl}/areas`, { params });
  }

  buscarEmpleados(texto: string, idEmpresa?: number | null): Observable<any[]> {
    let params = new HttpParams().set('texto', texto);

    if (idEmpresa != null) {
      params = params.set('idEmpresa', idEmpresa);
    }

    return this.http.get<any[]>(`${this.baseUrl}/empleados/buscar`, { params });
  }

  obtenerPorEmpleado(cedula: string, idEmpresa?: number | null): Observable<any> {
    let params = new HttpParams().set('cedula', cedula);

    if (idEmpresa != null) {
      params = params.set('idEmpresa', idEmpresa);
    }

    return this.http.get<any>(`${this.baseUrl}/empleados/detalle`, { params });
  }
}