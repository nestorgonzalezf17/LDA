using ClosedXML.Excel;
using Dapper;
using EDD.Application.DTOs;
using EDD.Application.Interfaces;
using EDD.Infrastructure.Data;

namespace EDD.Infrastructure.Repositories;

public class CargaMasivaRepository : ICargaMasivaRepository
{
    private static readonly string[] ColumnasEsperadas =
    [
        "TipoRegistro",
        "EmpresaNombre",
        "AreaNombre",
        "CargoNombre",
        "Activo"
    ];

    private readonly DbConnectionFactory _connectionFactory;
    private readonly IEmpresaRepository _empresaRepository;
    private readonly IAreaRepository _areaRepository;
    private readonly ICargoRepository _cargoRepository;

    public CargaMasivaRepository(
        DbConnectionFactory connectionFactory,
        IEmpresaRepository empresaRepository,
        IAreaRepository areaRepository,
        ICargoRepository cargoRepository)
    {
        _connectionFactory = connectionFactory;
        _empresaRepository = empresaRepository;
        _areaRepository = areaRepository;
        _cargoRepository = cargoRepository;
    }

    public Task<byte[]> GenerarPlantillaAsync()
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("CargaMasiva");

        for (var i = 0; i < ColumnasEsperadas.Length; i++)
        {
            ws.Cell(1, i + 1).Value = ColumnasEsperadas[i];
            ws.Cell(1, i + 1).Style.Font.Bold = true;
        }

        ws.Cell(2, 1).Value = "EMPRESA";
        ws.Cell(2, 2).Value = "ICEBERG";
        ws.Cell(2, 5).Value = "SI";

        ws.Cell(3, 1).Value = "AREA";
        ws.Cell(3, 2).Value = "ICEBERG";
        ws.Cell(3, 3).Value = "SISTEMAS";
        ws.Cell(3, 5).Value = "SI";

        ws.Cell(4, 1).Value = "CARGO";
        ws.Cell(4, 2).Value = "ICEBERG";
        ws.Cell(4, 3).Value = "SISTEMAS";
        ws.Cell(4, 4).Value = "INGENIERO DE SOPORTE";
        ws.Cell(4, 5).Value = "SI";

