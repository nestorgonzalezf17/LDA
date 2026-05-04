namespace EDD.Application.DTOs;

public class DashboardUltimaEvaluacionDto
{
    public long IdEvaluacion { get; set; }
    public string Empresa { get; set; } = string.Empty;
    public DateTime FechaEvaluacion { get; set; }
    public string NombresEmpleado { get; set; } = string.Empty;
    public string ApellidosEmpleado { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public decimal? CalificacionTotal { get; set; }
}