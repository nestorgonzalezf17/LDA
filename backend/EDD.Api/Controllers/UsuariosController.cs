using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioBaseRepository _usuarioBaseRepository;

    public UsuariosController(IUsuarioBaseRepository usuarioBaseRepository)
    {
        _usuarioBaseRepository = usuarioBaseRepository;
    }

    [HttpGet("buscar")]
    public async Task<IActionResult> Buscar([FromQuery] string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            return BadRequest("El parámetro texto es obligatorio.");

        var usuarios = await _usuarioBaseRepository.BuscarAsync(texto.Trim());
        return Ok(usuarios);
    }
}