namespace EDD.Application.DTOs;

public class EvaluacionDetalleDto
{
    public EvaluacionDetalleCabeceraDto? Cabecera { get; set; }
    public List<EvaluacionDetalleRespuestaDto> Respuestas { get; set; } = new();
}