using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UsuariosAdminController : ControllerBase
{
    private readonly IUsuarioRepository _repo;

    public UsuariosAdminController(IUsuarioRepository repo)
    {
        _repo = repo;
    }

    /// <summary>
    /// Listar usuarios de la aplicación EDD
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var data = await _repo.ListarPorAppAsync("EDD");
        return Ok(data);
    }

    /// <summary>
    /// Crear nuevo usuario
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] UsuarioCreateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Documento))
            return BadRequest("El documento es obligatorio.");

        if (string.IsNullOrWhiteSpace(request.Nombre))
            return BadRequest("El nombre es obligatorio.");

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("El email es obligatorio.");

        if (string.IsNullOrWhiteSpace(request.Clave))
            return BadRequest("La clave es obligatoria.");

        if (string.IsNullOrWhiteSpace(request.Rol))
            return BadRequest("El rol es obligatorio.");

        var idUsuario = await _repo.CrearAsync(request);

        return Ok(new
        {
            mensaje = "Usuario creado correctamente",
            idUsuario
        });
    }

    /// <summary>
    /// Asignar rol a usuario en la app
    /// </summary>
    [HttpPost("{idUsuario}/roles")]
    public async Task<IActionResult> AsignarRol(int idUsuario, [FromBody] UsuarioModuloCreateDto request)
    {
        if (idUsuario <= 0)
            return BadRequest("IdUsuario inválido.");

        if (string.IsNullOrWhiteSpace(request.RolModulo))
            return BadRequest("El rol es obligatorio.");

        var rol = request.RolModulo.Trim().ToUpper();

        if (rol != "ADMIN" && rol != "EVALUADOR")
            return BadRequest("El rol debe ser ADMIN o EVALUADOR.");

        await _repo.AsignarRolAsync(idUsuario, rol, "EDD");

        return Ok(new
        {
            mensaje = "Rol asignado correctamente"
        });
    }

    /// <summary>
    /// Resetear contraseña
    /// </summary>
    [HttpPut("{idUsuario}/reset-password")]
    public async Task<IActionResult> ResetPassword(int idUsuario, [FromBody] ResetPasswordDto request)
    {
        if (idUsuario <= 0)
            return BadRequest("IdUsuario inválido.");

        if (string.IsNullOrWhiteSpace(request.NuevaClave))
            return BadRequest("La nueva clave es obligatoria.");

        await _repo.ResetPasswordAsync(idUsuario, request.NuevaClave);

        return Ok(new
        {
            mensaje = "Contraseña restablecida correctamente"
        });
    }

    /// <summary>
    /// Activar / desactivar usuario
    /// </summary>
    [HttpPut("{idUsuario}/estado")]
    public async Task<IActionResult> CambiarEstado(int idUsuario, [FromBody] bool activo)
    {
        if (idUsuario <= 0)
            return BadRequest("IdUsuario inválido.");

        await _repo.CambiarEstadoAsync(idUsuario, activo);

        return Ok(new
        {
            mensaje = activo ? "Usuario activado" : "Usuario desactivado"
        });
    }
}