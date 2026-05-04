using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IPlantillaRepository
{
    Task<PlantillaCabeceraDto?> ObtenerCabeceraAsync(int idEmpresa, int idArea, int idCargo, int idEvaluadorUsuario);
    Task<IEnumerable<PlantillaItemDto>> ObtenerPorCargoAsync(int idEmpresa, int idArea, int idCargo, int idEvaluadorUsuario);
    Task<IEnumerable<EscalaCalificacionDto>> ObtenerEscalaAsync();
}