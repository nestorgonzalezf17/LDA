namespace EDD.Application.DTOs;

public class PlantillaCargoResponseDto
{
    public int IdEmpresa { get; set; }
    public int IdArea { get; set; }
    public int IdCargo { get; set; }
    public PlantillaCabeceraDto? Cabecera { get; set; }
    public List<PlantillaSeccionResponseDto> Secciones { get; set; } = new();
    public List<EscalaCalificacionDto> Escala { get; set; } = new();
}