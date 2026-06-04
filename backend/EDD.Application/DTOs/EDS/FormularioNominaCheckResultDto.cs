using System;

namespace EDD.Application.DTOs.EDS;

public class FormularioNominaCheckResultDto
{
    public bool ExisteEnFormulario { get; set; }
    public int? IdFormulario { get; set; }
    public string? Cedula { get; set; }
    public string? Nombre { get; set; }
    public bool? Realizada { get; set; }
    public string? Mensaje { get; set; }
    public EmpleadoNominaDto? EmpleadoNomina { get; set; }
    public FormularioSaveDto? FormularioAnterior { get; set; }
}
