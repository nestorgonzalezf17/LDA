using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;

namespace EDD.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;
    private const int BCryptWorkFactor = 12;

    public UsuarioRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    // ===============================
    // LISTAR USUARIOS POR APP
    // ===============================
    public async Task<List<UsuarioResponseDto>> ListarPorAppAsync(string nombreApp)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var sql = @"
        SELECT 
            u.IdUsuario,
            u.Documento,
            u.Nombre,
            u.Email,
            u.Estado AS Activo,
            r.NombreRol AS Rol
        FROM core.Usuarios u
        INNER JOIN core.UsuarioRol ur 
            ON ur.IdUsuario = u.IdUsuario
        INNER JOIN core.Roles r 
            ON r.IdRol = ur.IdRol
        INNER JOIN core.Aplicaciones a 
            ON a.IdApp = ur.IdApp
        WHERE a.NombreApp = @NombreApp
        ORDER BY u.Nombre;";

        var result = await connection.QueryAsync<UsuarioResponseDto>(
            sql,
            new { NombreApp = nombreApp.Trim() });

        return result.ToList();
    }

    // ===============================
    // CREAR USUARIO
    // ===============================
    public async Task<int> CrearAsync(UsuarioCreateDto dto)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        connection.Open();

        using var transaction = connection.BeginTransaction();

        try
        {
            var documento = dto.Documento.Trim();
            var nombre = dto.Nombre.Trim();
            var email = dto.Email.Trim().ToLowerInvariant();
            var clave = dto.Clave.Trim();
            var rol = dto.Rol.Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(documento))
                throw new Exception("El documento es obligatorio.");

            if (string.IsNullOrWhiteSpace(nombre))
                throw new Exception("El nombre es obligatorio.");

            if (string.IsNullOrWhiteSpace(email))
                throw new Exception("El email es obligatorio.");

            if (string.IsNullOrWhiteSpace(clave))
                throw new Exception("La clave es obligatoria.");

            if (rol != "ADMIN" && rol != "EVALUADOR" && rol != "NOTIFICADOR")
                throw new Exception("El rol debe ser ADMIN, EVALUADOR o NOTIFICADOR.");

            // Validar email único
            var existeEmail = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM core.Usuarios WHERE Email = @Email",
                new { Email = email },
                transaction);

            if (existeEmail > 0)
                throw new Exception("Ya existe un usuario con ese email.");

            // Validar documento único
            var existeDocumento = await connection.ExecuteScalarAsync<int>(
                "SELECT COUNT(1) FROM core.Usuarios WHERE Documento = @Documento",
                new { Documento = documento },
                transaction);

            if (existeDocumento > 0)
                throw new Exception("Ya existe un usuario con ese documento.");

            // Hash BCrypt
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(clave, workFactor: BCryptWorkFactor);

            // Crear usuario
            // DebeCambiarClave = 1 porque la clave inicial la define el admin y debe ser temporal.
            var idUsuario = await connection.ExecuteScalarAsync<int>(@"
                INSERT INTO core.Usuarios 
                (
                    Documento, 
                    Nombre, 
                    Email, 
                    PasswordHash, 
                    Estado, 
                    FechaCreacion,
                    DebeCambiarClave
                )
                VALUES 
                (
                    @Documento, 
                    @Nombre, 
                    @Email, 
                    @PasswordHash, 
                    1, 
                    GETDATE(),
                    1
                );

                SELECT CAST(SCOPE_IDENTITY() AS INT);",
                new
                {
                    Documento = documento,
                    Nombre = nombre,
                    Email = email,
                    PasswordHash = passwordHash
                },
                transaction);

            // Obtener rol
            var idRol = await connection.ExecuteScalarAsync<int?>(@"
                SELECT IdRol 
                FROM core.Roles 
                WHERE NombreRol = @Rol;",
                new { Rol = rol },
                transaction);

            if (idRol is null)
                throw new Exception($"El rol '{rol}' no existe.");

            // Obtener app EDD
            var idApp = await connection.ExecuteScalarAsync<int?>(@"
                SELECT IdApp 
                FROM core.Aplicaciones 
                WHERE NombreApp = 'EDD';",
                transaction: transaction);

            if (idApp is null)
                throw new Exception("La aplicación EDD no existe.");

            // Relación usuario-rol-app
            await connection.ExecuteAsync(@"
                INSERT INTO core.UsuarioRol 
                (
                    IdUsuario, 
                    IdRol, 
                    IdApp
                )
                VALUES 
                (
                    @IdUsuario, 
                    @IdRol, 
                    @IdApp
                );",
                new
                {
                    IdUsuario = idUsuario,
                    IdRol = idRol.Value,
                    IdApp = idApp.Value
                },
                transaction);

            transaction.Commit();

            return idUsuario;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    // ===============================
    // ASIGNAR / ACTUALIZAR ROL
    // ===============================
    public async Task AsignarRolAsync(int idUsuario, string rol, string nombreApp)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var rolNormalizado = rol.Trim().ToUpperInvariant();
        var appNormalizada = nombreApp.Trim();

        if (rolNormalizado != "ADMIN" && rolNormalizado != "EVALUADOR" && rolNormalizado != "NOTIFICADOR")
            throw new Exception("El rol debe ser ADMIN, EVALUADOR o NOTIFICADOR.");

        var idRol = await connection.ExecuteScalarAsync<int?>(@"
            SELECT IdRol 
            FROM core.Roles 
            WHERE NombreRol = @Rol;",
            new { Rol = rolNormalizado });

        if (idRol is null)
            throw new Exception($"El rol '{rolNormalizado}' no existe.");

        var idApp = await connection.ExecuteScalarAsync<int?>(@"
            SELECT IdApp 
            FROM core.Aplicaciones 
            WHERE NombreApp = @App;",
            new { App = appNormalizada });

        if (idApp is null)
            throw new Exception($"La app '{appNormalizada}' no existe.");

        var existeUsuario = await connection.ExecuteScalarAsync<int>(@"
            SELECT COUNT(1)
            FROM core.Usuarios
            WHERE IdUsuario = @IdUsuario;",
            new { IdUsuario = idUsuario });

        if (existeUsuario == 0)
            throw new Exception("El usuario no existe.");

        var existeRelacion = await connection.ExecuteScalarAsync<int>(@"
            SELECT COUNT(1)
            FROM core.UsuarioRol
            WHERE IdUsuario = @IdUsuario 
              AND IdApp = @IdApp;",
            new
            {
                IdUsuario = idUsuario,
                IdApp = idApp.Value
            });

        if (existeRelacion > 0)
        {
            await connection.ExecuteAsync(@"
                UPDATE core.UsuarioRol
                SET IdRol = @IdRol
                WHERE IdUsuario = @IdUsuario 
                  AND IdApp = @IdApp;",
                new
                {
                    IdUsuario = idUsuario,
                    IdRol = idRol.Value,
                    IdApp = idApp.Value
                });
        }
        else
        {
            await connection.ExecuteAsync(@"
                INSERT INTO core.UsuarioRol 
                (
                    IdUsuario, 
                    IdRol, 
                    IdApp
                )
                VALUES 
                (
                    @IdUsuario, 
                    @IdRol, 
                    @IdApp
                );",
                new
                {
                    IdUsuario = idUsuario,
                    IdRol = idRol.Value,
                    IdApp = idApp.Value
                });
        }
    }

    // ===============================
    // RESET PASSWORD ADMIN
    // ===============================
    public async Task ResetPasswordAsync(int idUsuario, string nuevaClave)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var clave = nuevaClave.Trim();

        if (string.IsNullOrWhiteSpace(clave))
            throw new Exception("La nueva clave es obligatoria.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(clave, workFactor: BCryptWorkFactor);

        var rows = await connection.ExecuteAsync(@"
            UPDATE core.Usuarios
            SET PasswordHash = @PasswordHash,
                DebeCambiarClave = 1
            WHERE IdUsuario = @IdUsuario;",
            new
            {
                PasswordHash = passwordHash,
                IdUsuario = idUsuario
            });

        if (rows == 0)
            throw new Exception("El usuario no existe.");
    }

    // ===============================
    // CAMBIAR PASSWORD USUARIO LOGUEADO
    // ===============================
    public async Task CambiarPasswordAsync(int idUsuario, string nuevaClave)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var clave = nuevaClave.Trim();

        if (string.IsNullOrWhiteSpace(clave))
            throw new Exception("La nueva clave es obligatoria.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(clave, workFactor: BCryptWorkFactor);

        var rows = await connection.ExecuteAsync(@"
            UPDATE core.Usuarios
            SET PasswordHash = @PasswordHash,
                DebeCambiarClave = 0
            WHERE IdUsuario = @IdUsuario;",
            new
            {
                PasswordHash = passwordHash,
                IdUsuario = idUsuario
            });

        if (rows == 0)
            throw new Exception("El usuario no existe.");
    }

    // ===============================
    // ACTIVAR / DESACTIVAR
    // ===============================
    public async Task CambiarEstadoAsync(int idUsuario, bool activo)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var rows = await connection.ExecuteAsync(@"
            UPDATE core.Usuarios
            SET Estado = @Activo
            WHERE IdUsuario = @IdUsuario;",
            new
            {
                Activo = activo,
                IdUsuario = idUsuario
            });

        if (rows == 0)
            throw new Exception("El usuario no existe.");
    }
}