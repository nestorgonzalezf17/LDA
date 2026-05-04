using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace EDD.Infrastructure.Services;

public class ArchivoStorageService : IArchivoStorageService
{
    private readonly IWebHostEnvironment _environment;

    private static readonly string[] ExtensionesPermitidas = [".png", ".jpg", ".jpeg", ".webp"];
    private const long TamanoMaximoBytes = 5 * 1024 * 1024;

    public ArchivoStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<ArchivoSubidoDto> GuardarLogoEmpresaAsync(
        Stream contenido,
        string nombreArchivoOriginal,
        string baseUrl 
    )
    {
        if (contenido == null)
            throw new InvalidOperationException("No se recibió contenido de archivo.");

        if (string.IsNullOrWhiteSpace(nombreArchivoOriginal))
            throw new InvalidOperationException("El archivo no tiene un nombre válido.");

        var extension = Path.GetExtension(nombreArchivoOriginal).ToLowerInvariant();

        if (!ExtensionesPermitidas.Contains(extension))
            throw new InvalidOperationException("Solo se permiten archivos PNG, JPG, JPEG o WEBP.");

        if (contenido.CanSeek && contenido.Length > TamanoMaximoBytes)
            throw new InvalidOperationException("El archivo supera el tamaño máximo permitido de 5 MB.");

        
        var carpetaRelativa = Path.Combine("uploads", "logos", "empresas");
        var carpetaFisica = Path.Combine(_environment.WebRootPath, carpetaRelativa);

        if (!Directory.Exists(carpetaFisica))
            Directory.CreateDirectory(carpetaFisica);

        
        var nombreBase = Path.GetFileNameWithoutExtension(nombreArchivoOriginal)
            .Trim()
            .Replace(" ", "_");

        foreach (var c in Path.GetInvalidFileNameChars())
            nombreBase = nombreBase.Replace(c.ToString(), string.Empty);

        if (string.IsNullOrWhiteSpace(nombreBase))
            nombreBase = "logo_empresa";

        
        var nombreArchivo = $"{nombreBase}_{DateTime.Now:yyyyMMdd_HHmmssfff}{extension}";
        var rutaFisicaCompleta = Path.Combine(carpetaFisica, nombreArchivo);

        
        await using (var fileStream = new FileStream(rutaFisicaCompleta, FileMode.Create))
        {
            await contenido.CopyToAsync(fileStream);
        }

        
        var rutaRelativa = $"uploads/logos/empresas/{nombreArchivo}";

        var tamanoBytes = contenido.CanSeek ? contenido.Length : 0;

        return new ArchivoSubidoDto
        {
            NombreArchivo = nombreArchivo,
            Url = rutaRelativa,         
            RutaRelativa = rutaRelativa,
            TamanoBytes = tamanoBytes
        };
    }
}