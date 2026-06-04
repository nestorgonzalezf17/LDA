using System.Collections.Generic;
using System.Threading.Tasks;
using EDD.Application.DTOs.EDS;

namespace EDD.Application.Interfaces.EDS;

public interface IRespuestaRepository
{
    Task GuardarRespuestasBulkAsync(GuardarRespuestasBulkDto dto);
    Task<IEnumerable<RespuestaObtenidaDto>> ObtenerRespuestasPorFormularioAsync(int idFormulario);
}
