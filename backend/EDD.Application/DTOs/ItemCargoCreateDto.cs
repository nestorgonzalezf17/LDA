namespace EDD.Application.DTOs;

public class ItemCargoCreateDto
{
    public int IdEmpresa { get; set; }
    public int IdCargo { get; set; }
    public int IdCompetencia { get; set; }
    public string TextoItem { get; set; } = string.Empty;
    public int? Orden { get; set; }
}