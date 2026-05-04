namespace EDD.Application.DTOs;

public class UsuarioResponseDto
{
    public int IdUsuario { get; set; }
    public string Documento { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public string Rol { get; set; } = string.Empty;
}