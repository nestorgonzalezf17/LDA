namespace EDD.Application.DTOs;

public class UsuarioMeDto
{
    public int IdUsuario { get; set; }
    public string Login { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string RolModulo { get; set; } = string.Empty;
}