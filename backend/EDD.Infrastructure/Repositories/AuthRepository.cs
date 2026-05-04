using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;
using System.Data;

namespace EDD.Infrastructure.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public AuthRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<(UsuarioLoginDbDto? Usuario, List<UsuarioRolDto> Roles)> ValidarLoginAsync(string login, string clave)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        using var multi = await connection.QueryMultipleAsync(
            "dbo.sp_Usuarios_Login_Core",
            new
            {
                Login = login.Trim(),
                Clave = clave.Trim()
            },
            commandType: CommandType.StoredProcedure);

        var usuario = await multi.ReadFirstOrDefaultAsync<UsuarioLoginDbDto>();

        var roles = new List<UsuarioRolDto>();

        if (!multi.IsConsumed)
        {
            roles = (await multi.ReadAsync<UsuarioRolDto>()).ToList();
        }

        if (usuario is null)
            return (null, new List<UsuarioRolDto>());

        var passwordValido = VerificarPasswordBCrypt(clave.Trim(), usuario.PasswordHash);

        usuario.LoginValido = passwordValido ? 1 : 0;

        if (!passwordValido)
            roles = new List<UsuarioRolDto>();

        return (usuario, roles);
    }

    private static bool VerificarPasswordBCrypt(string clave, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(clave) || string.IsNullOrWhiteSpace(passwordHash))
            return false;

        // En producción ya no aceptamos SHA1.
        // BCrypt normalmente inicia con $2a$, $2b$ o $2y$.
        if (!passwordHash.StartsWith("$2"))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(clave, passwordHash);
        }
        catch
        {
            return false;
        }
    }
}