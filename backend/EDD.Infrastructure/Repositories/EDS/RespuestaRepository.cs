using Dapper;
using EDD.Application.DTOs.EDS;
using EDD.Application.Interfaces.EDS;
using EDD.Infrastructure.Data;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace EDD.Infrastructure.Repositories.EDS;

public class RespuestaRepository : IRespuestaRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public RespuestaRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task GuardarRespuestasBulkAsync(GuardarRespuestasBulkDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // Query MERGE de SQL Server para Upsert atómico
            const string mergeSql = @"
                MERGE [EDS].[Respuesta] AS target
                USING (SELECT @IdFormulario AS IdFormulario, @IdItem AS IdItem, @Calificacion AS Calificacion) AS source
                ON (target.IdFormulario = source.IdFormulario AND target.IdItem = source.IdItem)
                WHEN MATCHED THEN
                    UPDATE SET Calificacion = source.Calificacion
                WHEN NOT MATCHED THEN
                    INSERT (IdFormulario, IdItem, Calificacion)
                    VALUES (source.IdFormulario, source.IdItem, source.Calificacion);";

            foreach (var resp in dto.Respuestas)
            {
                await connection.ExecuteAsync(mergeSql, new
                {
                    IdFormulario = dto.IdFormulario,
                    IdItem = resp.IdItem,
                    Calificacion = resp.Calificacion
                }, transaction);
            }

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<IEnumerable<RespuestaObtenidaDto>> ObtenerRespuestasPorFormularioAsync(int idFormulario)
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<RespuestaObtenidaDto>(
            "SELECT IdItem, Calificacion FROM [EDS].[Respuesta] WHERE IdFormulario = @IdFormulario",
            new { IdFormulario = idFormulario }
        );
    }
}
