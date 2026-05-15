using System;

namespace EDD.Application.DTOs.LDA;

public class NotificacionSaveDto
{
    public string CedulaEmpleado { get; set; } = string.Empty;
    public string NombreCompletoEmpleado { get; set; } = string.Empty;
    public string PlacaVehiculoAsignado { get; set; } = string.Empty;
    public int IdRelacionHecho { get; set; }
    public int IdTipoCarga { get; set; }
    public string? Operacion { get; set; }
    public DateTime FechaHecho { get; set; }
    public string? Registro { get; set; }
}
