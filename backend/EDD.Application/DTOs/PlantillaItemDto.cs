namespace EDD.Application.DTOs;

public class PlantillaItemDto
{
    public int IdSeccion { get; set; }
    public string Seccion { get; set; } = string.Empty;
    public int OrdenSeccion { get; set; }

    public int IdCompetencia { get; set; }
    public string Competencia { get; set; } = string.Empty;
    public int OrdenCompetencia { get; set; }

    public string TipoItem { get; set; } = string.Empty;
    public int IdItem { get; set; }
    public string TextoItem { get; set; } = string.Empty;
    public int OrdenItem { get; set; }
}