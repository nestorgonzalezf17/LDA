namespace EDD.Application.DTOs;

public class DashboardResumenDto
{
    public int TotalEvaluaciones { get; set; }
    public int TotalFinalizadas { get; set; }
    public int TotalEnElaboracion { get; set; }
    public decimal? PromedioGeneral { get; set; }
}