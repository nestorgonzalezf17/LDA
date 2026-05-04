using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EDD.Application.Interfaces;
using EDD.Application.DTOs;

[ApiController]
[Route("api/[controller]")]
public class EmpresasController : ControllerBase
{
    private readonly IEmpresaRepository _empresaRepository;

    public EmpresasController(IEmpresaRepository empresaRepository)
    {
        _empresaRepository = empresaRepository;
    }

    // =========================
    // LISTAR
    // =========================
    [HttpGet("listar")]
    [Authorize]
    public async Task<IActionResult> Listar()
    {
        var empresas = await _empresaRepository.ListarAsync();

        var result = empresas.Select(e => new
        {
            e.IdEmpresa,
            e.Nombre,
            e.Codigo,
            logoUrl = e.LogoUrl,
            e.Activo,
            e.FechaCreacion,
            e.FechaActualizacion
        });

        return Ok(result);
    }

   
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Actualizar(int id, [FromBody] EmpresaSaveDto dto)
    {
        if (dto == null)
            return BadRequest();

        var result = await _empresaRepository.GuardarAsync(
            id,
            dto.Nombre,
            dto.Codigo,
            dto.LogoUrl,
            dto.Activo
        );

        return Ok(new { id = result });
    }

    // =========================
    // SUBIR LOGO
    // =========================
    [HttpPost("{id}/logo")]
    [Authorize]
    public async Task<IActionResult> SubirLogo(int id, IFormFile archivo)
    {
        if (archivo == null || archivo.Length == 0)
            return BadRequest("Archivo inválido");

        var uploadsFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "uploads",
            "logos",
            "empresas"
        );

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}_{archivo.FileName}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        var relativePath = $"uploads/logos/empresas/{fileName}";

        await _empresaRepository.ActualizarLogoAsync(id, relativePath);

        return Ok(new { logoUrl = relativePath });
    }

 
}