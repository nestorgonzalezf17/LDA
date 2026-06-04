using Dapper;
using EDD.Application.DTOs;
using EDD.Application.DTOs.EDS;
using EDD.Application.Interfaces.EDS;
using EDD.Infrastructure.Data;
using System.Data;
using System.Threading.Tasks;

namespace EDD.Infrastructure.Repositories.EDS;

public class FormularioRepository : IFormularioRepository
{
    private readonly DbConnectionFactory _connectionFactory;

    public FormularioRepository(DbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<FormularioNominaCheckResultDto?> VerificarFormularioNominaAsync(string cedula)
    {
        using var connection = _connectionFactory.CreateConnection();
        int anioActual = System.DateTime.Today.Year;

        // 1. Buscar en la tabla [EDS].[Formulario] para el año actual
        var formulario = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT IdFormulario, Cedula, Realizada FROM [EDS].[Formulario] WHERE Cedula = @Cedula AND Anio = @Anio",
            new { Cedula = cedula, Anio = anioActual }
        );

        if (formulario != null)
        {
            bool realizada = formulario.Realizada;
            int idFormulario = formulario.IdFormulario;

            if (realizada)
            {
                return new FormularioNominaCheckResultDto
                {
                    ExisteEnFormulario = true,
                    Realizada = true,
                    IdFormulario = idFormulario,
                    Cedula = cedula,
                    Mensaje = "Usted ya realizó la encuesta este año."
                };
            }
            else
            {
                // Buscar el Nombre del empleado de nómina
                var empleado = await BuscarEmpleadoNominaPorCedulaAsync(connection, cedula);
                string nombreCompleto = empleado != null
                    ? $"{empleado.NombresEmpleado} {empleado.ApellidosEmpleado}".Trim()
                    : "Empleado Registrado";

                return new FormularioNominaCheckResultDto
                {
                    ExisteEnFormulario = true,
                    Realizada = false,
                    IdFormulario = idFormulario,
                    Cedula = cedula,
                    Nombre = nombreCompleto
                };
            }
        }

        // 2. Si no existe en Formulario para este año, buscar en Nómina
        var empleadoNomina = await BuscarEmpleadoNominaPorCedulaAsync(connection, cedula);
        if (empleadoNomina != null)
        {
            string nombreCompleto = $"{empleadoNomina.NombresEmpleado} {empleadoNomina.ApellidosEmpleado}".Trim();
            
            // Buscar si tiene algún formulario de años anteriores para pre-completar sus datos demográficos
            var formularioAnterior = await connection.QueryFirstOrDefaultAsync<FormularioSaveDto>(
                @"SELECT TOP 1 Cedula, IdArea, IdEmpresa, IdestadoCivil AS IdEstadoCivil, IdEscolaridad, cargo AS Cargo, FechaDeNacimiento 
                  FROM [EDS].[Formulario] 
                  WHERE Cedula = @Cedula 
                  ORDER BY Anio DESC",
                new { Cedula = cedula }
            );

            return new FormularioNominaCheckResultDto
            {
                ExisteEnFormulario = false,
                Nombre = nombreCompleto,
                EmpleadoNomina = empleadoNomina,
                FormularioAnterior = formularioAnterior
            };
        }

        // 3. No existe en ninguno
        return null;
    }

    private async Task<EmpleadoNominaDto?> BuscarEmpleadoNominaPorCedulaAsync(IDbConnection connection, string cedulaEmpleado)
    {
        return await connection.QueryFirstOrDefaultAsync<EmpleadoNominaDto>(
            "EDD.sp_Empleado_BuscarPorCedulaNomina",
            new { CedulaEmpleado = cedulaEmpleado },
            commandType: CommandType.StoredProcedure
        );
    }

    public async Task<FormularioSaveResultDto> GuardarFormularioAsync(FormularioSaveDto dto)
    {
        using var connection = _connectionFactory.CreateConnection();
        int anioActual = System.DateTime.Today.Year;

        // 1. Verificar si ya existe en la tabla [EDS].[Formulario] para el año actual
        var formularioExistente = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT IdFormulario, Cedula, IdArea, IdEmpresa, IdestadoCivil, IdEscolaridad, cargo, FechaDeNacimiento, Realizada, Anio FROM [EDS].[Formulario] WHERE Cedula = @Cedula AND Anio = @Anio",
            new { Cedula = dto.Cedula, Anio = anioActual }
        );

        if (formularioExistente != null)
        {
            return new FormularioSaveResultDto
            {
                IdFormulario = formularioExistente.IdFormulario,
                Cedula = formularioExistente.Cedula,
                IdArea = formularioExistente.IdArea,
                IdEmpresa = formularioExistente.IdEmpresa,
                IdEstadoCivil = formularioExistente.IdestadoCivil,
                IdEscolaridad = formularioExistente.IdEscolaridad,
                Cargo = formularioExistente.cargo,
                FechaDeNacimiento = formularioExistente.FechaDeNacimiento,
                Realizada = formularioExistente.Realizada,
                Mensaje = "Ya registro un formulario para este año",
                YaRegistrado = true,
                Anio = formularioExistente.Anio
            };
        }

        // 2. Si no existe, procedemos a realizar el INSERT con el año actual
        var idGenerado = await connection.QuerySingleAsync<int>(
            @"INSERT INTO [EDS].[Formulario] 
              (Cedula, IdArea, IdEmpresa, IdestadoCivil, IdEscolaridad, cargo, FechaDeNacimiento, Realizada, Anio)
              VALUES 
              (@Cedula, @IdArea, @IdEmpresa, @IdEstadoCivil, @IdEscolaridad, @Cargo, @FechaDeNacimiento, 0, @Anio);
              SELECT CAST(SCOPE_IDENTITY() as int);",
            new
            {
                Cedula = dto.Cedula,
                IdArea = dto.IdArea,
                IdEmpresa = dto.IdEmpresa,
                IdEstadoCivil = dto.IdEstadoCivil,
                IdEscolaridad = dto.IdEscolaridad,
                Cargo = dto.Cargo,
                FechaDeNacimiento = dto.FechaDeNacimiento,
                Anio = anioActual
            }
        );

        return new FormularioSaveResultDto
        {
            IdFormulario = idGenerado,
            Cedula = dto.Cedula,
            IdArea = dto.IdArea,
            IdEmpresa = dto.IdEmpresa,
            IdEstadoCivil = dto.IdEstadoCivil,
            IdEscolaridad = dto.IdEscolaridad,
            Cargo = dto.Cargo,
            FechaDeNacimiento = dto.FechaDeNacimiento,
            Realizada = false,
            Mensaje = "Formulario guardado con éxito.",
            YaRegistrado = false,
            Anio = anioActual
        };
    }

    public async Task FinalizarFormularioAsync(int idFormulario)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(
            "UPDATE [EDS].[Formulario] SET Realizada = 1 WHERE IdFormulario = @IdFormulario",
            new { IdFormulario = idFormulario }
        );
    }
}
