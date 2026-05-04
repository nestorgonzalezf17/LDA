using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace EDD.Infrastructure.Data;

public class DbConnectionFactory
{
    private readonly IConfiguration _configuration;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

     public IDbConnection CreateConnection()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("La cadena de conexión no está configurada.");

        return new SqlConnection(connectionString);
    }
}