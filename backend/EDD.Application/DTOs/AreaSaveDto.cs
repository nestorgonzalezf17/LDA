namespace EDD.Application.DTOs;

public class AreaSaveDto
{
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}