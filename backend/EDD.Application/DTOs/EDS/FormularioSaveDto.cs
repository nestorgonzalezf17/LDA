using System;

namespace EDD.Application.DTOs.EDS;

public class FormularioSaveDto
{
    public string Cedula { get; set; } = string.Empty;
    public int IdArea { get; set; }
    public int IdEmpresa { get; set; }
    public int IdEstadoCivil { get; set; }
    public int IdEscolaridad { get; set; }
    public string Cargo { get; set; } = string.Empty;
    public DateTime FechaDeNacimiento { get; set; }
}
