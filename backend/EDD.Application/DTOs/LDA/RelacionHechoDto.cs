namespace EDD.Application.DTOs.LDA;

public class RelacionHechoDto
{
    public int IdRelacionHecho { get; set; }
    public string TituloRel { get; set; } = string.Empty;
    public string? RutaPlantilla { get; set; }
}
