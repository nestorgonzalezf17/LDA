using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IItemCargoRepository
{
    Task<IEnumerable<ItemCargoDto>> ListarPorCargoAsync(int idEmpresa, int idCargo);
    Task<int> GuardarAsync(int? idItemCargo, int idEmpresa, int idCargo, int idCompetencia, string textoItem, int? orden);
    Task CambiarEstadoAsync(int idItemCargo, bool activo);
}