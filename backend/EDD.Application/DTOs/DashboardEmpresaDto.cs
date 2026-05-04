namespace EDD.Application.DTOs;

public class DashboardEmpresaDto
{
    public int IdEmpresa { get; set; }
    public string Empresa { get; set; } = string.Empty;
    public int TotalEvaluaciones { get; set; }
    public int TotalFinalizadas { get; set; }
    public int TotalEnElaboracion { get; set; }
    public decimal? PromedioEmpresa { get; set; }
}