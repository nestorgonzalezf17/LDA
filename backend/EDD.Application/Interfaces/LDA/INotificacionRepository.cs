using System.Collections.Generic;
using System.Threading.Tasks;
using EDD.Application.DTOs.LDA;

namespace EDD.Application.Interfaces.LDA;

public interface INotificacionRepository
{
    Task<IEnumerable<NotificacionDto>> ListarAsync(
        string? cedulaEmpleado = null,
        int? idTipoCarga = null,
        string? placa = null,
        string? operacion = null,
        DateTime? fechaHecho = null,
        DateTime? fechaNotificacion = null,
        string? registro = null
    );

    Task<IEnumerable<TipoCargaDto>> ListarTiposCargaAsync();
    Task<IEnumerable<RelacionHechoDto>> ListarRelacionesHechoAsync();

    Task<int> CrearAsync(NotificacionSaveDto dto);
    Task<bool> ActualizarRegistroAsync(int id, string registro);
}
