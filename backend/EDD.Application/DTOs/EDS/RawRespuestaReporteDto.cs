namespace EDD.Application.DTOs.EDS;

public class RawRespuestaReporteDto
{
    public int Anio { get; set; }
    public int IdArea { get; set; }
    public string NombreArea { get; set; } = string.Empty;
    public int IdInst { get; set; }
    public string NombreInstrumento { get; set; } = string.Empty;
    public int Calificacion { get; set; }
}
