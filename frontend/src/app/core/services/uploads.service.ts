import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArchivoSubidoResponse } from '../models/upload.model';

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/uploads`;

  subirLogoEmpresa(file: File): Observable<ArchivoSubidoResponse> {
    const formData = new FormData();
    formData.append('archivo', file);

    return this.http.post<ArchivoSubidoResponse>(
      `${this.baseUrl}/logo-empresa`,
      formData
    );
  }
}