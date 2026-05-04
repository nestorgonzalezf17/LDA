namespace EDD.Application.DTOs;

public class CargaMasivaFilaDto
{
    public int NumeroFila { get; set; }
    public string TipoRegistro { get; set; } = string.Empty;
    public string EmpresaNombre { get; set; } = string.Empty;
    public string AreaNombre { get; set; } = string.Empty;
    public string CargoNombre { get; set; } = string.Empty;
    public string ActivoTexto { get; set; } = string.Empty;
}

public class CargaMasivaFilaPreviewDto
{
    public int NumeroFila { get; set; }
    public string TipoRegistro { get; set; } = string.Empty;
    public string EmpresaNombre { get; set; } = string.Empty;
    public string AreaNombre { get; set; } = string.Empty;
    public string CargoNombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public bool EsValida { get; set; }
    public List<string> Errores { get; set; } = [];
    public string AccionSugerida { get; set; } = string.Empty;
}

public class CargaMasivaPreviewResponseDto
{
    public int TotalFilas { get; set; }
    public int FilasValidas { get; set; }
    public int FilasConError { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public List<CargaMasivaFilaPreviewDto> Filas { get; set; } = [];
    public List<string> Advertencias { get; set; } = [];
}

public class CargaMasivaResultadoDto
{
    public int TotalFilasProcesadas { get; set; }
    public int Insertados { get; set; }
    public int ReactivadosOAjustados { get; set; }
    public int Rechazados { get; set; }
    public List<string> Mensajes { get; set; } = [];
}

public class CargaMasivaEmpresaLiteDto
{
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public class CargaMasivaAreaLiteDto
{
    public int IdArea { get; set; }
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public class CargaMasivaCargoLiteDto
{
    public int IdCargo { get; set; }
    public int IdArea { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}