export interface UsuarioBase {
  idUsuario: number;
  login: string;
  nombreCompleto: string;
  correo?: string;
  rol?: string;
  activo: boolean;
}