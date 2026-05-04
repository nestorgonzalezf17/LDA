using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IUsuarioModuloRepository
{
    Task<IEnumerable<UsuarioModuloDto>> ListarAsync();
    Task GuardarAsync(int idUsuario, string rolModulo, bool activo);
    Task EliminarAsync(int idUsuario);
}