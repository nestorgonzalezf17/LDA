using System.Collections.Generic;

namespace EDD.Application.DTOs.EDS;

public class ReportePromedioDto
{
    public int Anio { get; set; }
    public decimal PromedioGeneral { get; set; }
    public List<InstrumentoPromedioDto> PromediosPorInstrumento { get; set; } = new();
    public List<AreaPromedioDto> PromediosPorArea { get; set; } = new();
}

public class InstrumentoPromedioDto
{
    public int IdInst { get; set; }
    public string NombreInstrumento { get; set; } = string.Empty;
    public decimal Promedio { get; set; }
}

public class AreaPromedioDto
{
    public int IdArea { get; set; }
    public string NombreArea { get; set; } = string.Empty;
    public decimal Promedio { get; set; }
}
