namespace EDD.Application.DTOs;

public class ItemCargoDto
{   
    public int IdEmpresa { get; set; }
    public int IdItemCargo { get; set; }
    public int IdCargo { get; set; }
    public int IdCompetencia { get; set; }
    public string Competencia { get; set; } = string.Empty;
    public string TextoItem { get; set; } = string.Empty;
    public int Orden { get; set; }
    public bool Activo { get; set; }
}