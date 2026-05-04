using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _repository;

    public DashboardController(IDashboardRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener([FromQuery] int? idEmpresa)
    {
        var esAdmin = User.IsInRole("ADMIN");
        var idUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var data = await _repository.ObtenerAsync(esAdmin, idUsuario, idEmpresa);
        return Ok(data);
    }
}