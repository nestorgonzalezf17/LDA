using EDD.Application.DTOs.EDS;
using EDD.Application.Interfaces.EDS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EDD.Api.Controllers.EDS;

[ApiController]
[Route("api/eds/[controller]")]
public class FormulariosController : ControllerBase
{
    private readonly IFormularioRepository _repository;

    public FormulariosController(IFormularioRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("cedula-formulario-nomina/{cedula}")]
    [AllowAnonymous]
    public async Task<IActionResult> VerificarCedulaFormularioNomina(string cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula))
        {
            return BadRequest(new
            {
                mensaje = "Debe ingresar una cédula válida."
            });
        }

        var resultado = await _repository.VerificarFormularioNominaAsync(cedula.Trim());

        if (resultado is null)
        {
            return NotFound(new
            {
                mensaje = "No se encuentra registrado, revise su cedula o pongase en contacto usted puede estar inactivo."
            });
        }

        return Ok(resultado);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> GuardarFormulario([FromBody] FormularioSaveDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Cedula))
        {
            return BadRequest(new { mensaje = "Datos del formulario inválidos." });
        }

        var resultado = await _repository.GuardarFormularioAsync(dto);
        return Ok(resultado);
    }

    [HttpPost("{idFormulario:int}/finalizar")]
    [AllowAnonymous]
    public async Task<IActionResult> FinalizarFormulario(int idFormulario)
    {
        if (idFormulario <= 0)
        {
            return BadRequest(new { mensaje = "ID de formulario no válido." });
        }

        await _repository.FinalizarFormularioAsync(idFormulario);
        return Ok(new { mensaje = "Encuesta finalizada y guardada con éxito." });
    }
}
