using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UsuariosModuloController : ControllerBase
{
    private readonly IUsuarioModuloRepository _usuarioModuloRepository;

    public UsuariosModuloController(IUsuarioModuloRepository usuarioModuloRepository)
    {
        _usuarioModuloRepository = usuarioModuloRepository;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _usuarioModuloRepository.ListarAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] UsuarioModuloCreateDto request)
    {
        if (request.IdUsuario <= 0)
            return BadRequest("El IdUsuario es obligatorio.");

        if (string.IsNullOrWhiteSpace(request.RolModulo))
            return BadRequest("El RolModulo es obligatorio.");

        var rol = request.RolModulo.Trim().ToUpperInvariant();

        if (rol != "ADMIN" && rol != "EVALUADOR")
            return BadRequest("El RolModulo debe ser ADMIN o EVALUADOR.");

        await _usuarioModuloRepository.GuardarAsync(request.IdUsuario, rol, request.Activo);

        return Ok(new
        {
            mensaje = "Usuario habilitado correctamente en EDD."
        });
    }

    [HttpPut("{idUsuario:int}")]
    public async Task<IActionResult> Put(int idUsuario, [FromBody] UsuarioModuloCreateDto request)
    {
        if (idUsuario <= 0)
            return BadRequest("El idUsuario es obligatorio.");

        if (string.IsNullOrWhiteSpace(request.RolModulo))
            return BadRequest("El RolModulo es obligatorio.");

        var rol = request.RolModulo.Trim().ToUpperInvariant();

        if (rol != "ADMIN" && rol != "EVALUADOR")
            return BadRequest("El RolModulo debe ser ADMIN o EVALUADOR.");

        await _usuarioModuloRepository.GuardarAsync(idUsuario, rol, request.Activo);

        return Ok(new
        {
            mensaje = "Usuario actualizado correctamente en EDD."
        });
    }

    [HttpDelete("{idUsuario:int}")]
    public async Task<IActionResult> Delete(int idUsuario)
    {
        await _usuarioModuloRepository.EliminarAsync(idUsuario);
        return NoContent();
    }
}