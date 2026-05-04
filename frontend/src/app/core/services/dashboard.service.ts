import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  obtener(idEmpresa?: number | null): Observable<DashboardResponse> {
    let params = new HttpParams();

    if (idEmpresa != null) {
      params = params.set('idEmpresa', idEmpresa);
    }

    return this.http.get<DashboardResponse>(this.apiUrl, { params });
  }
}