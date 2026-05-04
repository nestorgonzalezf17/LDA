import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa, EmpresaSaveDto } from '../models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/empresas`;

  listar(): Observable<Empresa[]> {
  return this.http.get<Empresa[]>(`${this.baseUrl}/listar`);
}

  crear(dto: EmpresaSaveDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, dto);
  }

  actualizar(idEmpresa: number, dto: EmpresaSaveDto): Observable<{ id: number }> {
    return this.http.put<{ id: number }>(`${this.baseUrl}/${idEmpresa}`, dto);
  }

  cambiarEstado(idEmpresa: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${idEmpresa}/estado`, { activo });
  }
  subirLogo(idEmpresa: number, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post(`${this.baseUrl}/${idEmpresa}/logo`, formData);
  }
}