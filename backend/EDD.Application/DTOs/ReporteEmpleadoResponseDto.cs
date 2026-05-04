namespace EDD.Application.DTOs;

public class ReporteEmpleadoResponseDto
{
    public ReporteEmpleadoResumenDto? Resumen { get; set; }
    public List<ReporteEmpleadoEvaluacionDto> Evaluaciones { get; set; } = new();
}