using EDD.Application.DTOs.EDS;
using EDD.Application.Interfaces.EDS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EDD.Api.Controllers.EDS;

[ApiController]
[Route("api/eds/[controller]")]
public class RespuestasController : ControllerBase
{
    private readonly IRespuestaRepository _repository;

    public RespuestasController(IRespuestaRepository repository)
    {
        _repository = repository;
    }

    [HttpPost("bulk")]
    [AllowAnonymous]
    public async Task<IActionResult> GuardarRespuestasBulk([FromBody] GuardarRespuestasBulkDto dto)
    {
        if (dto == null || dto.IdFormulario <= 0)
        {
            return BadRequest(new { mensaje = "Datos de respuestas inválidos o falta IdFormulario." });
        }

        await _repository.GuardarRespuestasBulkAsync(dto);
        return Ok(new { mensaje = "Respuestas guardadas de forma exitosa." });
    }

    [HttpGet("formulario/{idFormulario:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerRespuestasPorFormulario(int idFormulario)
    {
        if (idFormulario <= 0)
        {
            return BadRequest(new { mensaje = "ID de formulario no válido." });
        }

        var data = await _repository.ObtenerRespuestasPorFormularioAsync(idFormulario);
        return Ok(data);
    }

    [HttpPost("reporte")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerReportePromedios([FromBody] ReporteFiltroDto filtro)
    {
        if (filtro == null)
        {
            return BadRequest(new { mensaje = "Filtros inválidos." });
        }

        if (filtro.AnioInicio > filtro.AnioFin)
        {
            return BadRequest(new { mensaje = "El año inicial no puede ser mayor al año final." });
        }

        var resultado = await _repository.ObtenerReportePromediosAsync(filtro);
        return Ok(resultado);
    }
}
