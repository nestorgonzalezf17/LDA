namespace EDD.Application.DTOs;

public class UsuarioModuloDto
{
    public int IdUsuarioModulo { get; set; }
    public int IdUsuario { get; set; }
    public string Login { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string? RolBase { get; set; }
    public string RolModulo { get; set; } = string.Empty;
    public bool Activo { get; set; }
}