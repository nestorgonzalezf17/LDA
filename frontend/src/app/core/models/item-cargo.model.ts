export interface ItemCargo {
  idItemCargo: number;
  idEmpresa: number;
  idCargo: number;
  idCompetencia: number;
  competencia: string;
  textoItem: string;
  orden: number;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string | null;
}

export interface ItemCargoCreateDto {
  idEmpresa: number;
  idCargo: number;
  idCompetencia: number;
  textoItem: string;
  orden?: number | null;
}