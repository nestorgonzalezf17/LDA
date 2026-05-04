namespace EDD.Application.DTOs;

public class ArchivoSubidoDto
{
    public string NombreArchivo { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string RutaRelativa { get; set; } = string.Empty;
    public long TamanoBytes { get; set; }
}