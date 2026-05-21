/*
    SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS PROVISIONAL (DESARROLLO)
    Proyecto: Evaluaciones de Desempeño (EDD)
    
    Este script crea la base de datos, esquemas, tablas y procedimientos almacenados básicos 
    para que el backend pueda funcionar localmente.
*/

USE [master];
GO

-- 1. Crear la Base de Datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EvaluacionesDesempeno')
BEGIN
    CREATE DATABASE [EvaluacionesDesempeno];
END
GO

USE [EvaluacionesDesempeno];
GO

-- 2. Crear Esquemas
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'core')
BEGIN
    EXEC('CREATE SCHEMA [core]');
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'EDD')
BEGIN
    EXEC('CREATE SCHEMA [EDD]');
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'LDA')
BEGIN
    EXEC('CREATE SCHEMA [LDA]');
END
GO

-- 3. Crear Tablas del esquema core (Seguridad)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[core].[Usuarios]') AND type in (N'U'))
BEGIN
    CREATE TABLE [core].[Usuarios](
        [IdUsuario] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Documento] [nvarchar](50) NOT NULL UNIQUE,
        [Nombre] [nvarchar](200) NOT NULL,
        [Email] [nvarchar](255) NOT NULL UNIQUE,
        [PasswordHash] [nvarchar](MAX) NOT NULL,
        [Estado] [bit] NOT NULL DEFAULT 1,
        [FechaCreacion] [datetime] NOT NULL DEFAULT GETDATE(),
        [DebeCambiarClave] [bit] NOT NULL DEFAULT 1
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[core].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [core].[Roles](
        [IdRol] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [NombreRol] [nvarchar](50) NOT NULL UNIQUE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[core].[Aplicaciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE [core].[Aplicaciones](
        [IdApp] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [NombreApp] [nvarchar](100) NOT NULL UNIQUE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[core].[UsuarioRol]') AND type in (N'U'))
BEGIN
    CREATE TABLE [core].[UsuarioRol](
        [IdUsuarioRol] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [IdUsuario] [int] NOT NULL,
        [IdRol] [int] NOT NULL,
        [IdApp] [int] NOT NULL,
        FOREIGN KEY ([IdUsuario]) REFERENCES [core].[Usuarios]([IdUsuario]),
        FOREIGN KEY ([IdRol]) REFERENCES [core].[Roles]([IdRol]),
        FOREIGN KEY ([IdApp]) REFERENCES [core].[Aplicaciones]([IdApp])
    );
END
GO

-- 4. Crear Tablas del esquema EDD (Negocio)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDD].[Empresas]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDD].[Empresas](
        [IdEmpresa] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Nombre] [nvarchar](200) NOT NULL,
        [Codigo] [nvarchar](50) NULL,
        [LogoUrl] [nvarchar](MAX) NULL,
        [Activo] [bit] NOT NULL DEFAULT 1,
        [FechaCreacion] [datetime] NOT NULL DEFAULT GETDATE(),
        [FechaActualizacion] [datetime] NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDD].[Areas]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDD].[Areas](
        [IdArea] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [IdEmpresa] [int] NOT NULL,
        [Nombre] [nvarchar](200) NOT NULL,
        [Activo] [bit] NOT NULL DEFAULT 1,
        FOREIGN KEY ([IdEmpresa]) REFERENCES [EDD].[Empresas]([IdEmpresa])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDD].[Cargos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDD].[Cargos](
        [IdCargo] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [IdEmpresa] [int] NOT NULL,
        [IdArea] [int] NOT NULL,
        [Nombre] [nvarchar](200) NOT NULL,
        [Activo] [bit] NOT NULL DEFAULT 1,
        FOREIGN KEY ([IdEmpresa]) REFERENCES [EDD].[Empresas]([IdEmpresa]),
        FOREIGN KEY ([IdArea]) REFERENCES [EDD].[Areas]([IdArea])
    );
