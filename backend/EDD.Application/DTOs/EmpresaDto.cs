namespace EDD.Application.DTOs;

public class EmpresaDto
{
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public string? LogoUrl { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}