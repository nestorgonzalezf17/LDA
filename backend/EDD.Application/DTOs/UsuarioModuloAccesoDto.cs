namespace EDD.Application.DTOs;

public class UsuarioModuloAccesoDto
{
    public int IdUsuarioModulo { get; set; }
    public int IdUsuario { get; set; }
    public string RolModulo { get; set; } = string.Empty;
    public bool Activo { get; set; }
}