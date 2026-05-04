using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface ITokenService
{
    string GenerarToken(UsuarioMeDto usuario);
}