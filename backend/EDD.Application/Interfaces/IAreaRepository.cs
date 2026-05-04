using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IAreaRepository
{
    Task<IEnumerable<AreaDto>> ListarAsync(int? idEmpresa);
    Task<int> GuardarAsync(int? idArea, int idEmpresa, string nombre, bool activo);
    Task CambiarEstadoAsync(int idArea, bool activo);
}