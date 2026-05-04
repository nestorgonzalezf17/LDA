import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CargaMasivaPreviewResponse,
  CargaMasivaResultado
} from '../models/carga-masiva.model';

@Injectable({
  providedIn: 'root'
})
export class CargaMasivaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/carga-masiva`;

  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/plantilla`, {
      responseType: 'blob'
    });
  }

  preview(archivo: File): Observable<CargaMasivaPreviewResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post<CargaMasivaPreviewResponse>(
      `${this.baseUrl}/preview`,
      formData
    );
  }

  importar(archivo: File): Observable<CargaMasivaResultado> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    return this.http.post<CargaMasivaResultado>(
      `${this.baseUrl}/importar`,
      formData
    );
  }
}