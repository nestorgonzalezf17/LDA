export interface UsuarioMe {
  idUsuario: number;
  login: string;
  nombreCompleto: string;
  correo?: string;
  rolModulo: 'ADMIN' | 'EVALUADOR' | string;
}