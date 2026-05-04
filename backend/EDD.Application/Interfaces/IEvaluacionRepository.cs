using EDD.Application.DTOs;

namespace EDD.Application.Interfaces;

public interface IEvaluacionRepository
{
    Task<long> CrearAsync(
        int idEmpresa,
        int idArea,
        int idCargo,
        int idEvaluadorUsuario,
        string nombresEmpleado,
        string apellidosEmpleado,
        string cedulaEmpleado,
        string periodoEvaluado,
        string? observaciones);

    Task GuardarRespuestasAsync(long idEvaluacion, List<EvaluacionRespuestaItemDto> respuestas);

    Task FinalizarAsync(long idEvaluacion);

    Task<IEnumerable<EvaluacionListDto>> ListarAsync(
        int? idEmpresa,
        int? idArea,
        int? idCargo,
        string? cedulaEmpleado,
        DateTime? fechaDesde,
        DateTime? fechaHasta,
        bool esAdmin,
        int idUsuario);

    Task<EvaluacionDetalleDto> ObtenerDetalleAsync(
        long idEvaluacion,
        bool esAdmin,
        int idUsuario);

    Task EliminarBorradorAsync(long idEvaluacion, bool esAdmin, int idUsuario);

    Task<EvaluacionEdicionDto?> ObtenerParaEdicionAsync(long idEvaluacion, bool esAdmin, int idUsuario);

    Task<EmpleadoNominaDto?> BuscarEmpleadoNominaPorCedulaAsync(string cedulaEmpleado);
}