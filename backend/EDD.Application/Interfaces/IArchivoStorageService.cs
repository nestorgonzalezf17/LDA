using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IArchivoStorageService
{
    Task<ArchivoSubidoDto> GuardarLogoEmpresaAsync(
        Stream contenido,
        string nombreArchivoOriginal,
        string baseUrl);
}