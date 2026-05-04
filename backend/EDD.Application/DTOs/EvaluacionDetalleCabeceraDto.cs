namespace EDD.Application.DTOs;

public class EvaluacionDetalleCabeceraDto
{
    public long IdEvaluacion { get; set; }

    public int IdEmpresa { get; set; }
    public string Empresa { get; set; } = string.Empty;
    public string? LogoEmpresa { get; set; }

    public int IdArea { get; set; }
    public string AreaODependencia { get; set; } = string.Empty;

    public int IdCargo { get; set; }
    public string CargoEvaluado { get; set; } = string.Empty;

    public string NombresEmpleado { get; set; } = string.Empty;
    public string ApellidosEmpleado { get; set; } = string.Empty;
    public string CedulaEmpleado { get; set; } = string.Empty;

    public string PeriodoEvaluado { get; set; } = "1 Año";
    public string Fecha { get; set; } = string.Empty;

    public string Estado { get; set; } = string.Empty;
    public DateTime FechaEvaluacion { get; set; }
    public DateTime? FechaFinalizacion { get; set; }

    public string JefeInmediatoEvaluador { get; set; } = string.Empty;
    public int IdEvaluadorUsuario { get; set; }

    public decimal? CalificacionTotal { get; set; }

    public string TituloSistema { get; set; } = string.Empty;
    public string TituloFormato { get; set; } = string.Empty;
    public string CodigoFormato { get; set; } = string.Empty;
    public string VersionFormato { get; set; } = string.Empty;
    public string FechaFormato { get; set; } = string.Empty;
}