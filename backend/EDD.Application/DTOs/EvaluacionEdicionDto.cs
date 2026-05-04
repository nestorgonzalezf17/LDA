namespace EDD.Application.DTOs;

public class EvaluacionEdicionDto
{
    public long IdEvaluacion { get; set; }
    public int IdEmpresa { get; set; }
    public int IdArea { get; set; }
    public int IdCargo { get; set; }
    public string NombresEmpleado { get; set; } = string.Empty;
    public string ApellidosEmpleado { get; set; } = string.Empty;
    public string CedulaEmpleado { get; set; } = string.Empty;
    public string PeriodoEvaluado { get; set; } = "1 Año";
    public string? Observaciones { get; set; }
    public string Estado { get; set; } = string.Empty;
    public List<EvaluacionRespuestaEdicionDto> Respuestas { get; set; } = new();
}

public class EvaluacionRespuestaEdicionDto
{
    public string TipoItem { get; set; } = string.Empty;
    public int? IdItemBase { get; set; }
    public int? IdItemCargo { get; set; }
    public int Calificacion { get; set; }
    public string? Comentario { get; set; }
}