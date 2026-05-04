using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/carga-masiva")]
[Authorize(Roles = "ADMIN")]
[ApiExplorerSettings(IgnoreApi = true)]
public class CargaMasivaController : ControllerBase
{
    private readonly ICargaMasivaRepository _repository;

    public CargaMasivaController(ICargaMasivaRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("plantilla")]
    public async Task<IActionResult> DescargarPlantilla()
    {
        var bytes = await _repository.GenerarPlantillaAsync();

        return File(
            bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "plantilla-carga-masiva.xlsx"
        );
    }

    [HttpPost("preview")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Preview([FromForm] IFormFile archivo)
    {
        using var stream = archivo.OpenReadStream();
        var result = await _repository.PreviewAsync(stream, archivo.FileName);
        return Ok(result);
    }

    [HttpPost("importar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Importar([FromForm] IFormFile archivo)
    {
        using var stream = archivo.OpenReadStream();
        var result = await _repository.ImportarAsync(stream, archivo.FileName);
        return Ok(result);
    }
}