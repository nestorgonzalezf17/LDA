export interface Cargo {
  idCargo: number;
  idEmpresa: number;
  idArea: number;
  nombre: string;
  codigo?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string | null;
}

export interface CargoSaveDto {
  idEmpresa: number;
  idArea: number;
  nombre: string;
  activo: boolean;
}