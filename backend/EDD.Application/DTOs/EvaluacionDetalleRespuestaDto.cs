namespace EDD.Application.DTOs;

public class EvaluacionDetalleRespuestaDto
{
    public long IdRespuesta { get; set; }
    public string TipoItem { get; set; } = string.Empty;
    public int? IdItemBase { get; set; }
    public int? IdItemCargo { get; set; }
    public string TextoItem { get; set; } = string.Empty;
    public int Calificacion { get; set; }
    public string? Comentario { get; set; }

    public string NombreCompetenciaSnapshot { get; set; } = string.Empty;
    public string NombreSeccionSnapshot { get; set; } = string.Empty;
    public int? OrdenSeccionSnapshot { get; set; }
    public int? OrdenCompetenciaSnapshot { get; set; }
    public int? OrdenItemSnapshot { get; set; }
}