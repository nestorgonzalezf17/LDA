namespace EDD.Application.DTOs;

public class CargoDto
{
    public int IdCargo { get; set; }
    public int IdArea { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Codigo { get; set; }
    public bool Activo { get; set; }
}