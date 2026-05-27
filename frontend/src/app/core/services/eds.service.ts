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
}
