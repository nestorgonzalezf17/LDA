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
    private readonly IPdfService _pdfService;

    public NotificacionesController(INotificacionRepository repository, IPdfService pdfService)
    {
        _repository = repository;
        _pdfService = pdfService;
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

    [HttpPost("preview")]
    public async Task<IActionResult> Preview([FromBody] NotificacionSaveDto dto)
    {
        // Obtener la ruta de la plantilla usando el IdRelacionHecho
        var relaciones = await _repository.ListarRelacionesHechoAsync();
        var relacion = System.Linq.Enumerable.FirstOrDefault(relaciones, r => r.IdRelacionHecho == dto.IdRelacionHecho);

        if (relacion == null || string.IsNullOrEmpty(relacion.RutaPlantilla))
        {
            return BadRequest(new { mensaje = "El hecho seleccionado no tiene una plantilla asociada." });
        }

        // Obtener el título del tipo de carga seleccionado para el PDF
        var tiposCarga = await _repository.ListarTiposCargaAsync();
        var tipoCarga = System.Linq.Enumerable.FirstOrDefault(tiposCarga, t => t.IdTipoCarga == dto.IdTipoCarga);
        var tipoCargaTitulo = tipoCarga?.TituloTipoCarga ?? string.Empty;

        try
        {
            var pdfBytes = await _pdfService.GenerarPdfNotificacionAsync(dto, relacion.RutaPlantilla, tipoCargaTitulo);
            return File(pdfBytes, "application/pdf");
        }
        catch (System.IO.FileNotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, new { mensaje = "Error al generar la previsualización: " + ex.Message });
        }
    }
}
