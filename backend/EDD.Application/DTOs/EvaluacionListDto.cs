namespace EDD.Application.DTOs;

public class EvaluacionListDto
{
    public long IdEvaluacion { get; set; }

    public int IdEmpresa { get; set; }
    public string Empresa { get; set; } = string.Empty;

    public DateTime FechaEvaluacion { get; set; }
    public DateTime? FechaFinalizacion { get; set; }
    public string Estado { get; set; } = string.Empty;

    public string NombresEmpleado { get; set; } = string.Empty;
    public string ApellidosEmpleado { get; set; } = string.Empty;
    public string CedulaEmpleado { get; set; } = string.Empty;

    public string PeriodoEvaluado { get; set; } = "1 Año";

    public string Area { get; set; } = string.Empty;
    public string Cargo { get; set; } = string.Empty;
    public string Evaluador { get; set; } = string.Empty;
    public int IdEvaluadorUsuario { get; set; }

    public decimal? CalificacionTotal { get; set; }
}