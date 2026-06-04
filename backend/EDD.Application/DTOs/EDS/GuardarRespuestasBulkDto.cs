using System.Collections.Generic;

namespace EDD.Application.DTOs.EDS;

public class GuardarRespuestasBulkDto
{
    public int IdFormulario { get; set; }
    public List<GuardarRespuestaDto> Respuestas { get; set; } = new();
}
