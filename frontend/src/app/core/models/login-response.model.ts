export interface LoginResponse {
  idUsuario: number;
  login: string;
  nombreCompleto: string;
  correo: string | null;
  rolModulo: string;
  debeCambiarClave: boolean;
  token: string;
}