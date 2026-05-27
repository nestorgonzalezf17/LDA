using Dapper;
using EDD.Application.DTOs.EDS;
using EDD.Application.Interfaces.EDS;
using EDD.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDD.Infrastructure.Repositories.EDS;

public class CatalogoRepository : ICatalogoRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public CatalogoRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<CatalogoDto>> ListarEstadosCivilesAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<CatalogoDto>(
            "SELECT IdEstC AS Id, Titulo FROM [EDS].[EstadoCivil] ORDER BY Titulo"
        );
    }

    public async Task<IEnumerable<CatalogoDto>> ListarEscolaridadesAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<CatalogoDto>(
            "SELECT IdEsco AS Id, Titulo FROM [EDS].[Escolaridad] ORDER BY Titulo"
        );
    }

    public async Task<IEnumerable<CatalogoDto>> ListarAreasAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<CatalogoDto>(
            "SELECT IdArea AS Id, Titulo FROM [EDS].[AreaEDS] ORDER BY Titulo"
        );
    }

    public async Task<IEnumerable<CatalogoDto>> ListarEmpresasAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<CatalogoDto>(
            "SELECT IdEmpresaEDS AS Id, NombreE AS Titulo FROM [EDS].[EmpresasEDS] ORDER BY NombreE"
        );
    }
}
