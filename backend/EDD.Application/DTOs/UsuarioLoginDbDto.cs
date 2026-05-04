namespace EDD.Application.DTOs;

public class UsuarioLoginDbDto
{
    public int IdUsuario { get; set; }
    public string Login { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? UltimoLogin { get; set; }
    public bool DebeCambiarClave { get; set; }
    public int LoginValido { get; set; }

    
    public string PasswordHash { get; set; } = string.Empty;
}