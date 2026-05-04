namespace EDD.Application.DTOs;

public class PlantillaCompetenciaResponseDto
{
    public int IdCompetencia { get; set; }
    public string Competencia { get; set; } = string.Empty;
    public int OrdenCompetencia { get; set; }
    public List<PlantillaItemResponseDto> Items { get; set; } = new();
}