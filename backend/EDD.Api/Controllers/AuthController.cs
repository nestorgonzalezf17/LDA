using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthRepository _authRepository;
    private readonly ITokenService _tokenService;
    private readonly IUsuarioRepository _usuarioRepository;

    public AuthController(
        IAuthRepository authRepository,
        ITokenService tokenService,
        IUsuarioRepository usuarioRepository)
    {
        _authRepository = authRepository;
        _tokenService = tokenService;
        _usuarioRepository = usuarioRepository;
    }

    // ===============================
    // LOGIN
    // ===============================
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Login))
            return BadRequest("El login es obligatorio.");

        if (string.IsNullOrWhiteSpace(request.Clave))
            return BadRequest("La clave es obligatoria.");

        // 🔥 Usuario + roles desde SP
        var (usuarioDb, roles) = await _authRepository.ValidarLoginAsync(
            request.Login.Trim(),
            request.Clave.Trim());

        if (usuarioDb is null || usuarioDb.LoginValido != 1)
            return Unauthorized(new { mensaje = "Credenciales inválidas." });

        if (!usuarioDb.Activo)
            return Unauthorized(new { mensaje = "El usuario está inactivo." });

        // 🔥 Buscar acceso a EDD
        var rolEdd = roles.FirstOrDefault(r => r.NombreApp == "EDD");

        if (rolEdd is null)
            return Forbid();

        // 🔐 Token
        var usuarioToken = new UsuarioMeDto
        {
            IdUsuario = usuarioDb.IdUsuario,
            Login = usuarioDb.Login,
            NombreCompleto = usuarioDb.NombreCompleto,
            Correo = usuarioDb.Correo,
            RolModulo = rolEdd.NombreRol
        };

        var token = _tokenService.GenerarToken(usuarioToken);

        var result = new LoginResultDto
        {
            IdUsuario = usuarioDb.IdUsuario,
            Login = usuarioDb.Login,
            NombreCompleto = usuarioDb.NombreCompleto,
            Correo = usuarioDb.Correo,
            RolModulo = rolEdd.NombreRol,
            DebeCambiarClave = usuarioDb.DebeCambiarClave, // 🔥 CLAVE DEL FLUJO
            Token = token
        };

        return Ok(result);
    }

    // ===============================
    // ME
    // ===============================
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var idUsuario = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var login = User.FindFirstValue(ClaimTypes.Name);
        var correo = User.FindFirstValue(ClaimTypes.Email);
        var rol = User.FindFirstValue(ClaimTypes.Role);
        var nombreCompleto = User.FindFirstValue("nombreCompleto");

        return Ok(new UsuarioMeDto
        {
            IdUsuario = int.TryParse(idUsuario, out var id) ? id : 0,
            Login = login ?? string.Empty,
            NombreCompleto = nombreCompleto ?? string.Empty,
            Correo = correo,
            RolModulo = rol ?? string.Empty
        });
    }

    // ===============================
    // CAMBIAR PASSWORD (USUARIO LOGUEADO)
    // ===============================
    [HttpPut("cambiar-password")]
    [Authorize]
    public async Task<IActionResult> CambiarPassword([FromBody] ResetPasswordDto request)
    {
        if (string.IsNullOrWhiteSpace(request.NuevaClave))
            return BadRequest("La nueva contraseña es obligatoria.");

        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        await _usuarioRepository.CambiarPasswordAsync(idUsuario, request.NuevaClave);

        return Ok(new { mensaje = "Contraseña actualizada correctamente" });
    }
}