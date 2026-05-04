export interface ReporteAreaItem {
  idArea: number;
  area: string;
  totalEvaluaciones: number;
  totalFinalizadas: number;
  totalEnElaboracion: number;
  promedioCalificacion?: number | null;
}