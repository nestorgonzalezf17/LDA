using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class EmpresaRepository : IEmpresaRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public EmpresaRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<EmpresaDto>> ListarAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<EmpresaDto>(
            "EDD.sp_Empresas_Listar",
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<int> GuardarAsync(int? idEmpresa, string nombre, string? codigo, string? logoUrl, bool activo)
    {
        using var connection = _connectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            "EDD.sp_Empresas_Guardar",
            new
            {
                IdEmpresa = idEmpresa,
                Nombre = nombre,
                Codigo = codigo,
                LogoUrl = logoUrl,
                Activo = activo
            },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task CambiarEstadoAsync(int idEmpresa, bool activo)
    {
        using var connection = _connectionFactory.CreateConnection();

        await connection.ExecuteAsync(
            "EDD.sp_Empresas_CambiarEstado",
            new
            {
                IdEmpresa = idEmpresa,
                Activo = activo
            },
            commandType: CommandType.StoredProcedure
        );
    }
    public async Task ActualizarLogoAsync(int idEmpresa, string logoUrl)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            UPDATE EDD.Empresas
            SET LogoUrl = @LogoUrl,
                FechaActualizacion = GETDATE()
            WHERE IdEmpresa = @IdEmpresa
        ";

        await connection.ExecuteAsync(sql, new
        {
            IdEmpresa = idEmpresa,
            LogoUrl = logoUrl
        });
    }
}