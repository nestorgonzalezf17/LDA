namespace EDD.Application.DTOs;

public class EvaluacionRespuestaItemDto
{
    public string TipoItem { get; set; } = string.Empty; // BASE / CARGO
    public int? IdItemBase { get; set; }
    public int? IdItemCargo { get; set; }
    public int Calificacion { get; set; }
    public string? Comentario { get; set; }
}