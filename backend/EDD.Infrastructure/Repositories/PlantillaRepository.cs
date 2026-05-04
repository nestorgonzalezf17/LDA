using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class PlantillaRepository : IPlantillaRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public PlantillaRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PlantillaCabeceraDto?> ObtenerCabeceraAsync(int idEmpresa, int idArea, int idCargo, int idEvaluadorUsuario)
    {
        using var connection = _connectionFactory.CreateConnection();
        using var multi = await connection.QueryMultipleAsync(
            "EDD.sp_Plantilla_ObtenerPorCargo",
            new
            {
                IdEmpresa = idEmpresa,
                IdArea = idArea,
                IdCargo = idCargo,
                IdEvaluadorUsuario = idEvaluadorUsuario
            },
            commandType: CommandType.StoredProcedure
        );

        var cabecera = await multi.ReadFirstOrDefaultAsync<PlantillaCabeceraDto>();
        return cabecera;
    }

    public async Task<IEnumerable<PlantillaItemDto>> ObtenerPorCargoAsync(int idEmpresa, int idArea, int idCargo, int idEvaluadorUsuario)
    {
        using var connection = _connectionFactory.CreateConnection();
        using var multi = await connection.QueryMultipleAsync(
            "EDD.sp_Plantilla_ObtenerPorCargo",
            new
            {
                IdEmpresa = idEmpresa,
                IdArea = idArea,
                IdCargo = idCargo,
                IdEvaluadorUsuario = idEvaluadorUsuario
            },
            commandType: CommandType.StoredProcedure
        );

        await multi.ReadFirstOrDefaultAsync<PlantillaCabeceraDto>();
        var items = await multi.ReadAsync<PlantillaItemDto>();
        return items;
    }

    public async Task<IEnumerable<EscalaCalificacionDto>> ObtenerEscalaAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<EscalaCalificacionDto>(
            @"SELECT Valor, Nombre, Orden, Activo
              FROM EDD.EscalaCalificacion
              WHERE Activo = 1
              ORDER BY Orden"
        );
    }
}