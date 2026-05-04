import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cargo, CargoSaveDto } from '../models/cargo.model';

@Injectable({ providedIn: 'root' })
export class CargosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cargos`;

  listarPorArea(idEmpresa: number, idArea: number): Observable<Cargo[]> {
    const params = new HttpParams()
      .set('idEmpresa', idEmpresa)
      .set('idArea', idArea);

    return this.http.get<Cargo[]>(this.baseUrl, { params });
  }

  crear(dto: CargoSaveDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, dto);
  }

  actualizar(idCargo: number, dto: CargoSaveDto): Observable<{ id: number }> {
    return this.http.put<{ id: number }>(`${this.baseUrl}/${idCargo}`, dto);
  }

  cambiarEstado(idCargo: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${idCargo}/estado`, { activo });
  }
}