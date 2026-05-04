namespace EDD.Application.DTOs;

public class UsuarioModuloCreateDto
{
    public int IdUsuario { get; set; }
    public string RolModulo { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}