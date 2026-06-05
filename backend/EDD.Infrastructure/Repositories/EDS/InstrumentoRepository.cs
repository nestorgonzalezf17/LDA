using Dapper;
using EDD.Application.DTOs.EDS;
using EDD.Application.Interfaces.EDS;
using EDD.Infrastructure.Data;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EDD.Infrastructure.Repositories.EDS;

public class InstrumentoRepository : IInstrumentoRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public InstrumentoRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Dictionary<string, Dictionary<string, Dictionary<string, List<PreguntaDto>>>>> ObtenerArbolPorInstrumentoAsync(int idInst)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            SELECT 
                i.[Titulo] AS [TituloInstrumento],
                tv.[Titulo] AS [TituloTipoVaria],
                sv.[Titulo] AS [TituloSubVaria],
                its.[IdItem] AS [IdItem],
                its.[Enunciado]
            FROM [EDS].[Instrumento] i
            INNER JOIN [EDS].[TipoVaria] tv ON i.[IdInst] = tv.[IdInst]
            INNER JOIN [EDS].[SubVariable] sv ON tv.[IdTiVa] = sv.[IdTiVa]
            INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
            WHERE i.[IdInst] = @IdInst
            ORDER BY tv.[IdTiVa], sv.[IdSuVa], its.[IdItem]";

        var flatData = await connection.QueryAsync<ArbolInstrumentoDto>(sql, new { IdInst = idInst });

        // Agrupación jerárquica con LINQ: instrumento -> TipoVaria -> SubVaria -> Enunciados
        var tree = flatData
            .GroupBy(x => x.TituloInstrumento)
            .ToDictionary(
                gInst => gInst.Key,
                gInst => gInst
                    .GroupBy(x => x.TituloTipoVaria)
                    .ToDictionary(
                        gTipo => gTipo.Key,
                        gTipo => gTipo
                            .GroupBy(x => x.TituloSubVaria)
                            .ToDictionary(
                                gSub => gSub.Key,
                                gSub => gSub.Select(x => new PreguntaDto { IdItem = x.IdItem, Enunciado = x.Enunciado }).ToList()
                            )
                    )
            );

        return tree;
    }

    public async Task<Dictionary<string, Dictionary<string, Dictionary<string, List<PreguntaDto>>>>> ObtenerArbolCompletoAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            SELECT 
                i.[Titulo] AS [TituloInstrumento],
                tv.[Titulo] AS [TituloTipoVaria],
                sv.[Titulo] AS [TituloSubVaria],
                its.[IdItem] AS [IdItem],
                its.[Enunciado]
            FROM [EDS].[Instrumento] i
            INNER JOIN [EDS].[TipoVaria] tv ON i.[IdInst] = tv.[IdInst]
            INNER JOIN [EDS].[SubVariable] sv ON tv.[IdTiVa] = sv.[IdTiVa]
            INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
            ORDER BY i.[IdInst], tv.[IdTiVa], sv.[IdSuVa], its.[IdItem]";

        var flatData = await connection.QueryAsync<ArbolInstrumentoDto>(sql);

        var tree = flatData
            .GroupBy(x => x.TituloInstrumento)
            .ToDictionary(
                gInst => gInst.Key,
                gInst => gInst
                    .GroupBy(x => x.TituloTipoVaria)
                    .ToDictionary(
                        gTipo => gTipo.Key,
                        gTipo => gTipo
                            .GroupBy(x => x.TituloSubVaria)
                            .ToDictionary(
                                gSub => gSub.Key,
                                gSub => gSub.Select(x => new PreguntaDto { IdItem = x.IdItem, Enunciado = x.Enunciado }).ToList()
                            )
                    )
            );

        return tree;
    }
}
