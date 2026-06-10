import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CatalogoItem {
  id: number;
  titulo: string;
}

export interface EdsCatalogos {
  estadosCiviles: CatalogoItem[];
  escolaridades: CatalogoItem[];
  areas: CatalogoItem[];
  empresas: CatalogoItem[];
  instrumentos: CatalogoItem[];
  anios: number[];
}

@Injectable({
  providedIn: 'root'
})
export class EdsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/eds`;

  obtenerCatalogos(): Observable<EdsCatalogos> {
    return this.http.get<EdsCatalogos>(`${this.baseUrl}/catalogos`);
  }

  obtenerArbol(idInst: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/instrumentos/${idInst}/arbol`);
  }

  verificarCedulaFormularioNomina(cedula: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/formularios/cedula-formulario-nomina/${encodeURIComponent(cedula)}`
    );
  }

  guardarFormulario(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/formularios`, payload);
  }

  obtenerArbolCompleto(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/instrumentos/arbol-completo`);
  }

  guardarRespuestas(idFormulario: number, respuestas: { idItem: number, calificacion: number }[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/respuestas/bulk`, { idFormulario, respuestas });
  }

  obtenerRespuestas(idFormulario: number): Observable<{ idItem: number, calificacion: number }[]> {
    return this.http.get<{ idItem: number, calificacion: number }[]>(`${this.baseUrl}/respuestas/formulario/${idFormulario}`);
  }

  finalizarFormulario(idFormulario: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/formularios/${idFormulario}/finalizar`, {});
  }

  obtenerReportePromedios(filtro: { idAreas: number[], idInst: number | null, anioInicio: number, anioFin: number }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/respuestas/reporte`, filtro);
  }
}
