USE [GTHS];
GO

-- =================================================================================
-- 1. Proceso Almacenado Unificado y Flexible (Filtros Opcionales)
-- =================================================================================
IF OBJECT_ID('[EDS].[ObtenerArbolCompleto]', 'P') IS NOT NULL
    DROP PROCEDURE [EDS].[ObtenerArbolCompleto];
GO

CREATE PROCEDURE [EDS].[ObtenerArbolCompleto]
    @IdInst INT = NULL,
    @IdTiVa INT = NULL,
    @IdSuVa INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.[Titulo] AS [TituloInstrumento],
        tv.[Titulo] AS [TituloTipoVaria],
        sv.[Titulo] AS [TituloSubVaria],
        its.[IdItem] AS [IdItem],
        its.[Enunciado]
    FROM [EDS].[Instrumento] i
    INNER JOIN [EDS].[TipoVaria] tv ON i.[IdInst] = tv.[IdInst]
    INNER JOIN [EDS].[SubVariable] sv ON tv.[IdTiVa] = sv.[IdTiVa]
    INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
    WHERE (@IdInst IS NULL OR i.[IdInst] = @IdInst)
      AND (@IdTiVa IS NULL OR tv.[IdTiVa] = @IdTiVa)
      AND (@IdSuVa IS NULL OR sv.[IdSuVa] = @IdSuVa)
    ORDER BY i.[IdInst], tv.[IdTiVa], sv.[IdSuVa], its.[IdItem];
END
GO

-- =================================================================================
-- 2. Proceso Almacenado Específico para un Instrumento por ID
-- =================================================================================
IF OBJECT_ID('[EDS].[ObtenerArbolPorInstrumento]', 'P') IS NOT NULL
    DROP PROCEDURE [EDS].[ObtenerArbolPorInstrumento];
GO

CREATE PROCEDURE [EDS].[ObtenerArbolPorInstrumento]
    @IdInst INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.[Titulo] AS [TituloInstrumento],
        tv.[Titulo] AS [TituloTipoVaria],
        sv.[Titulo] AS [TituloSubVaria],
        its.[IdItem] AS [IdItem],
        its.[Enunciado]
    FROM [EDS].[Instrumento] i
    INNER JOIN [EDS].[TipoVaria] tv ON i.[IdInst] = tv.[IdInst]
    INNER JOIN [EDS].[SubVariable] sv ON tv.[IdTiVa] = sv.[IdTiVa]
    INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
    WHERE i.[IdInst] = @IdInst
    ORDER BY tv.[IdTiVa], sv.[IdSuVa], its.[IdItem];
END
GO

-- =================================================================================
-- 3. Proceso Almacenado Específico para un Tipo de Variable por ID
-- =================================================================================
IF OBJECT_ID('[EDS].[ObtenerArbolPorTipoVaria]', 'P') IS NOT NULL
    DROP PROCEDURE [EDS].[ObtenerArbolPorTipoVaria];
GO

CREATE PROCEDURE [EDS].[ObtenerArbolPorTipoVaria]
    @IdTiVa INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.[Titulo] AS [TituloInstrumento],
        tv.[Titulo] AS [TituloTipoVaria],
        sv.[Titulo] AS [TituloSubVaria],
        its.[Enunciado]
    FROM [EDS].[Instrumento] i
    INNER JOIN [EDS].[TipoVaria] tv ON i.[IdInst] = tv.[IdInst]
    INNER JOIN [EDS].[SubVariable] sv ON tv.[IdTiVa] = sv.[IdTiVa]
    INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
    WHERE tv.[IdTiVa] = @IdTiVa
    ORDER BY sv.[IdSuVa], its.[IdItem];
END
GO

-- =================================================================================
-- 4. Proceso Almacenado Específico para una Subvariable por ID
-- =================================================================================
IF OBJECT_ID('[EDS].[ObtenerArbolPorSubVar]', 'P') IS NOT NULL
    DROP PROCEDURE [EDS].[ObtenerArbolPorSubVar];
GO

CREATE PROCEDURE [EDS].[ObtenerArbolPorSubVar]
    @IdSuVa INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.[Titulo] AS [TituloInstrumento],
        tv.[Titulo] AS [TituloTipoVaria],
        sv.[Titulo] AS [TituloSubVaria],
        its.[Enunciado]
    FROM [EDS].[Instrumento] i
    INNER JOIN [EDS].[TipoVaria] tv ON i.[IdInst] = tv.[IdInst]
    INNER JOIN [EDS].[SubVariable] sv ON tv.[IdTiVa] = sv.[IdTiVa]
    INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
    WHERE sv.[IdSuVa] = @IdSuVa
    ORDER BY its.[IdItem];
END
GO

PRINT '¡Procesos almacenados creados/actualizados con éxito en el esquema [EDS]!';
