using Dapper;
using EDD.Application.DTOs.EDS;
using EDD.Application.Interfaces.EDS;
using EDD.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
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

    public async Task<IEnumerable<ReportePromedioDto>> ObtenerReportePromediosAsync(ReporteFiltroDto filtro)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string query = @"
            SELECT 
                f.Anio,
                f.IdArea,
                a.Titulo AS NombreArea,
                tv.IdInst,
                i.Titulo AS NombreInstrumento,
                r.Calificacion
            FROM [EDS].[Respuesta] r
            INNER JOIN [EDS].[Formulario] f ON r.IdFormulario = f.IdFormulario
            INNER JOIN [EDS].[AreaEDS] a ON f.IdArea = a.IdArea
            INNER JOIN [EDS].[ItemSat] its ON r.IdItem = its.IdItem
            INNER JOIN [EDS].[SubVariable] sv ON its.IdSubVaria = sv.IdSuVa
            INNER JOIN [EDS].[TipoVaria] tv ON sv.IdTiVa = tv.IdTiVa
            INNER JOIN [EDS].[Instrumento] i ON tv.IdInst = i.IdInst
            WHERE r.Calificacion IS NOT NULL
              AND (@FiltrarAreas = 0 OR f.IdArea IN @IdAreas)
              AND (@IdInst IS NULL OR tv.IdInst = @IdInst)
              AND f.Anio BETWEEN @AnioInicio AND @AnioFin";

        var flatData = await connection.QueryAsync<RawRespuestaReporteDto>(query, new
        {
            FiltrarAreas = filtro.IdAreas != null && filtro.IdAreas.Count > 0 ? 1 : 0,
            IdAreas = filtro.IdAreas,
            IdInst = filtro.IdInst,
            AnioInicio = filtro.AnioInicio,
            AnioFin = filtro.AnioFin
        });

        var reporte = flatData
            .GroupBy(x => x.Anio)
            .Select(gAnio => new ReportePromedioDto
            {
                Anio = gAnio.Key,
                PromedioGeneral = gAnio.Any() ? Math.Round((decimal)gAnio.Average(x => x.Calificacion), 2) : 0,
                PromediosPorInstrumento = gAnio
                    .GroupBy(x => new { x.IdInst, x.NombreInstrumento })
                    .Select(gInst => new InstrumentoPromedioDto
                    {
                        IdInst = gInst.Key.IdInst,
                        NombreInstrumento = gInst.Key.NombreInstrumento,
                        Promedio = gInst.Any() ? Math.Round((decimal)gInst.Average(x => x.Calificacion), 2) : 0
                    })
                    .ToList(),
                PromediosPorArea = gAnio
                    .GroupBy(x => new { x.IdArea, x.NombreArea })
                    .Select(gArea => new AreaPromedioDto
                    {
                        IdArea = gArea.Key.IdArea,
                        NombreArea = gArea.Key.NombreArea,
                        Promedio = gArea.Any() ? Math.Round((decimal)gArea.Average(x => x.Calificacion), 2) : 0
                    })
                    .ToList()
            })
            .OrderBy(x => x.Anio)
            .ToList();

        return reporte;
    }
}
