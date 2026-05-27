using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvaluacionesController : ControllerBase
{
    private readonly IEvaluacionRepository _repository;

    public EvaluacionesController(IEvaluacionRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("empleado-nomina/{cedula}")]
    [AllowAnonymous]
    public async Task<IActionResult> BuscarEmpleadoNominaPorCedula(string cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula))
        {
            return BadRequest(new
            {
                mensaje = "Debe ingresar una cédula válida."
            });
        }

        var empleado = await _repository.BuscarEmpleadoNominaPorCedulaAsync(cedula.Trim());

        if (empleado is null)
        {
            return NotFound(new
            {
                mensaje = "No se puede crear la evaluación porque el empleado no existe en la base de datos de nómina, o se encuentra inactivo o retirado."
            });
        }

        return Ok(empleado);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] EvaluacionCreateDto dto)
    {
        var idEvaluadorUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var id = await _repository.CrearAsync(
            dto.IdEmpresa,
            dto.IdArea,
            dto.IdCargo,
            idEvaluadorUsuario,
            dto.NombresEmpleado,
            dto.ApellidosEmpleado,
            dto.CedulaEmpleado,
            dto.PeriodoEvaluado,
            dto.Observaciones
        );

        return Ok(new { id });
    }

    [HttpPut("{id:long}/respuestas")]
    public async Task<IActionResult> GuardarRespuestas(long id, [FromBody] List<EvaluacionRespuestaItemDto> respuestas)
    {
        await _repository.GuardarRespuestasAsync(id, respuestas);
        return NoContent();
    }

    [HttpPut("{id:long}/finalizar")]
    public async Task<IActionResult> Finalizar(long id)
    {
        await _repository.FinalizarAsync(id);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] int? idEmpresa,
        [FromQuery] int? idArea,
        [FromQuery] int? idCargo,
        [FromQuery] string? cedula,
        [FromQuery] DateTime? fechaDesde,
        [FromQuery] DateTime? fechaHasta)
    {
        var esAdmin = User.IsInRole("ADMIN");
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var data = await _repository.ListarAsync(
            idEmpresa,
            idArea,
            idCargo,
            cedula,
            fechaDesde,
            fechaHasta,
            esAdmin,
            idUsuario
        );

        return Ok(data);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> ObtenerDetalle(long id)
    {
        var esAdmin = User.IsInRole("ADMIN");
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var data = await _repository.ObtenerDetalleAsync(id, esAdmin, idUsuario);
        return Ok(data);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> EliminarBorrador(long id)
    {
        var esAdmin = User.IsInRole("ADMIN");
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        await _repository.EliminarBorradorAsync(id, esAdmin, idUsuario);
        return NoContent();
    }

    [HttpGet("{id:long}/edicion")]
    public async Task<IActionResult> ObtenerParaEdicion(long id)
    {
        var esAdmin = User.IsInRole("ADMIN");
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var data = await _repository.ObtenerParaEdicionAsync(id, esAdmin, idUsuario);

        if (data is null)
            return NotFound();

        return Ok(data);
    }
}