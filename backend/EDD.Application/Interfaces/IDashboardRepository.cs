using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardResponseDto> ObtenerAsync(bool esAdmin, int idUsuario, int? idEmpresa);
}