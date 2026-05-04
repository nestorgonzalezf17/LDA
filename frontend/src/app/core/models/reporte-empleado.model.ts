export interface ReporteEmpleadoResumen {
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
  totalEvaluaciones: number;
  totalFinalizadas: number;
  totalEnElaboracion: number;
  promedioCalificacion?: number | null;
}

export interface ReporteEmpleadoEvaluacion {
  idEvaluacion: number;
  fechaEvaluacion: string;
  fechaFinalizacion?: string | null;
  estado: string;
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
  area: string;
  cargo: string;
  evaluador: string;
  calificacionTotal?: number | null;
}

export interface ReporteEmpleadoResponse {
  resumen: ReporteEmpleadoResumen | null;
  evaluaciones: ReporteEmpleadoEvaluacion[];
}