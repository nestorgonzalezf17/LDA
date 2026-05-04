namespace EDD.Application.DTOs;

public class UsuarioCreateDto
{
    public string Documento { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Clave { get; set; } = string.Empty;

    // Rol dentro de la app (ADMIN / EVALUADOR)
    public string Rol { get; set; } = string.Empty;
}