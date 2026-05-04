export interface Empresa {
  idEmpresa: number;
  nombre: string;
  codigo?: string | null;
  logoUrl?: string | null;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string | null;
}

export interface EmpresaSaveDto {
  nombre: string;
  logoUrl?: string | null;
  activo: boolean;
}