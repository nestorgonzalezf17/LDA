import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlantillaCargoResponse } from '../models/plantilla.model';

@Injectable({ providedIn: 'root' })
export class PlantillaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/plantilla`;

  obtener(idEmpresa: number, idArea: number, idCargo: number): Observable<PlantillaCargoResponse> {
    const params = new HttpParams()
      .set('idEmpresa', idEmpresa)
      .set('idArea', idArea)
      .set('idCargo', idCargo);

    return this.http.get<PlantillaCargoResponse>(this.baseUrl, { params });
  }

  obtenerPorCargo(idEmpresa: number, idArea?: number, idCargo?: number): Observable<PlantillaCargoResponse> {
    if (idArea == null || idCargo == null) {
      return throwError(() => new Error('Ahora la plantilla requiere idEmpresa, idArea e idCargo.'));
    }

    return this.obtener(idEmpresa, idArea, idCargo);
  }
}