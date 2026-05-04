using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class ReporteRepository : IReporteRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public ReporteRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ReporteAreaDto>> ObtenerReportePorAreaAsync(bool esAdmin, int idUsuario, int? idEmpresa)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ReporteAreaDto>(
            "EDD.sp_Reporte_ObtenerPorArea",
            new
            {
                EsAdmin = esAdmin,
                IdUsuario = idUsuario,
                IdEmpresa = idEmpresa
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<EmpleadoBusquedaDto>> BuscarEmpleadosAsync(string texto, int? idEmpresa)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<EmpleadoBusquedaDto>(
            "EDD.sp_Reporte_BuscarEmpleados",
            new
            {
                Texto = texto,
                IdEmpresa = idEmpresa
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<ReporteEmpleadoResponseDto> ObtenerReportePorEmpleadoAsync(string cedula, int? idEmpresa)
    {
        using var connection = _connectionFactory.CreateConnection();
        using var multi = await connection.QueryMultipleAsync(
            "EDD.sp_Reporte_ObtenerPorEmpleado",
            new
            {
                Cedula = cedula,
                IdEmpresa = idEmpresa
            },
            commandType: CommandType.StoredProcedure
        );

        var resumen = await multi.ReadFirstOrDefaultAsync<ReporteEmpleadoResumenDto>();
        var evaluaciones = (await multi.ReadAsync<ReporteEmpleadoEvaluacionDto>()).ToList();

        return new ReporteEmpleadoResponseDto
        {
            Resumen = resumen,
            Evaluaciones = evaluaciones
        };
    }
}