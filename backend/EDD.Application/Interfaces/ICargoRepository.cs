using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface ICargoRepository
{
    Task<IEnumerable<CargoDto>> ListarPorAreaAsync(int idEmpresa, int idArea);
    Task<int> GuardarAsync(int? idCargo, int idEmpresa, int idArea, string nombre, bool activo);
    Task CambiarEstadoAsync(int idCargo, bool activo);
}