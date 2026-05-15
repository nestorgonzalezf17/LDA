using System.Threading.Tasks;
using EDD.Application.DTOs.LDA;

namespace EDD.Application.Interfaces.LDA;

public interface IPdfService
{
    Task<byte[]> GenerarPdfNotificacionAsync(NotificacionSaveDto dto, string rutaPlantilla);
}
