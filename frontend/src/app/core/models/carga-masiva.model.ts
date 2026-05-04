export interface CargaMasivaFilaPreview {
  numeroFila: number;
  tipoRegistro: string;
  empresaNombre: string;
  areaNombre: string;
  cargoNombre: string;
  activo: boolean;
  esValida: boolean;
  errores: string[];
  accionSugerida: string;
}

export interface CargaMasivaPreviewResponse {
  totalFilas: number;
  filasValidas: number;
  filasConError: number;
  mensaje: string;
  filas: CargaMasivaFilaPreview[];
  advertencias: string[];
}

export interface CargaMasivaResultado {
  totalFilasProcesadas: number;
  insertados: number;
  reactivadosOAjustados: number;
  rechazados: number;
  mensajes: string[];
}