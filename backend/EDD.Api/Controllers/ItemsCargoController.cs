using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemsCargoController : ControllerBase
{
    private readonly IItemCargoRepository _repository;

    public ItemsCargoController(IItemCargoRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarPorCargo([FromQuery] int idEmpresa, [FromQuery] int idCargo)
    {
        var data = await _repository.ListarPorCargoAsync(idEmpresa, idCargo);
        return Ok(data);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Crear([FromBody] ItemCargoCreateDto dto)
    {
        var id = await _repository.GuardarAsync(
            null,
            dto.IdEmpresa,
            dto.IdCargo,
            dto.IdCompetencia,
            dto.TextoItem,
            dto.Orden
        );

        return Ok(new { id });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ItemCargoCreateDto dto)
    {
        var idGenerado = await _repository.GuardarAsync(
            id,
            dto.IdEmpresa,
            dto.IdCargo,
            dto.IdCompetencia,
            dto.TextoItem,
            dto.Orden
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