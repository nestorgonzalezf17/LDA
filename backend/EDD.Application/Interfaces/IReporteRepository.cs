using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IReporteRepository
{
    Task<IEnumerable<ReporteAreaDto>> ObtenerReportePorAreaAsync(bool esAdmin, int idUsuario, int? idEmpresa);
    Task<IEnumerable<EmpleadoBusquedaDto>> BuscarEmpleadosAsync(string texto, int? idEmpresa);
    Task<ReporteEmpleadoResponseDto> ObtenerReportePorEmpleadoAsync(string cedula, int? idEmpresa);
}