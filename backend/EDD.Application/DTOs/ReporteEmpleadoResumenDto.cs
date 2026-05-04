namespace EDD.Application.DTOs;

public class ReporteEmpleadoResumenDto
{
    public string NombresEmpleado { get; set; } = string.Empty;
    public string ApellidosEmpleado { get; set; } = string.Empty;
    public string CedulaEmpleado { get; set; } = string.Empty;
    public int TotalEvaluaciones { get; set; }
    public int TotalFinalizadas { get; set; }
    public int TotalEnElaboracion { get; set; }
    public decimal? PromedioCalificacion { get; set; }
}