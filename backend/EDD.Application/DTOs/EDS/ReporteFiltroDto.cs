using System.Collections.Generic;

namespace EDD.Application.DTOs.EDS;

public class ReporteFiltroDto
{
    public List<int> IdAreas { get; set; } = new();
    public int? IdInst { get; set; }
    public int AnioInicio { get; set; }
    public int AnioFin { get; set; }
}
