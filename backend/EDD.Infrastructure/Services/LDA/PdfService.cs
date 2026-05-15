using System.IO;
using System.Threading.Tasks;
using EDD.Application.DTOs.LDA;
using EDD.Application.Interfaces.LDA;
using iText.Forms;
using iText.Forms.Fields;
using iText.Kernel.Pdf;
using Microsoft.Extensions.Configuration;

namespace EDD.Infrastructure.Services.LDA;

public class PdfService : IPdfService
{
    private readonly string _plantillasPath;

    public PdfService(IConfiguration configuration)
    {
        _plantillasPath = configuration["LdaSettings:PlantillasPath"] 
            ?? throw new System.Exception("LdaSettings:PlantillasPath no está configurado.");
    }

    public async Task<byte[]> GenerarPdfNotificacionAsync(NotificacionSaveDto dto, string rutaPlantilla)
    {
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), _plantillasPath, rutaPlantilla);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"No se encontró la plantilla PDF en la ruta: {fullPath}");
        }

        using var memoryStream = new MemoryStream();
        
        using (var pdfReader = new PdfReader(fullPath))
        using (var pdfWriter = new PdfWriter(memoryStream))
        using (var pdfDocument = new PdfDocument(pdfReader, pdfWriter))
        {
            var form = PdfAcroForm.GetAcroForm(pdfDocument, true);
            var fields = form.GetAllFormFields();

            // Rellenar los campos si existen en el PDF
            SetFieldIfExist(fields, "NombreEmpleado", dto.NombreCompletoEmpleado);
            SetFieldIfExist(fields, "CedulaEmpleado", dto.CedulaEmpleado);
            SetFieldIfExist(fields, "PlacaVehiculo", dto.PlacaVehiculoAsignado);
            SetFieldIfExist(fields, "FechaHecho", dto.FechaHecho.ToString("yyyy-MM-dd"));
            SetFieldIfExist(fields, "FechaNotificacion", System.DateTime.Now.ToString("yyyy-MM-dd"));

            // Aplanar el formulario para que no se pueda editar más
            form.FlattenFields();
        }

        return await Task.FromResult(memoryStream.ToArray());
    }

    private void SetFieldIfExist(System.Collections.Generic.IDictionary<string, PdfFormField> fields, string fieldName, string value)
    {
        if (fields.TryGetValue(fieldName, out var field))
        {
            field.SetValue(value ?? string.Empty);
        }
    }
}
