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

    public async Task<byte[]> GenerarPdfNotificacionAsync(NotificacionSaveDto dto, string rutaPlantilla, string tipoCargaTitulo)
    {
        var fullPath = Path.Combine(Directory.GetCurrentDirectory(), _plantillasPath, rutaPlantilla);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"No se encontró la plantilla PDF en la ruta: {fullPath}");
        }

        try
        {
            // Leemos el archivo a memoria primero para evitar bloqueos de archivo
            byte[] templateBytes = await File.ReadAllBytesAsync(fullPath);
            using var inputStream = new MemoryStream(templateBytes);
            using var outputStream = new MemoryStream();
            
            using (var pdfReader = new PdfReader(inputStream))
            using (var pdfWriter = new PdfWriter(outputStream))
            using (var pdfDocument = new PdfDocument(pdfReader, pdfWriter))
            {
                var form = PdfAcroForm.GetAcroForm(pdfDocument, true);
                var fields = form.GetAllFormFields();

                
                if (fields == null || fields.Count == 0)
                {
                    // Habilitar NeedAppearances para que el visor genere visualmente los campos al modificarlos
                    form.SetNeedAppearances(true);

                    for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
                    {
                        var page = pdfDocument.GetPage(i);
                        var annots = page.GetAnnotations();
                        if (annots == null) continue;

                        foreach (var annot in annots)
                        {
                            if (PdfName.Widget.Equals(annot.GetSubtype()))
                            {
                                var widgetDict = annot.GetPdfObject();
                                
                                // Extraer metadata manualmente
                                var tObj = widgetDict.Get(PdfName.T);
                                var tuObj = widgetDict.Get(PdfName.TU);
                                var vObj = widgetDict.Get(PdfName.V);
                                var dvObj = widgetDict.Get(PdfName.DV);

                                string GetText(iText.Kernel.Pdf.PdfObject obj)
                                {
                                    if (obj is iText.Kernel.Pdf.PdfString str) return str.ToUnicodeString()?.ToLower() ?? str.ToString()?.ToLower() ?? "";
                                    return obj?.ToString()?.ToLower() ?? "";
                                }

                                var keyText = GetText(tObj);
                                var altText = GetText(tuObj);
                                var valText = GetText(vObj);
                                var defaultValText = GetText(dvObj);

                                var searchableText = $"{keyText} {altText} {valText} {defaultValText}";
                                bool ContainsKeywords(params string[] keywords)
                                {
                                    foreach (var kw in keywords) { if (searchableText.Contains(kw.ToLower())) return true; }
                                    return false;
                                }

                                void SetValue(string val)
                                {
                                    widgetDict.Put(PdfName.V, new PdfString(val));
                                    widgetDict.SetModified();
                                }

                                // Mapeo dinámico
                                if (ContainsKeywords("nombre completo del empleado", "nombre del empleado", "nombreempleado")) SetValue(dto.NombreCompletoEmpleado ?? "");
                                else if (ContainsKeywords("cédula del empleado", "cedula del empleado", "cedulaempleado", "cédula", "cedula")) SetValue(dto.CedulaEmpleado ?? "");
                                else if (ContainsKeywords("placa del vehículo asignado", "placa del vehiculo asignado", "placavehiculo", "placa")) SetValue(dto.PlacaVehiculoAsignado ?? "");
                                else if (ContainsKeywords("fecha del hecho", "fecha del hechos", "fechahecho")) SetValue(FormatFechaEspanol(dto.FechaHecho));
                                else if (ContainsKeywords("tipo de carga", "tipocarga")) SetValue(tipoCargaTitulo ?? "");
                                else if (ContainsKeywords("fecha de notificacion", "fecha de notificación", "fechanotificacion")) SetValue(FormatFechaEspanol(System.DateTime.Now));
                                else if (ContainsKeywords("operacion", "operación")) SetValue(dto.Operacion ?? "");
                                else if (ContainsKeywords("registro", "reporte", "descripción", "descripcion")) SetValue(dto.Registro ?? "");
                            }
                        }
                    }
                }
                else
                {

                foreach (var entry in fields)
                {
                    var fieldName = entry.Key;
                    var field = entry.Value;

                    // Extraer metadata de forma ultra-robusta usando ToUnicodeString de iText7
                    var keyText = fieldName.ToLower();
                    var altText = field.GetAlternativeName()?.ToUnicodeString()?.ToLower() ?? field.GetAlternativeName()?.ToString()?.ToLower() ?? "";
                    var valText = field.GetValueAsString()?.ToLower() ?? "";
                    
                    var defaultValText = "";
                    var rawDefault = field.GetDefaultValue();
                    if (rawDefault is iText.Kernel.Pdf.PdfString pdfString)
                    {
                        defaultValText = pdfString.ToUnicodeString()?.ToLower() ?? pdfString.ToString()?.ToLower() ?? "";
                    }
                    else if (rawDefault != null)
                    {
                        defaultValText = rawDefault.ToString()?.ToLower() ?? "";
                    }

                    // Combinar todos los textos para buscar palabras clave de forma flexible
                    var searchableText = $"{keyText} {altText} {valText} {defaultValText}";

                    // Helper local de coincidencia
                    bool ContainsKeywords(params string[] keywords)
                    {
                        foreach (var kw in keywords)
                        {
                            if (searchableText.Contains(kw.ToLower()))
                                return true;
                        }
                        return false;
                    }

                    // Mapeo dinámico e inyección inteligente
                    if (ContainsKeywords("nombre completo del empleado", "nombre del empleado", "nombreempleado"))
                    {
                        field.SetValue(dto.NombreCompletoEmpleado ?? "");
                    }
                    else if (ContainsKeywords("cédula del empleado", "cedula del empleado", "cedulaempleado", "cédula", "cedula"))
                    {
                        field.SetValue(dto.CedulaEmpleado ?? "");
                    }
                    else if (ContainsKeywords("placa del vehículo asignado", "placa del vehiculo asignado", "placavehiculo", "placa"))
                    {
                        field.SetValue(dto.PlacaVehiculoAsignado ?? "");
                    }
                    else if (ContainsKeywords("fecha del hecho", "fecha del hechos", "fechahecho","<FECHA_DE_LOS_HECHOS>"))
                    {
                        field.SetValue(FormatFechaEspanol(dto.FechaHecho));
                    }
                    else if (ContainsKeywords("tipo de carga", "tipocarga"))
                    {
                        field.SetValue(tipoCargaTitulo ?? "");
                    }
                    else if (ContainsKeywords("fecha de notificacion", "fecha de notificación", "fechanotificacion"))
                    {
                        field.SetValue(FormatFechaEspanol(System.DateTime.Now));
                    }
                    else if (ContainsKeywords("operacion", "operación"))
                    {
                        field.SetValue(dto.Operacion ?? "");
                    }
                    else if (ContainsKeywords("registro", "reporte", "descripción", "descripcion"))
                    {
                        field.SetValue(dto.Registro ?? "");
                    }
                }
                }

                // Intentamos aplanar. Si falla, lo saltamos
                try { form.FlattenFields(); } catch { /* Ignorar error de aplanado si ocurre */ }
            }


            return outputStream.ToArray();
        }
        catch (System.Exception ex)
        {
            // Lanzamos una excepción con más detalle
            throw new System.Exception($"Error interno en iText: {ex.Message}. StackTrace: {ex.StackTrace}");
        }
    }

    private void SetFieldIfExist(System.Collections.Generic.IDictionary<string, PdfFormField> fields, string fieldName, string value)
    {
        if (fields.TryGetValue(fieldName, out var field))
        {
            field.SetValue(value ?? string.Empty);
        }
    }

    private string FormatFechaEspanol(System.DateTime fecha)
    {
        return fecha.ToString("d 'de' MMMM 'del' yyyy", new System.Globalization.CultureInfo("es-ES"));
    }
}
