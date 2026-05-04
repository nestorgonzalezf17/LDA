namespace EDD.Application.DTOs;

public class DashboardResponseDto
{
    public DashboardResumenDto Resumen { get; set; } = new();
    public List<DashboardEmpresaDto> ResumenPorEmpresa { get; set; } = new();
    public List<DashboardAreaDto> ResumenPorArea { get; set; } = new();
    public List<DashboardUltimaEvaluacionDto> UltimasEvaluaciones { get; set; } = new();
}