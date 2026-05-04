export interface DashboardResumen {
  totalEvaluaciones: number;
  totalFinalizadas: number;
  totalEnElaboracion: number;
  promedioGeneral?: number | null;
}

export interface DashboardEmpresa {
  idEmpresa: number;
  empresa: string;
  totalEvaluaciones: number;
  totalFinalizadas: number;
  totalEnElaboracion: number;
  promedioEmpresa?: number | null;
}

export interface DashboardArea {
  idArea: number;
  empresa?: string | null;
  area: string;
  totalEvaluaciones: number;
  totalFinalizadas: number;
  totalEnElaboracion: number;
  promedioArea?: number | null;
}

export interface DashboardUltimaEvaluacion {
  idEvaluacion: number;
  fechaEvaluacion: string;
  empresa?: string | null;
  nombresEmpleado: string;
  apellidosEmpleado: string;
  area: string;
  cargo: string;
  estado: string;
  calificacionTotal?: number | null;
}

export interface DashboardResponse {
  resumen: DashboardResumen;
  resumenPorEmpresa: DashboardEmpresa[];
  resumenPorArea: DashboardArea[];
  ultimasEvaluaciones: DashboardUltimaEvaluacion[];
}