using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public DashboardRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<DashboardResponseDto> ObtenerAsync(bool esAdmin, int idUsuario, int? idEmpresa)
    {
        using var connection = _connectionFactory.CreateConnection();
        using var multi = await connection.QueryMultipleAsync(
            "EDD.sp_Dashboard_Obtener",
            new
            {
                EsAdmin = esAdmin,
                IdUsuario = idUsuario,
                IdEmpresa = idEmpresa
            },
            commandType: CommandType.StoredProcedure
        );

        var resumen = await multi.ReadFirstOrDefaultAsync<DashboardResumenDto>();
        var resumenPorEmpresa = (await multi.ReadAsync<DashboardEmpresaDto>()).ToList();
        var resumenPorArea = (await multi.ReadAsync<DashboardAreaDto>()).ToList();
        var ultimas = (await multi.ReadAsync<DashboardUltimaEvaluacionDto>()).ToList();

        return new DashboardResponseDto
        {
            Resumen = resumen ?? new DashboardResumenDto(),
            ResumenPorEmpresa = resumenPorEmpresa,
            ResumenPorArea = resumenPorArea,
            UltimasEvaluaciones = ultimas
        };
    }
}