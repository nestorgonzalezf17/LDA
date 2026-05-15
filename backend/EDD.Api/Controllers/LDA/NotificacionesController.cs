using System.Collections.Generic;
using System.Threading.Tasks;
using EDD.Application.DTOs.LDA;
using EDD.Application.Interfaces.LDA;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDD.Api.Controllers.LDA;

[ApiController]
[Route("api/lda/[controller]")]
[Authorize]
public class NotificacionesController : ControllerBase
{
    private readonly INotificacionRepository _repository;

    public NotificacionesController(INotificacionRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? cedulaEmpleado,
        [FromQuery] int? idTipoCarga,
        [FromQuery] string? placa,
        [FromQuery] string? operacion,
        [FromQuery] DateTime? fechaHecho,
        [FromQuery] DateTime? fechaNotificacion,
        [FromQuery] string? registro)
    {
        var data = await _repository.ListarAsync(
            cedulaEmpleado, idTipoCarga, placa, operacion, fechaHecho, fechaNotificacion, registro);
        return Ok(data);
    }

    [HttpGet("catalogos/tipo-carga")]
    public async Task<IActionResult> GetTiposCarga()
    {
        var data = await _repository.ListarTiposCargaAsync();
        return Ok(data);
    }

    [HttpGet("catalogos/relacion-hecho")]
    public async Task<IActionResult> GetRelacionesHecho()
    {
        var data = await _repository.ListarRelacionesHechoAsync();
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] NotificacionSaveDto dto)
    {
        var id = await _repository.CrearAsync(dto);
        return Ok(new { id });
    }

    [HttpPut("{id:int}/registro")]
    public async Task<IActionResult> PutRegistro(int id, [FromBody] string registro)
    {
        var success = await _repository.ActualizarRegistroAsync(id, registro);
        if (!success) return NotFound();
        return NoContent();
    }
}
