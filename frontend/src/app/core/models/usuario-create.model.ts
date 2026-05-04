export interface UsuarioCreate {
  documento: string;
  nombre: string;
  email: string;
  clave: string;
  rol: 'ADMIN' | 'EVALUADOR';
}