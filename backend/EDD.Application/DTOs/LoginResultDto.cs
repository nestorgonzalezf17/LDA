namespace EDD.Application.DTOs;

public class LoginResultDto
{
    public int IdUsuario { get; set; }
    public string Login { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string RolModulo { get; set; } = string.Empty;
    public bool DebeCambiarClave { get; set; }
    public string Token { get; set; } = string.Empty;
}