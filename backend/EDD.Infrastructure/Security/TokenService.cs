using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EDD.Infrastructure.Security;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerarToken(UsuarioMeDto usuario)
    {
        // 🔐 Validaciones críticas de configuración
        var key = _configuration["Jwt:Key"];
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(key))
            throw new Exception("Jwt:Key no está configurado.");

        if (string.IsNullOrWhiteSpace(issuer))
            throw new Exception("Jwt:Issuer no está configurado.");

        if (string.IsNullOrWhiteSpace(audience))
            throw new Exception("Jwt:Audience no está configurado.");

       var expireMinutes = int.Parse(
            _configuration["Jwt:ExpiresMinutes"] ??
            _configuration["Jwt:ExpireMinutes"] ??
            "480"
        );

        // 🔥 NORMALIZACIÓN DE ROL (CLAVE DEL PROBLEMA QUE TENÍAS)
        var rolNormalizado = (usuario.RolModulo ?? string.Empty).ToUpper();

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.Name, usuario.Login ?? string.Empty),
            new Claim("nombreCompleto", usuario.NombreCompleto ?? string.Empty),
            new Claim(ClaimTypes.Email, usuario.Correo ?? string.Empty),
            new Claim(ClaimTypes.Role, rolNormalizado)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}