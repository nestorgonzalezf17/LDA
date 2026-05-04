namespace EDD.Application.DTOs;

public class EvaluacionCreateDto
{
    public int IdEmpresa { get; set; }
    public int IdArea { get; set; }
    public int IdCargo { get; set; }
    public string NombresEmpleado { get; set; } = string.Empty;
    public string ApellidosEmpleado { get; set; } = string.Empty;
    public string CedulaEmpleado { get; set; } = string.Empty;
    public string PeriodoEvaluado { get; set; } = "1 Año";
    public string? Observaciones { get; set; }
}