END
GO

-- 4.1 Crear Tablas del esquema LDA (Llamados de Atención / Notificaciones)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[LDA].[RelacionHecho]') AND type in (N'U'))
BEGIN
    CREATE TABLE [LDA].[RelacionHecho](
        [IdRelacionHecho] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [TituloRel] [nvarchar](200) NOT NULL,
        [RutaPlantilla] [nvarchar](255) NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[LDA].[TipoCarga]') AND type in (N'U'))
BEGIN
    CREATE TABLE [LDA].[TipoCarga](
        [IdTipoCarga] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [TituloTipoCarga] [nvarchar](50) NOT NULL,
        [Descripcion] [nvarchar](200) NULL,
        [TipoCarga] [nvarchar](50) NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[LDA].[Notificaciones]') AND type in (N'U'))
BEGIN
    CREATE TABLE [LDA].[Notificaciones](
        [IdNotificacion] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [CedulaEmpleado] [nvarchar](50) NOT NULL,
        [NombreCompletoEmpleado] [nvarchar](200) NOT NULL,
        [PlacaVehiculoAsignado] [nvarchar](50) NOT NULL,
        [IdRelacionHecho] [int] NOT NULL,
        [IdTipoCarga] [int] NOT NULL,
        [Operacion] [nvarchar](200) NULL,
        [FechaHecho] [datetime] NOT NULL,
        [FechaNotificacion] [datetime] NOT NULL DEFAULT GETDATE(),
        [Registro] [nvarchar](MAX) NULL,
        FOREIGN KEY ([IdRelacionHecho]) REFERENCES [LDA].[RelacionHecho]([IdRelacionHecho]),
        FOREIGN KEY ([IdTipoCarga]) REFERENCES [LDA].[TipoCarga]([IdTipoCarga])
    );
END
GO


-- 5. Procedimientos Almacenados (Placeholders funcionales)

-- Login
EXEC('
CREATE OR ALTER PROCEDURE [dbo].[sp_Usuarios_Login_Core]
    @Login NVARCHAR(255),
    @Clave NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Result Set 1: Usuario
    SELECT 
        u.IdUsuario,
        u.Documento,
        u.Nombre,
        u.Email,
        u.PasswordHash,
        u.DebeCambiarClave,
        1 AS LoginValido
    FROM [core].[Usuarios] u
    WHERE u.Email = @Login AND u.Estado = 1;

    -- Result Set 2: Roles
    SELECT 
        r.NombreRol AS Rol,
        a.NombreApp AS Aplicacion
    FROM [core].[UsuarioRol] ur
    JOIN [core].[Roles] r ON ur.IdRol = r.IdRol
    JOIN [core].[Aplicaciones] a ON ur.IdApp = a.IdApp
    JOIN [core].[Usuarios] u ON ur.IdUsuario = u.IdUsuario
    WHERE u.Email = @Login;
END
');
GO

-- Listar Empresas
EXEC('
CREATE OR ALTER PROCEDURE [EDD].[sp_Empresas_Listar]
AS
BEGIN
    SELECT IdEmpresa, Nombre, Codigo, LogoUrl, Activo 
    FROM [EDD].[Empresas]
    ORDER BY Nombre;
END
');
GO

-- Listar Áreas
EXEC('
CREATE OR ALTER PROCEDURE [EDD].[sp_Areas_Listar]
    @IdEmpresa INT = NULL
AS
BEGIN
    SELECT IdArea, IdEmpresa, Nombre, Activo 
    FROM [EDD].[Areas]
    WHERE (@IdEmpresa IS NULL OR IdEmpresa = @IdEmpresa)
    ORDER BY Nombre;
END
');
GO

-- Listar Cargos
EXEC('
CREATE OR ALTER PROCEDURE [EDD].[sp_Cargos_ListarPorArea]
    @IdEmpresa INT,
    @IdArea INT
AS
BEGIN
    SELECT IdCargo, IdEmpresa, IdArea, Nombre, Activo 
    FROM [EDD].[Cargos]
    WHERE IdEmpresa = @IdEmpresa AND IdArea = @IdArea
    ORDER BY Nombre;
END
');
GO

-- 6. Insertar Datos Iniciales
IF NOT EXISTS (SELECT 1 FROM [core].[Roles] WHERE NombreRol = 'ADMIN')
    INSERT INTO [core].[Roles] (NombreRol) VALUES ('ADMIN'), ('EVALUADOR');

IF NOT EXISTS (SELECT 1 FROM [core].[Aplicaciones] WHERE NombreApp = 'EDD')
    INSERT INTO [core].[Aplicaciones] (NombreApp) VALUES ('EDD');

-- Usuario Administrador (Password: Admin123*)
IF NOT EXISTS (SELECT 1 FROM [core].[Usuarios] WHERE Email = 'admin@edd.com')
BEGIN
    INSERT INTO [core].[Usuarios] (Documento, Nombre, Email, PasswordHash, Estado, DebeCambiarClave)
    VALUES ('12345678', 'Admin Inicial', 'admin@edd.com', '$2a$12$4CwnSuJIpnixwDOvbBVV3.L4hbRlEIPG7k3x83x3yJ8fbmlg4iwaa', 1, 0);

    DECLARE @IdUser INT = SCOPE_IDENTITY();
    DECLARE @IdRol INT = (SELECT IdRol FROM [core].[Roles] WHERE NombreRol = 'ADMIN');
    DECLARE @IdApp INT = (SELECT IdApp FROM [core].[Aplicaciones] WHERE NombreApp = 'EDD');

    INSERT INTO [core].[UsuarioRol] (IdUsuario, IdRol, IdApp)
    VALUES (@IdUser, @IdRol, @IdApp);
END
GO

-- Datos iniciales para LDA.RelacionHecho
IF NOT EXISTS (SELECT 1 FROM [LDA].[RelacionHecho])
BEGIN
    INSERT INTO [LDA].[RelacionHecho] (TituloRel, RutaPlantilla) VALUES
    ('DESVIO DE RUTA NO AUTORIZADO', 'DESVIO DE RUTA NO AUTORIZADO.pdf'),
    ('LLAMADO DE ATENCION PARQUEO NO AUTORIZADO', 'PARQUEO EN PUNTO NO AUTORIZADO.pdf'),
    ('PERNOCTACION EN PUNTO NO AUTORIZADO', 'PERNOCTACION EN PUNTO NO AUTORIZADO.pdf'),
    ('INCUMPLIMIENTO DE FRANJA DE DESCANSO', 'INCUMPLIMIENTO DE FRANJA DE DESCANSO.pdf'),
    ('EXCESO DE VELOCIDAD EN CURVA', 'EXCESO DE VELOCIDAD EN CURVA.pdf');
END

-- Datos iniciales para LDA.TipoCarga
IF NOT EXISTS (SELECT 1 FROM [LDA].[TipoCarga])
BEGIN
    INSERT INTO [LDA].[TipoCarga] (TituloTipoCarga, Descripcion, TipoCarga) VALUES
    ('carga seca', 'Objetos contables (televisores)', 'Carga seca'),
    ('carga seca para el cliente Bavaria', 'Carga seca para el cliente Bavaria', 'TEV');
END
GO


-- 7. Crear Usuario de SQL Server para la Aplicación
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'edd_user')
BEGIN
    CREATE LOGIN [edd_user] WITH PASSWORD = 'DevPass123!', DEFAULT_DATABASE = [EvaluacionesDesempeno];
END
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'edd_user')
BEGIN
    CREATE USER [edd_user] FOR LOGIN [edd_user];
    EXEC sp_addrolemember 'db_owner', 'edd_user';
END
GO

PRINT 'Base de datos provisional configurada con éxito.';
