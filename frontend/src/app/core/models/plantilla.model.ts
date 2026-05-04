export interface EscalaCalificacion {
  valor: number;
  nombre: string;
  orden: number;
  activo?: boolean;
}

export interface PlantillaCabecera {
  idEmpresa: number;
  empresa: string;
  logoEmpresa?: string | null;

  idArea: number;
  areaODependencia: string;

  idCargo: number;
  cargoEvaluado: string;

  periodoTiempoCalificado: string;
  fecha: string;

  idEvaluadorUsuario: number;
  jefeInmediatoEvaluador: string;

  tituloSistema: string;
  tituloFormato: string;
  codigoFormato: string;
  versionFormato: string;
  fechaFormato: string;
}

export interface PlantillaItem {
  tipoItem: 'BASE' | 'CARGO' | string;
  idItem: number;
  textoItem: string;
  ordenItem: number;

  calificacion?: number | null;
  comentario?: string | null;
}

export interface PlantillaCompetencia {
  idCompetencia: number;
  competencia: string;
  ordenCompetencia: number;
  items: PlantillaItem[];
}

export interface PlantillaSeccion {
  idSeccion: number;
  seccion: string;
  ordenSeccion: number;
  competencias: PlantillaCompetencia[];
}

export interface PlantillaCargoResponse {
  idEmpresa: number;
  idArea: number;
  idCargo: number;
  cabecera: PlantillaCabecera | null;
  secciones: PlantillaSeccion[];
  escala: EscalaCalificacion[];
}