using System;

namespace EDD.Application.DTOs.EDS;

public class FormularioSaveResultDto
{
    public int IdFormulario { get; set; }
    public string Cedula { get; set; } = string.Empty;
    public int IdArea { get; set; }
    public int IdEmpresa { get; set; }
    public int IdEstadoCivil { get; set; }
    public int IdEscolaridad { get; set; }
    public string Cargo { get; set; } = string.Empty;
    public DateTime FechaDeNacimiento { get; set; }
    public bool Realizada { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public bool YaRegistrado { get; set; }
    public int Anio { get; set; }
}
