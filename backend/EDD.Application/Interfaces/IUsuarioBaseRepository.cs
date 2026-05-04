using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IUsuarioBaseRepository
{
    Task<IEnumerable<UsuarioBaseDto>> BuscarAsync(string texto);
}