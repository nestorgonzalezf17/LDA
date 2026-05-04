using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AreasController : ControllerBase
{
    private readonly IAreaRepository _repository;

    public AreasController(IAreaRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int? idEmpresa)
    {
        var data = await _repository.ListarAsync(idEmpresa);
        return Ok(data);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Crear([FromBody] AreaSaveDto dto)
    {
        var id = await _repository.GuardarAsync(
            null,
            dto.IdEmpresa,
            dto.Nombre,
            dto.Activo
        );

        return Ok(new { id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] AreaSaveDto dto)
    {
        var idGenerado = await _repository.GuardarAsync(
            id,
            dto.IdEmpresa,
            dto.Nombre,
            dto.Activo
        );

        return Ok(new { id = idGenerado });
    }

    [HttpPatch("{id:int}/estado")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto dto)
    {
        await _repository.CambiarEstadoAsync(id, dto.Activo);
        return NoContent();
    }
}