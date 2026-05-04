namespace EDD.Application.DTOs;

public class CargoSaveDto
{
    public int IdEmpresa { get; set; }
    public int IdArea { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}