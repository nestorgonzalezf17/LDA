using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IUsuarioRepository
{
   
    Task<List<UsuarioResponseDto>> ListarPorAppAsync(string nombreApp);

   
    Task<int> CrearAsync(UsuarioCreateDto dto);

  
    Task AsignarRolAsync(int idUsuario, string rol, string nombreApp);

   
    Task ResetPasswordAsync(int idUsuario, string nuevaClave);


    Task CambiarEstadoAsync(int idUsuario, bool activo);

    Task CambiarPasswordAsync(int idUsuario, string nuevaClave);
}