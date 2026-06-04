export interface EvaluacionCreatePayload {
  idEmpresa: number;
  idArea: number;
  idCargo: number;
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
  periodoEvaluado: string;
  observaciones?: string | null;
}

export interface EvaluacionCreateResponse {
  id: number;
}

export interface EvaluacionListItem {
  idEvaluacion: number;
  idEmpresa: number;
  empresa: string;
  fechaEvaluacion: string;
  fechaFinalizacion?: string | null;
  estado: string;
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
  periodoEvaluado: string;
  area: string;
  cargo: string;
  evaluador: string;
  idEvaluadorUsuario: number;
  calificacionTotal?: number | null;
}

export interface EvaluacionDetalleCabecera {
  idEvaluacion: number;

  idEmpresa: number;
  empresa: string;
  logoEmpresa?: string | null;

  idArea: number;
  areaODependencia: string;

  idCargo: number;
  cargoEvaluado: string;

  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;

  periodoEvaluado: string;
  fecha: string;

  estado: string;
  fechaEvaluacion: string;
  fechaFinalizacion?: string | null;

  jefeInmediatoEvaluador: string;
  idEvaluadorUsuario: number;

  calificacionTotal?: number | null;

  tituloSistema: string;
  tituloFormato: string;
  codigoFormato: string;
  versionFormato: string;
  fechaFormato: string;
}

export interface EvaluacionDetalleRespuesta {
  idRespuesta: number;
  tipoItem: string;
  idItemBase?: number | null;
  idItemCargo?: number | null;
  textoItem: string;
  calificacion: number;
  comentario?: string | null;

  nombreCompetenciaSnapshot?: string | null;
  nombreSeccionSnapshot?: string | null;
  ordenSeccionSnapshot?: number | null;
  ordenCompetenciaSnapshot?: number | null;
  ordenItemSnapshot?: number | null;
}

export interface EvaluacionDetalleResponse {
  cabecera: EvaluacionDetalleCabecera | null;
  respuestas: EvaluacionDetalleRespuesta[];
}

export interface EvaluacionRespuestaEdicion {
  tipoItem: string;
  idItemBase?: number | null;
  idItemCargo?: number | null;
  calificacion: number;
  comentario?: string | null;
}

export interface EvaluacionEdicionResponse {
  idEvaluacion: number;
  idEmpresa: number;
  idArea: number;
  idCargo: number;
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
  periodoEvaluado: string;
  observaciones?: string | null;
  estado: string;
  respuestas: EvaluacionRespuestaEdicion[];
}

export interface EmpleadoNomina {
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
}

export interface FormularioNominaCheckResult {
  existeEnFormulario: boolean;
  idFormulario?: number;
  cedula?: string;
  nombre?: string;
  realizada?: boolean;
  mensaje?: string;
  empleadoNomina?: EmpleadoNomina;
}