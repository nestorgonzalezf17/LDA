using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class ItemCargoRepository : IItemCargoRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public ItemCargoRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ItemCargoDto>> ListarPorCargoAsync(int idEmpresa, int idCargo)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ItemCargoDto>(
            "EDD.sp_ItemsCargo_ListarPorCargo",
            new
            {
                IdEmpresa = idEmpresa,
                IdCargo = idCargo
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<int> GuardarAsync(int? idItemCargo, int idEmpresa, int idCargo, int idCompetencia, string textoItem, int? orden)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            "EDD.sp_ItemsCargo_Guardar",
            new
            {
                IdItemCargo = idItemCargo,
                IdEmpresa = idEmpresa,
                IdCargo = idCargo,
                IdCompetencia = idCompetencia,
                TextoItem = textoItem,
                Orden = orden
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task CambiarEstadoAsync(int idItemCargo, bool activo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "EDD.sp_ItemsCargo_CambiarEstado",
            new
            {
                IdItemCargo = idItemCargo,
                Activo = activo
            },
            commandType: CommandType.StoredProcedure
        );
    }
}