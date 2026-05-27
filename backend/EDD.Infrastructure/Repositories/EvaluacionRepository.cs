using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class EvaluacionRepository : IEvaluacionRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public EvaluacionRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<long> CrearAsync(
        int idEmpresa,
        int idArea,
        int idCargo,
        int idEvaluadorUsuario,
        string nombresEmpleado,
        string apellidosEmpleado,
        string cedulaEmpleado,
        string periodoEvaluado,
        string? observaciones)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<long>(
            "EDD.sp_Evaluaciones_GuardarCabecera",
            new
            {
                IdEmpresa = idEmpresa,
                IdArea = idArea,
                IdCargo = idCargo,
                IdEvaluadorUsuario = idEvaluadorUsuario,
                NombresEmpleado = nombresEmpleado,
                ApellidosEmpleado = apellidosEmpleado,
                CedulaEmpleado = cedulaEmpleado,
                PeriodoEvaluado = periodoEvaluado,
                Observaciones = observaciones
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task GuardarRespuestasAsync(long idEvaluacion, List<EvaluacionRespuestaItemDto> respuestas)
    {
        using var connection = _connectionFactory.CreateConnection();

        foreach (var respuesta in respuestas)
        {
            await connection.ExecuteAsync(
                "EDD.sp_Evaluaciones_GuardarRespuesta",
                new
                {
                    IdEvaluacion = idEvaluacion,
                    TipoItem = respuesta.TipoItem,
                    IdItemBase = respuesta.IdItemBase,
                    IdItemCargo = respuesta.IdItemCargo,
                    Calificacion = respuesta.Calificacion,
                    Comentario = respuesta.Comentario
                },
                commandType: CommandType.StoredProcedure
            );
        }

        await connection.ExecuteAsync(
            "EDD.sp_Evaluaciones_RecalcularTotal",
            new { IdEvaluacion = idEvaluacion },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task FinalizarAsync(long idEvaluacion)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "EDD.sp_Evaluaciones_Finalizar",
            new { IdEvaluacion = idEvaluacion },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<IEnumerable<EvaluacionListDto>> ListarAsync(
        int? idEmpresa,
        int? idArea,
        int? idCargo,
        string? cedulaEmpleado,
        DateTime? fechaDesde,
        DateTime? fechaHasta,
        bool esAdmin,
        int idUsuario)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<EvaluacionListDto>(
            "EDD.sp_Evaluaciones_Listar",
            new
            {
                IdEmpresa = idEmpresa,
                IdArea = idArea,
                IdCargo = idCargo,
                CedulaEmpleado = cedulaEmpleado,
                FechaDesde = fechaDesde,
                FechaHasta = fechaHasta,
                EsAdmin = esAdmin,
                IdUsuario = idUsuario
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<EvaluacionDetalleDto> ObtenerDetalleAsync(long idEvaluacion, bool esAdmin, int idUsuario)
    {
        using var connection = _connectionFactory.CreateConnection();
        using var multi = await connection.QueryMultipleAsync(
            "EDD.sp_Evaluaciones_ObtenerDetalle",
            new { IdEvaluacion = idEvaluacion },
            commandType: CommandType.StoredProcedure
        );

        var cabecera = await multi.ReadFirstOrDefaultAsync<EvaluacionDetalleCabeceraDto>();
        var respuestas = (await multi.ReadAsync<EvaluacionDetalleRespuestaDto>()).ToList();

        return new EvaluacionDetalleDto
        {
            Cabecera = cabecera,
            Respuestas = respuestas
        };
    }

    public async Task EliminarBorradorAsync(long idEvaluacion, bool esAdmin, int idUsuario)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "EDD.sp_Evaluaciones_EliminarBorrador",
            new
            {
                IdEvaluacion = idEvaluacion,
                EsAdmin = esAdmin,
                IdUsuario = idUsuario
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<EvaluacionEdicionDto?> ObtenerParaEdicionAsync(long idEvaluacion, bool esAdmin, int idUsuario)
    {
        using var connection = _connectionFactory.CreateConnection();
        using var multi = await connection.QueryMultipleAsync(
            "EDD.sp_Evaluaciones_ObtenerParaEdicion",
            new
            {
                IdEvaluacion = idEvaluacion,
                EsAdmin = esAdmin,
                IdUsuario = idUsuario
            },
            commandType: CommandType.StoredProcedure
        );

        var cabecera = await multi.ReadFirstOrDefaultAsync<EvaluacionEdicionDto>();
        if (cabecera is null)
            return null;

        var respuestas = (await multi.ReadAsync<EvaluacionRespuestaEdicionDto>()).ToList();
        cabecera.Respuestas = respuestas;

        return cabecera;
    }

    public async Task<EmpleadoNominaDto?> BuscarEmpleadoNominaPorCedulaAsync(string cedulaEmpleado)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<EmpleadoNominaDto>(
            "EDS.sp_Empleado_BuscarPorCedulaNomina",
            new
            {
                CedulaEmpleado = cedulaEmpleado
            },
            commandType: CommandType.StoredProcedure
        );
    }
}