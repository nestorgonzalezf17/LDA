namespace EDD.Application.DTOs;

public class ReporteAreaDto
{
    public int IdEmpresa { get; set; }
    public string Empresa { get; set; } = string.Empty;
    public int IdArea { get; set; }
    public string Area { get; set; } = string.Empty;
    public int TotalEvaluaciones { get; set; }
    public int TotalFinalizadas { get; set; }
    public int TotalBorradores { get; set; }
    public decimal? PromedioCalificacion { get; set; }
}