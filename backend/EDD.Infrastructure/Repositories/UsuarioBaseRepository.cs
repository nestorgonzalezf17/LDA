using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class UsuarioBaseRepository : IUsuarioBaseRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public UsuarioBaseRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<UsuarioBaseDto>> BuscarAsync(string texto)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var result = await connection.QueryAsync<UsuarioBaseDto>(
            "dbo.sp_Usuarios_Buscar",
            new { Texto = texto },
            commandType: CommandType.StoredProcedure);

        return result;
    }
}