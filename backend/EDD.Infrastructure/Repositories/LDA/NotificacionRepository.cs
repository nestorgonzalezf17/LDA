using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using EDD.Application.DTOs.LDA;
using EDD.Application.Interfaces.LDA;
using EDD.Infrastructure.Data;

namespace EDD.Infrastructure.Repositories.LDA;

public class NotificacionRepository : INotificacionRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public NotificacionRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<NotificacionDto>> ListarAsync(
        string? cedulaEmpleado = null,
        int? idTipoCarga = null,
        string? placa = null,
        string? operacion = null,
        DateTime? fechaHecho = null,
        DateTime? fechaNotificacion = null,
        string? registro = null)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT 
                n.IdNotificacion, n.CedulaEmpleado, n.NombreCompletoEmpleado, 
                n.PlacaVehiculoAsignado, n.Operacion, n.FechaHecho, 
                n.FechaNotificacion, n.Registro, n.IdRelacionHecho, n.IdTipoCarga,
                rh.TituloRel AS TituloRelacionHecho,
                tc.TituloTipoCarga AS TituloTipoCarga
            FROM LDA.Notificaciones n
            INNER JOIN LDA.RelacionHecho rh ON n.IdRelacionHecho = rh.IdRelacionHecho
            INNER JOIN LDA.TipoCarga tc ON n.IdTipoCarga = tc.IdTipoCarga
            WHERE 
                (@Cedula IS NULL OR n.CedulaEmpleado LIKE '%' + @Cedula + '%') AND
                (@IdTipoCarga IS NULL OR n.IdTipoCarga = @IdTipoCarga) AND
                (@Placa IS NULL OR n.PlacaVehiculoAsignado LIKE '%' + @Placa + '%') AND
                (@Operacion IS NULL OR n.Operacion LIKE '%' + @Operacion + '%') AND
                (@FechaHecho IS NULL OR CAST(n.FechaHecho AS DATE) = CAST(@FechaHecho AS DATE)) AND
                (@FechaNotif IS NULL OR CAST(n.FechaNotificacion AS DATE) = CAST(@FechaNotif AS DATE)) AND
                (@Registro IS NULL OR n.Registro LIKE '%' + @Registro + '%')
            ORDER BY n.FechaNotificacion DESC";

        return await connection.QueryAsync<NotificacionDto>(sql, new {
            Cedula = cedulaEmpleado,
            IdTipoCarga = idTipoCarga,
            Placa = placa,
            Operacion = operacion,
            FechaHecho = fechaHecho,
            FechaNotif = fechaNotificacion,
            Registro = registro
        });
    }

    public async Task<IEnumerable<TipoCargaDto>> ListarTiposCargaAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<TipoCargaDto>("SELECT IdTipoCarga, TituloTipoCarga, TipoCarga FROM LDA.TipoCarga ORDER BY TituloTipoCarga");
    }

    public async Task<IEnumerable<RelacionHechoDto>> ListarRelacionesHechoAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<RelacionHechoDto>("SELECT IdRelacionHecho, TituloRel, RutaPlantilla FROM LDA.RelacionHecho ORDER BY TituloRel");
    }

    public async Task<int> CrearAsync(NotificacionSaveDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            INSERT INTO LDA.Notificaciones (
                CedulaEmpleado, NombreCompletoEmpleado, PlacaVehiculoAsignado, 
                IdRelacionHecho, IdTipoCarga, Operacion, FechaHecho, Registro
            )
            VALUES (
                @CedulaEmpleado, @NombreCompletoEmpleado, @PlacaVehiculoAsignado, 
                @IdRelacionHecho, @IdTipoCarga, @Operacion, @FechaHecho, @Registro
            );
            SELECT CAST(SCOPE_IDENTITY() as int);";

        return await connection.ExecuteScalarAsync<int>(sql, dto);
    }

    public async Task<bool> ActualizarRegistroAsync(int id, string registro)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = "UPDATE LDA.Notificaciones SET Registro = @Registro WHERE IdNotificacion = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, Registro = registro });
        return rowsAffected > 0;
    }
}
