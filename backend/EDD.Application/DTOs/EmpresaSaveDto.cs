namespace EDD.Application.DTOs;

public class EmpresaSaveDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public string? LogoUrl { get; set; }
    public bool Activo { get; set; } = true;
}