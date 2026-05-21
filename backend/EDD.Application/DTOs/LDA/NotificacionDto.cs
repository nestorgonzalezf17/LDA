using System;

namespace EDD.Application.DTOs.LDA;

public class NotificacionDto
{
    public int IdNotificacion { get; set; }
    public string CedulaEmpleado { get; set; } = string.Empty;
    public string NombreCompletoEmpleado { get; set; } = string.Empty;
    public string PlacaVehiculoAsignado { get; set; } = string.Empty;
    public string TituloRelacionHecho { get; set; } = string.Empty;
    public string TituloTipoCarga { get; set; } = string.Empty;
    public int IdRelacionHecho { get; set; }
    public int IdTipoCarga { get; set; }
    public string? Operacion { get; set; }
    public DateTime FechaHecho { get; set; }
    public DateTime FechaNotificacion { get; set; }
    public string? Registro { get; set; }
}
