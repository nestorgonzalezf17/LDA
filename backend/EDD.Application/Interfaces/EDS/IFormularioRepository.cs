using System.Threading.Tasks;
using EDD.Application.DTOs.EDS;

namespace EDD.Application.Interfaces.EDS;

public interface IFormularioRepository
{
    Task<FormularioNominaCheckResultDto?> VerificarFormularioNominaAsync(string cedula);
    Task<FormularioSaveResultDto> GuardarFormularioAsync(FormularioSaveDto dto);
    Task FinalizarFormularioAsync(int idFormulario);
}
