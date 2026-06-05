using System.Collections.Generic;
using System.Threading.Tasks;
using EDD.Application.DTOs.EDS;

namespace EDD.Application.Interfaces.EDS;

public interface ICatalogoRepository
{
    Task<IEnumerable<CatalogoDto>> ListarEstadosCivilesAsync();
    Task<IEnumerable<CatalogoDto>> ListarEscolaridadesAsync();
    Task<IEnumerable<CatalogoDto>> ListarAreasAsync();
    Task<IEnumerable<CatalogoDto>> ListarEmpresasAsync();
    Task<IEnumerable<CatalogoDto>> ListarInstrumentosAsync();
}
