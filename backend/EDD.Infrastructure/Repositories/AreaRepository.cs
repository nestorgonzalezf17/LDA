using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class AreaRepository : IAreaRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public AreaRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<AreaDto>> ListarAsync(int? idEmpresa)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<AreaDto>(
            "EDD.sp_Areas_Listar",
            new { IdEmpresa = idEmpresa },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<int> GuardarAsync(int? idArea, int idEmpresa, string nombre, bool activo)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            "EDD.sp_Areas_Guardar",
            new
            {
                IdArea = idArea,
                IdEmpresa = idEmpresa,
                Nombre = nombre,
                Activo = activo
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task CambiarEstadoAsync(int idArea, bool activo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "EDD.sp_Areas_CambiarEstado",
            new
            {
                IdArea = idArea,
                Activo = activo
            },
            commandType: CommandType.StoredProcedure
        );
    }
}