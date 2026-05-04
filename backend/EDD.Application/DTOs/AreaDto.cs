namespace EDD.Application.DTOs;

public class AreaDto
{
    public int IdArea { get; set; }
    public int IdEmpresa { get; set; }
    public string Empresa { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public bool Activo { get; set; }
}