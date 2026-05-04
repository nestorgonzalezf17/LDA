namespace EDD.Application.DTOs;

public class UsuarioBaseDto
{
    public int IdUsuario { get; set; }
    public string Login { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string? Rol { get; set; }
    public bool Activo { get; set; }
}