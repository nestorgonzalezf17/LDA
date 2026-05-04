using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class CargoRepository : ICargoRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public CargoRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<CargoDto>> ListarPorAreaAsync(int idEmpresa, int idArea)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<CargoDto>(
            "EDD.sp_Cargos_ListarPorArea",
            new
            {
                IdEmpresa = idEmpresa,
                IdArea = idArea
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<int> GuardarAsync(int? idCargo, int idEmpresa, int idArea, string nombre, bool activo)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            "EDD.sp_Cargos_Guardar",
            new
            {
                IdCargo = idCargo,
                IdEmpresa = idEmpresa,
                IdArea = idArea,
                Nombre = nombre,
                Activo = activo
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task CambiarEstadoAsync(int idCargo, bool activo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "EDD.sp_Cargos_CambiarEstado",
            new
            {
                IdCargo = idCargo,
                Activo = activo
            },
            commandType: CommandType.StoredProcedure
        );
    }
}