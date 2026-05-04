using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface ICargaMasivaRepository
{
    Task<byte[]> GenerarPlantillaAsync();
    Task<CargaMasivaPreviewResponseDto> PreviewAsync(Stream archivoStream, string fileName);
    Task<CargaMasivaResultadoDto> ImportarAsync(Stream archivoStream, string fileName);
}