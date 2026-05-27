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

    public async Task<Dictionary<string, Dictionary<string, Dictionary<string, List<string>>>>> ObtenerArbolPorInstrumentoAsync(int idInst)
    {
        using var connection = _connectionFactory.CreateConnection();

        var flatData = await connection.QueryAsync<ArbolInstrumentoDto>(
            "[EDS].[ObtenerArbolPorInstrumento]",
            new { IdInst = idInst },
            commandType: CommandType.StoredProcedure
        );

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
                                gSub => gSub.Select(x => x.Enunciado).ToList()
                            )
                    )
            );

        return tree;
    }
}
