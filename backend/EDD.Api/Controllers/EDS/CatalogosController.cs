using EDD.Application.Interfaces.EDS;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EDD.Api.Controllers.EDS;

[ApiController]
[Route("api/eds/[controller]")]
public class CatalogosController : ControllerBase
{
    private readonly ICatalogoRepository _repository;

    public CatalogosController(ICatalogoRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerTodos()
    {
        var estadosCiviles = await _repository.ListarEstadosCivilesAsync();
        var escolaridades = await _repository.ListarEscolaridadesAsync();
        var areas = await _repository.ListarAreasAsync();
        var empresas = await _repository.ListarEmpresasAsync();
        var instrumentos = await _repository.ListarInstrumentosAsync();
        var anios = await _repository.ListarAniosEncuestasAsync();

        return Ok(new
        {
            estadosCiviles,
            escolaridades,
            areas,
            empresas,
            instrumentos,
            anios
        });
    }
}
