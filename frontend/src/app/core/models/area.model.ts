export interface Area {
  idArea: number;
  idEmpresa: number;
  empresa: string;
  nombre: string;
  codigo?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string | null;
}

export interface AreaSaveDto {
  idEmpresa: number;
  nombre: string;
  activo: boolean;
}