using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EDD.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlantillaController : ControllerBase
{
    private readonly IPlantillaRepository _repository;

    public PlantillaController(IPlantillaRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> Obtener(
        [FromQuery] int idEmpresa,
        [FromQuery] int idArea,
        [FromQuery] int idCargo)
    {
        var idEvaluadorUsuario = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var cabecera = await _repository.ObtenerCabeceraAsync(
            idEmpresa,
            idArea,
            idCargo,
            idEvaluadorUsuario
        );

        var items = await _repository.ObtenerPorCargoAsync(
            idEmpresa,
            idArea,
            idCargo,
            idEvaluadorUsuario
        );

        var escala = await _repository.ObtenerEscalaAsync();

        var response = new PlantillaCargoResponseDto
        {
            IdEmpresa = idEmpresa,
            IdArea = idArea,
            IdCargo = idCargo,
            Cabecera = cabecera,
            Escala = escala.ToList(),
            Secciones = items
                .GroupBy(x => new { x.IdSeccion, x.Seccion, x.OrdenSeccion })
                .OrderBy(g => g.Key.OrdenSeccion)
                .Select(g => new PlantillaSeccionResponseDto
                {
                    IdSeccion = g.Key.IdSeccion,
                    Seccion = g.Key.Seccion,
                    OrdenSeccion = g.Key.OrdenSeccion,
                    Competencias = g
                        .GroupBy(i => new { i.IdCompetencia, i.Competencia, i.OrdenCompetencia })
                        .OrderBy(c => c.Key.OrdenCompetencia)
                        .Select(c => new PlantillaCompetenciaResponseDto
                        {
                            IdCompetencia = c.Key.IdCompetencia,
                            Competencia = c.Key.Competencia,
                            OrdenCompetencia = c.Key.OrdenCompetencia,
                            Items = c
                                .OrderBy(i => i.OrdenItem)
                                .Select(i => new PlantillaItemResponseDto
                                {
                                    TipoItem = i.TipoItem,
                                    IdItem = i.IdItem,
                                    TextoItem = i.TextoItem,
                                    OrdenItem = i.OrdenItem
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .ToList()
        };

        return Ok(response);
    }
}