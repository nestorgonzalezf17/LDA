using EDD.Application.Interfaces.EDS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EDD.Api.Controllers.EDS;

[ApiController]
[Route("api/eds/[controller]")]
public class InstrumentosController : ControllerBase
{
    private readonly IInstrumentoRepository _repository;

    public InstrumentosController(IInstrumentoRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("{id:int}/arbol")]
    public async Task<IActionResult> ObtenerArbol(int id)
    {
        var data = await _repository.ObtenerArbolPorInstrumentoAsync(id);

        if (data == null || data.Count == 0)
        {
            return NotFound(new { mensaje = $"No se encontró información o el instrumento con ID {id} no existe." });
        }

        return Ok(data);
    }

    [HttpGet("arbol-completo")]
    [AllowAnonymous]
    public async Task<IActionResult> ObtenerArbolCompleto()
    {
        var data = await _repository.ObtenerArbolCompletoAsync();

        if (data == null || data.Count == 0)
        {
            return NotFound(new { mensaje = "No se encontró información del árbol de la encuesta." });
        }

        return Ok(data);
    }
}
