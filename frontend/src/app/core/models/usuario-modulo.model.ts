export interface UsuarioModulo {
  idUsuario: number;
  documento: string;
  nombre: string;
  email: string;
  activo: boolean;
  rol: 'ADMIN' | 'EVALUADOR' | string;
}