        ws.Cell(6, 1).Value = "Instrucciones";
        ws.Cell(7, 1).Value = "1. TipoRegistro solo puede ser EMPRESA, AREA o CARGO.";
        ws.Cell(8, 1).Value = "2. No diligenciar códigos; se generan automáticamente.";
        ws.Cell(9, 1).Value = "3. Activo solo puede ser SI o NO.";
        ws.Cell(10, 1).Value = "4. EmpresaNombre es obligatorio para todos los tipos.";
        ws.Cell(11, 1).Value = "5. AreaNombre es obligatorio para AREA y CARGO.";
        ws.Cell(12, 1).Value = "6. CargoNombre es obligatorio para CARGO.";
        ws.Cell(13, 1).Value = "7. Las empresas creadas por carga masiva quedarán sin logo.";
        ws.Cell(14, 1).Value = "8. El logo debe cargarse luego editando la empresa manualmente.";

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }

    public async Task<CargaMasivaPreviewResponseDto> PreviewAsync(Stream archivoStream, string fileName)
    {
        var filas = await LeerArchivoAsync(archivoStream, fileName);
        return await ValidarFilasAsync(filas);
    }

    public async Task<CargaMasivaResultadoDto> ImportarAsync(Stream archivoStream, string fileName)
    {
        var filas = await LeerArchivoAsync(archivoStream, fileName);
        var preview = await ValidarFilasAsync(filas);

        if (preview.FilasConError > 0)
        {
            return new CargaMasivaResultadoDto
            {
                TotalFilasProcesadas = preview.TotalFilas,
                Rechazados = preview.FilasConError,
                Mensajes =
                [
                    "La importación no se ejecutó porque existen filas con error.",
                    "Corrige el archivo según el preview y vuelve a intentarlo."
                ]
            };
        }

        var resultado = new CargaMasivaResultadoDto
        {
            TotalFilasProcesadas = preview.TotalFilas
        };

        var empresas = await ObtenerEmpresasLiteAsync();

        foreach (var fila in preview.Filas.Where(x => x.EsValida))
        {
            var empresaNormalizada = Normalizar(fila.EmpresaNombre);
            var areaNormalizada = Normalizar(fila.AreaNombre);
            var cargoNormalizada = Normalizar(fila.CargoNombre);

            if (fila.TipoRegistro == "EMPRESA")
            {
                var existente = empresas.FirstOrDefault(x => Normalizar(x.Nombre) == empresaNormalizada);

                if (existente is null)
                {
                    var nuevoId = await _empresaRepository.GuardarAsync(
                        null,
                        fila.EmpresaNombre.Trim(),
                        null,
                        null,
                        fila.Activo
                    );

                    empresas.Add(new CargaMasivaEmpresaLiteDto
                    {
                        IdEmpresa = nuevoId,
                        Nombre = fila.EmpresaNombre.Trim(),
                        Activo = fila.Activo
                    });

                    resultado.Insertados++;
                }
                else
                {
                    await _empresaRepository.GuardarAsync(
                        existente.IdEmpresa,
                        fila.EmpresaNombre.Trim(),
                        null,
                        null,
                        fila.Activo
                    );

                    existente.Activo = fila.Activo;
                    resultado.ReactivadosOAjustados++;
                }

                continue;
            }

            var empresa = empresas.First(x => Normalizar(x.Nombre) == empresaNormalizada);

            if (fila.TipoRegistro == "AREA")
            {
                var areasEmpresa = (await _areaRepository.ListarAsync(empresa.IdEmpresa)).ToList();
                var areaExistente = areasEmpresa.FirstOrDefault(x => Normalizar(x.Nombre) == areaNormalizada);

                if (areaExistente is null)
                {
                    await _areaRepository.GuardarAsync(
                        null,
                        empresa.IdEmpresa,
                        fila.AreaNombre.Trim(),
                        fila.Activo
                    );

                    resultado.Insertados++;
                }
                else
                {
                    await _areaRepository.GuardarAsync(
                        areaExistente.IdArea,
                        empresa.IdEmpresa,
                        fila.AreaNombre.Trim(),
                        fila.Activo
                    );

                    resultado.ReactivadosOAjustados++;
                }

                continue;
            }

            var areas = (await _areaRepository.ListarAsync(empresa.IdEmpresa)).ToList();
            var area = areas.First(x => Normalizar(x.Nombre) == areaNormalizada);

            var cargos = (await _cargoRepository.ListarPorAreaAsync(empresa.IdEmpresa, area.IdArea)).ToList();
            var cargoExistente = cargos.FirstOrDefault(x => Normalizar(x.Nombre) == cargoNormalizada);

            if (cargoExistente is null)
            {
                await _cargoRepository.GuardarAsync(
                    null,
                    empresa.IdEmpresa,
                    area.IdArea,
                    fila.CargoNombre.Trim(),
                    fila.Activo
                );

                resultado.Insertados++;
            }
            else
            {
                await _cargoRepository.GuardarAsync(
                    cargoExistente.IdCargo,
                    empresa.IdEmpresa,
                    area.IdArea,
                    fila.CargoNombre.Trim(),
                    fila.Activo
                );

                resultado.ReactivadosOAjustados++;
            }
        }

        resultado.Mensajes.Add("Importación finalizada correctamente.");
        resultado.Mensajes.Add("Las empresas creadas por carga masiva quedan sin logo hasta que el administrador las edite manualmente.");

        return resultado;
    }

    private async Task<List<CargaMasivaFilaDto>> LeerArchivoAsync(Stream archivoStream, string fileName)
    {
        if (archivoStream == null || archivoStream.Length == 0)
            throw new InvalidOperationException("Debe seleccionar un archivo válido.");

        if (!Path.GetExtension(fileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Solo se permiten archivos .xlsx");

        using var memory = new MemoryStream();
        await archivoStream.CopyToAsync(memory);
        memory.Position = 0;

        using var workbook = new XLWorkbook(memory);

        var ws = workbook.Worksheets.FirstOrDefault()
                 ?? throw new InvalidOperationException("El archivo no contiene hojas.");

        ValidarEncabezados(ws);

        var filas = new List<CargaMasivaFilaDto>();
        var lastRow = ws.LastRowUsed()?.RowNumber() ?? 1;

        for (var row = 2; row <= lastRow; row++)
        {
            var tipo = ws.Cell(row, 1).GetString();
            var empresa = ws.Cell(row, 2).GetString();
            var area = ws.Cell(row, 3).GetString();
            var cargo = ws.Cell(row, 4).GetString();
            var activo = ws.Cell(row, 5).GetString();

            if (string.IsNullOrWhiteSpace(tipo) &&
                string.IsNullOrWhiteSpace(empresa) &&
                string.IsNullOrWhiteSpace(area) &&
                string.IsNullOrWhiteSpace(cargo) &&
                string.IsNullOrWhiteSpace(activo))
            {
                continue;
            }

            filas.Add(new CargaMasivaFilaDto
            {
                NumeroFila = row,
                TipoRegistro = tipo,
                EmpresaNombre = empresa,
                AreaNombre = area,
                CargoNombre = cargo,
                ActivoTexto = activo
            });
        }

        return filas;
    }

    private static void ValidarEncabezados(IXLWorksheet ws)
    {
        for (var i = 0; i < ColumnasEsperadas.Length; i++)
        {
            var valor = ws.Cell(1, i + 1).GetString()?.Trim() ?? string.Empty;
            if (!valor.Equals(ColumnasEsperadas[i], StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    $"La columna {i + 1} debe llamarse '{ColumnasEsperadas[i]}'."
                );
            }
        }
    }

    private async Task<CargaMasivaPreviewResponseDto> ValidarFilasAsync(List<CargaMasivaFilaDto> filas)
    {
        var empresasBd = await ObtenerEmpresasLiteAsync();

        var preview = new CargaMasivaPreviewResponseDto
        {
            TotalFilas = filas.Count
        };

        var clavesArchivo = new HashSet<string>();

        foreach (var fila in filas)
        {
            var previewFila = new CargaMasivaFilaPreviewDto
            {
                NumeroFila = fila.NumeroFila,
                TipoRegistro = Normalizar(fila.TipoRegistro),
                EmpresaNombre = fila.EmpresaNombre?.Trim() ?? string.Empty,
                AreaNombre = fila.AreaNombre?.Trim() ?? string.Empty,
                CargoNombre = fila.CargoNombre?.Trim() ?? string.Empty,
                Activo = ParseActivo(fila.ActivoTexto)
            };

            if (string.IsNullOrWhiteSpace(previewFila.TipoRegistro))
                previewFila.Errores.Add("TipoRegistro es obligatorio.");

            if (!new[] { "EMPRESA", "AREA", "CARGO" }.Contains(previewFila.TipoRegistro))
                previewFila.Errores.Add("TipoRegistro solo puede ser EMPRESA, AREA o CARGO.");

            if (string.IsNullOrWhiteSpace(previewFila.EmpresaNombre))
                previewFila.Errores.Add("EmpresaNombre es obligatorio.");

            if (previewFila.TipoRegistro == "AREA" || previewFila.TipoRegistro == "CARGO")
            {
                if (string.IsNullOrWhiteSpace(previewFila.AreaNombre))
                    previewFila.Errores.Add("AreaNombre es obligatorio para AREA y CARGO.");
            }

            if (previewFila.TipoRegistro == "CARGO")
            {
                if (string.IsNullOrWhiteSpace(previewFila.CargoNombre))
                    previewFila.Errores.Add("CargoNombre es obligatorio para CARGO.");
            }

            if (!EsActivoValido(fila.ActivoTexto))
                previewFila.Errores.Add("Activo solo puede ser SI o NO.");

            var clave = previewFila.TipoRegistro switch
            {
                "EMPRESA" => $"EMPRESA|{Normalizar(previewFila.EmpresaNombre)}",
                "AREA" => $"AREA|{Normalizar(previewFila.EmpresaNombre)}|{Normalizar(previewFila.AreaNombre)}",
                "CARGO" => $"CARGO|{Normalizar(previewFila.EmpresaNombre)}|{Normalizar(previewFila.AreaNombre)}|{Normalizar(previewFila.CargoNombre)}",
                _ => $"INVALIDO|{fila.NumeroFila}"
            };

            if (!clavesArchivo.Add(clave))
                previewFila.Errores.Add("La fila está duplicada dentro del archivo.");

            if (previewFila.Errores.Count == 0)
            {
                if (previewFila.TipoRegistro == "EMPRESA")
                {
                    var empresa = empresasBd.FirstOrDefault(x => Normalizar(x.Nombre) == Normalizar(previewFila.EmpresaNombre));

                    previewFila.AccionSugerida = empresa is null
                        ? "Se insertará empresa nueva sin logo."
                        : empresa.Activo
                            ? "Ya existe empresa activa; se actualizará estado si aplica."
                            : "Ya existe empresa inactiva; se reactivará.";
                }
                else if (previewFila.TipoRegistro == "AREA")
                {
                    var empresa = empresasBd.FirstOrDefault(x => Normalizar(x.Nombre) == Normalizar(previewFila.EmpresaNombre));

                    if (empresa is null)
                    {
                        previewFila.Errores.Add("La empresa no existe en BD ni puede inferirse en preview.");
                    }
                    else
                    {
                        var areas = (await _areaRepository.ListarAsync(empresa.IdEmpresa)).ToList();
                        var area = areas.FirstOrDefault(x => Normalizar(x.Nombre) == Normalizar(previewFila.AreaNombre));

                        previewFila.AccionSugerida = area is null
                            ? "Se insertará área nueva."
                            : area.Activo
                                ? "Ya existe área activa; se actualizará estado si aplica."
                                : "Ya existe área inactiva; se reactivará.";
                    }
                }
                else if (previewFila.TipoRegistro == "CARGO")
                {
                    var empresa = empresasBd.FirstOrDefault(x => Normalizar(x.Nombre) == Normalizar(previewFila.EmpresaNombre));

                    if (empresa is null)
                    {
                        previewFila.Errores.Add("La empresa no existe en BD ni puede inferirse en preview.");
                    }
                    else
                    {
                        var areas = (await _areaRepository.ListarAsync(empresa.IdEmpresa)).ToList();
                        var area = areas.FirstOrDefault(x => Normalizar(x.Nombre) == Normalizar(previewFila.AreaNombre));

                        if (area is null)
                        {
                            previewFila.Errores.Add("El área no existe para la empresa indicada.");
                        }
                        else
                        {
                            var cargos = (await _cargoRepository.ListarPorAreaAsync(empresa.IdEmpresa, area.IdArea)).ToList();
                            var cargo = cargos.FirstOrDefault(x => Normalizar(x.Nombre) == Normalizar(previewFila.CargoNombre));

                            previewFila.AccionSugerida = cargo is null
                                ? "Se insertará cargo nuevo."
                                : cargo.Activo
                                    ? "Ya existe cargo activo; se actualizará estado si aplica."
                                    : "Ya existe cargo inactivo; se reactivará.";
                        }
                    }
                }
            }

            previewFila.EsValida = previewFila.Errores.Count == 0;
            preview.Filas.Add(previewFila);
        }

        preview.FilasValidas = preview.Filas.Count(x => x.EsValida);
        preview.FilasConError = preview.Filas.Count(x => !x.EsValida);
        preview.Mensaje = preview.FilasConError == 0
            ? "Archivo válido para importar."
            : "El archivo contiene errores y debe corregirse antes de importar.";

        preview.Advertencias.Add("Las empresas creadas por carga masiva quedarán sin logo.");
        preview.Advertencias.Add("El logo deberá cargarse luego desde el módulo Empresas.");

        return preview;
    }

    private async Task<List<CargaMasivaEmpresaLiteDto>> ObtenerEmpresasLiteAsync()
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
SELECT
    IdEmpresa,
    Nombre,
    Activo
FROM EDD.Empresas
ORDER BY Nombre;";

        var data = await connection.QueryAsync<CargaMasivaEmpresaLiteDto>(sql);
        return data.ToList();
    }

    private static string Normalizar(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
            return string.Empty;

        var partes = valor
            .Trim()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return string.Join(" ", partes).ToUpperInvariant();
    }

    private static bool EsActivoValido(string? valor)
        => ParseActivoNullable(valor).HasValue;

    private static bool ParseActivo(string? valor)
        => ParseActivoNullable(valor) ?? false;

    private static bool? ParseActivoNullable(string? valor)
    {
        var normalizado = Normalizar(valor);

        return normalizado switch
        {
            "SI" => true,
            "NO" => false,
            _ => null
        };
    }
}