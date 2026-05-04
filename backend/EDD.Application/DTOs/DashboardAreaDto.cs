namespace EDD.Application.DTOs;

public class DashboardAreaDto
{
    public int IdArea { get; set; }
    public string? Empresa { get; set; }
    public string Area { get; set; } = string.Empty;
    public int TotalEvaluaciones { get; set; }
    public int TotalFinalizadas { get; set; }
    public int TotalEnElaboracion { get; set; }
    public decimal? PromedioArea { get; set; }
}