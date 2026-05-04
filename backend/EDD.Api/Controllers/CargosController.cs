using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CargosController : ControllerBase
{
    private readonly ICargoRepository _repository;

    public CargosController(ICargoRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarPorArea([FromQuery] int idEmpresa, [FromQuery] int idArea)
    {
        var data = await _repository.ListarPorAreaAsync(idEmpresa, idArea);
        return Ok(data);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Crear([FromBody] CargoSaveDto dto)
    {
        var id = await _repository.GuardarAsync(
            null,
            dto.IdEmpresa,
            dto.IdArea,
            dto.Nombre,
            dto.Activo
        );

        return Ok(new { id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] CargoSaveDto dto)
    {
        var idGenerado = await _repository.GuardarAsync(
            id,
            dto.IdEmpresa,
            dto.IdArea,
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