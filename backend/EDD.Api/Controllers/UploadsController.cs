using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UploadsController : ControllerBase
{
    private readonly IArchivoStorageService _archivoStorageService;

    public UploadsController(IArchivoStorageService archivoStorageService)
    {
        _archivoStorageService = archivoStorageService;
    }

    [HttpPost("logo-empresa")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> SubirLogoEmpresa(IFormFile archivo)
    {
        if (archivo == null || archivo.Length == 0)
            return BadRequest(new { mensaje = "No se recibió ningún archivo." });

        var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
        var extensionesPermitidas = new[] { ".png", ".jpg", ".jpeg", ".webp" };

        if (!extensionesPermitidas.Contains(extension))
            return BadRequest(new { mensaje = "Solo se permiten archivos PNG, JPG, JPEG o WEBP." });

        if (archivo.Length > 5 * 1024 * 1024)
            return BadRequest(new { mensaje = "El archivo supera el tamaño máximo permitido de 5 MB." });

        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        await using var stream = archivo.OpenReadStream();
        var resultado = await _archivoStorageService.GuardarLogoEmpresaAsync(
            stream,
            archivo.FileName,
            baseUrl);

        return Ok(resultado);
    }
}