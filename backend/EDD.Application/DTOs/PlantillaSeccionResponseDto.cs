namespace EDD.Application.DTOs;

public class PlantillaSeccionResponseDto
{
    public int IdSeccion { get; set; }
    public string Seccion { get; set; } = string.Empty;
    public int OrdenSeccion { get; set; }
    public List<PlantillaCompetenciaResponseDto> Competencias { get; set; } = new();
}