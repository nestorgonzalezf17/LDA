using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IAuthRepository
{
    Task<(UsuarioLoginDbDto? Usuario, List<UsuarioRolDto> Roles)> ValidarLoginAsync(string login, string clave);
}