using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IEmpresaRepository
{
    Task<IEnumerable<EmpresaDto>> ListarAsync();
    Task<int> GuardarAsync(int? idEmpresa, string nombre, string? codigo, string? logoUrl, bool activo);
    Task CambiarEstadoAsync(int idEmpresa, bool activo);
    Task ActualizarLogoAsync(int idEmpresa, string logoUrl);
}