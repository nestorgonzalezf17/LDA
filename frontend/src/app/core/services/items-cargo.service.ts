import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemCargo, ItemCargoCreateDto } from '../models/item-cargo.model';

@Injectable({ providedIn: 'root' })
export class ItemsCargoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/itemscargo`;

  listarPorCargo(idEmpresa: number, idCargo: number): Observable<ItemCargo[]> {
    const params = new HttpParams()
      .set('idEmpresa', idEmpresa)
      .set('idCargo', idCargo);

    return this.http.get<ItemCargo[]>(this.baseUrl, { params });
  }

  crear(dto: ItemCargoCreateDto): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, dto);
  }

  actualizar(idItemCargo: number, dto: ItemCargoCreateDto): Observable<{ id: number }> {
    return this.http.put<{ id: number }>(`${this.baseUrl}/${idItemCargo}`, dto);
  }

  cambiarEstado(idItemCargo: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${idItemCargo}/estado`, { activo });
  }
}