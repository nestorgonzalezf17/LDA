using System.Collections.Generic;
using System.Threading.Tasks;
using EDD.Application.DTOs.EDS;

namespace EDD.Application.Interfaces.EDS;

public interface IInstrumentoRepository
{
    Task<Dictionary<string, Dictionary<string, Dictionary<string, List<PreguntaDto>>>>> ObtenerArbolPorInstrumentoAsync(int idInst);
    Task<Dictionary<string, Dictionary<string, Dictionary<string, List<PreguntaDto>>>>> ObtenerArbolCompletoAsync();
}
