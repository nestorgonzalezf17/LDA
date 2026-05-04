using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportesController : ControllerBase
{
    private readonly IReporteRepository _repository;

    public ReportesController(IReporteRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("areas")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> ObtenerPorArea([FromQuery] int? idEmpresa)
    {
        var esAdmin = User.IsInRole("ADMIN");
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var data = await _repository.ObtenerReportePorAreaAsync(esAdmin, idUsuario, idEmpresa);
        return Ok(data);
    }

    [HttpGet("empleados/buscar")]
    public async Task<IActionResult> BuscarEmpleados([FromQuery] string texto, [FromQuery] int? idEmpresa)
    {
        var data = await _repository.BuscarEmpleadosAsync(texto, idEmpresa);
        return Ok(data);
    }

    [HttpGet("empleados/detalle")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> ObtenerPorEmpleado([FromQuery] string cedula, [FromQuery] int? idEmpresa)
    {
        var data = await _repository.ObtenerReportePorEmpleadoAsync(cedula, idEmpresa);
        return Ok(data);
    }
}