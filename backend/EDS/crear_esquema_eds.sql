/*
    SCRIPT DE GENERACIÓN DE ESQUEMA Y DATOS EDS
    Base de Datos: solucion1
    Generado automáticamente desde script de Python.
*/

USE [solucion1];
GO

-- 1. Crear el esquema EDS si no existe
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'EDS')
BEGIN
    EXEC('CREATE SCHEMA [EDS]');
END
GO

-- 2. Creación de Tablas

-- Escolaridad
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[Escolaridad]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[Escolaridad](
        [IdEsco] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Titulo] [nvarchar](100) NOT NULL
    );
END
GO

-- EstadoCivil
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[EstadoCivil]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[EstadoCivil](
        [IdEstC] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Titulo] [nvarchar](100) NOT NULL
    );
END
GO

-- AreaEDS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[AreaEDS]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[AreaEDS](
        [IdArea] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Titulo] [nvarchar](100) NOT NULL
    );
END
GO

-- Instrumento
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[Instrumento]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[Instrumento](
        [IdInst] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [Titulo] [nvarchar](200) NOT NULL
    );
END
GO

-- TipoVaria
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[TipoVaria]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[TipoVaria](
        [IdTiVa] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [IdInst] [int] NOT NULL,
        [Titulo] [nvarchar](200) NOT NULL,
        FOREIGN KEY ([IdInst]) REFERENCES [EDS].[Instrumento]([IdInst])
    );
END
GO

-- SubVariable
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[SubVariable]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[SubVariable](
        [IdSuVa] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [IdTiVa] [int] NOT NULL,
        [Titulo] [nvarchar](200) NOT NULL,
        FOREIGN KEY ([IdTiVa]) REFERENCES [EDS].[TipoVaria]([IdTiVa])
    );
END
GO

-- ItemSat
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[ItemSat]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[ItemSat](
        [IdItem] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [IdSubVaria] [int] NOT NULL,
        [Enunciado] [nvarchar](MAX) NOT NULL,
        FOREIGN KEY ([IdSubVaria]) REFERENCES [EDS].[SubVariable]([IdSuVa])
    );
END
GO

-- 3. Inserción de Datos

PRINT 'Insertando en [EDS].[Escolaridad]...';
SET IDENTITY_INSERT [EDS].[Escolaridad] ON;
IF NOT EXISTS (SELECT 1 FROM [EDS].[Escolaridad] WHERE [IdEsco] = 1)
    INSERT INTO [EDS].[Escolaridad] ([IdEsco], [Titulo]) VALUES (1, 'Estudiante Universitario');
IF NOT EXISTS (SELECT 1 FROM [EDS].[Escolaridad] WHERE [IdEsco] = 2)
    INSERT INTO [EDS].[Escolaridad] ([IdEsco], [Titulo]) VALUES (2, 'tecnico otecnologo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[Escolaridad] WHERE [IdEsco] = 3)
    INSERT INTO [EDS].[Escolaridad] ([IdEsco], [Titulo]) VALUES (3, 'profesional');
IF NOT EXISTS (SELECT 1 FROM [EDS].[Escolaridad] WHERE [IdEsco] = 4)
    INSERT INTO [EDS].[Escolaridad] ([IdEsco], [Titulo]) VALUES (4, 'profesional con especializacion');
IF NOT EXISTS (SELECT 1 FROM [EDS].[Escolaridad] WHERE [IdEsco] = 5)
    INSERT INTO [EDS].[Escolaridad] ([IdEsco], [Titulo]) VALUES (5, 'bachiller');
IF NOT EXISTS (SELECT 1 FROM [EDS].[Escolaridad] WHERE [IdEsco] = 6)
    INSERT INTO [EDS].[Escolaridad] ([IdEsco], [Titulo]) VALUES (6, 'sin estudio');
SET IDENTITY_INSERT [EDS].[Escolaridad] OFF;
GO

PRINT 'Insertando en [EDS].[EstadoCivil]...';
SET IDENTITY_INSERT [EDS].[EstadoCivil] ON;
IF NOT EXISTS (SELECT 1 FROM [EDS].[EstadoCivil] WHERE [IdEstC] = 1)
    INSERT INTO [EDS].[EstadoCivil] ([IdEstC], [Titulo]) VALUES (1, 'casado');
IF NOT EXISTS (SELECT 1 FROM [EDS].[EstadoCivil] WHERE [IdEstC] = 2)
    INSERT INTO [EDS].[EstadoCivil] ([IdEstC], [Titulo]) VALUES (2, 'separado');
IF NOT EXISTS (SELECT 1 FROM [EDS].[EstadoCivil] WHERE [IdEstC] = 3)
    INSERT INTO [EDS].[EstadoCivil] ([IdEstC], [Titulo]) VALUES (3, 'viudo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[EstadoCivil] WHERE [IdEstC] = 4)
    INSERT INTO [EDS].[EstadoCivil] ([IdEstC], [Titulo]) VALUES (4, 'union libre');
IF NOT EXISTS (SELECT 1 FROM [EDS].[EstadoCivil] WHERE [IdEstC] = 5)
    INSERT INTO [EDS].[EstadoCivil] ([IdEstC], [Titulo]) VALUES (5, 'soltero');
SET IDENTITY_INSERT [EDS].[EstadoCivil] OFF;
GO

PRINT 'Insertando en [EDS].[AreaEDS]...';
SET IDENTITY_INSERT [EDS].[AreaEDS] ON;
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 1)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (1, 'talento humano');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 2)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (2, 'ciclos y procesos');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 3)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (3, 'nomina');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 4)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (4, 'sistemas');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 5)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (5, 'trafico');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 6)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (6, 'carga seca');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 7)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (7, 'carga liquida');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 8)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (8, 'tev');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 9)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (9, 'hseq');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 10)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (10, 'mantenimiento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 11)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (11, 'compras');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 12)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (12, 'almacen');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 13)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (13, 'contabilidad');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 14)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (14, 'servicio al cliente');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 15)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (15, 'comercial');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 16)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (16, 'conductores');
IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = 17)
    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES (17, 'tesoreria');
SET IDENTITY_INSERT [EDS].[AreaEDS] OFF;
GO

PRINT 'Insertando en [EDS].[Instrumento]...';
SET IDENTITY_INSERT [EDS].[Instrumento] ON;
IF NOT EXISTS (SELECT 1 FROM [EDS].[Instrumento] WHERE [IdInst] = 1)
    INSERT INTO [EDS].[Instrumento] ([IdInst], [Titulo]) VALUES (1, 'Clima y Cultura');
IF NOT EXISTS (SELECT 1 FROM [EDS].[Instrumento] WHERE [IdInst] = 2)
    INSERT INTO [EDS].[Instrumento] ([IdInst], [Titulo]) VALUES (2, 'Liderazgo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[Instrumento] WHERE [IdInst] = 3)
    INSERT INTO [EDS].[Instrumento] ([IdInst], [Titulo]) VALUES (3, 'Microclima (En mi Área)');
SET IDENTITY_INSERT [EDS].[Instrumento] OFF;
GO

PRINT 'Insertando en [EDS].[TipoVaria]...';
SET IDENTITY_INSERT [EDS].[TipoVaria] ON;
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 1)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (1, 1, 'Dirección Estratégica');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 2)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (2, 1, 'Gestión del Talento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 3)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (3, 1, 'Liderazgo Organizacional');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 4)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (4, 1, 'RSE');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 5)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (5, 1, 'Satisfacción');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 6)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (6, 1, 'Valores');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 7)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (7, 2, 'Crear Contexto');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 8)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (8, 2, 'Operar Contexto');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 9)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (9, 2, 'Sostener Contexto');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 10)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (10, 3, 'Comunicación y Relaciones');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 11)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (11, 3, 'Planeación y Objetivos');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 12)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (12, 3, 'Roles');
IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = 13)
    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES (13, 3, 'Toma de Decisiones');
SET IDENTITY_INSERT [EDS].[TipoVaria] OFF;
GO

PRINT 'Insertando en [EDS].[SubVariable]...';
SET IDENTITY_INSERT [EDS].[SubVariable] ON;
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 1)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (1, 1, 'Comunicación Organizacional');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 2)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (2, 1, 'Alineación y Procesos');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 3)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (3, 1, 'Aprendizaje');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 4)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (4, 1, 'Direccionamiento y Orientación a Resultados');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 5)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (5, 1, 'Servicio al Cliente');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 6)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (6, 2, 'Reconocimiento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 7)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (7, 2, 'Aprendizaje y Desarrollo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 8)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (8, 2, 'Retroalimentación y Seguimiento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 9)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (9, 3, 'Liderazgo Organizacional');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 10)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (10, 4, 'Clientes');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 11)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (11, 4, 'Derechos Humanos');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 12)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (12, 4, 'Medio Ambiente');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 13)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (13, 4, 'Rendición de Cuentas');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 14)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (14, 4, 'Sociedad');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 15)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (15, 5, 'Ambiente Estimulante');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 16)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (16, 5, 'Balance Vida Personal y Laboral');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 17)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (17, 5, 'Bienestar');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 18)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (18, 5, 'Posicionamiento y Orgullo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 19)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (19, 5, 'Satisfacción con el Cargo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 20)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (20, 6, 'Valores');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 21)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (21, 7, 'Direccionamiento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 22)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (22, 7, 'Inspirar');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 23)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (23, 8, 'Apoyo y Acompañamiento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 24)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (24, 8, 'Roles');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 25)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (25, 8, 'Seguimiento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 26)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (26, 9, 'Desarrollo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 27)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (27, 9, 'Motivación y Reconocimiento');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 28)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (28, 9, 'Retroalimentar');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 29)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (29, 10, 'Comunicación');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 30)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (30, 10, 'Relaciones');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 31)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (31, 11, 'Planeación y Objetivos');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 32)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (32, 12, 'Roles');
IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVariable] WHERE [IdSuVa] = 33)
    INSERT INTO [EDS].[SubVariable] ([IdSuVa], [IdTiVa], [Titulo]) VALUES (33, 13, 'Toma de Decisiones');
SET IDENTITY_INSERT [EDS].[SubVariable] OFF;
GO

PRINT 'Insertando en [EDS].[ItemSat]...';
SET IDENTITY_INSERT [EDS].[ItemSat] ON;
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 1)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (1, 1, 'Puedo acceder de manera fácil y oportuna a la información actualizada que requiero para hacer mi trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 2)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (2, 2, 'La estructura y los procesos de la empresa facilita el logro de los Objetivos de la organización.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 3)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (3, 2, 'Las Áreas de la organización interactúan y comparten sus prácticas y la información para hacer mejor su trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 4)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (4, 3, 'En la organización, aprendemos de las situaciones pasadas.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 5)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (5, 3, 'La organización es un lugar donde se puede crear e innovar.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 6)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (6, 4, 'En la organización se hace seguimiento al progreso y logro de los objetivos y metas.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 7)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (7, 4, 'Conozco la Misión, Visión y objetivos estratégicos de la Compañía.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 8)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (8, 5, 'En la organización estamos orientados a lograr la excelencia en el servicio que nuestros clientes requieren.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 9)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (9, 5, 'Todos trabajamos constantemente en función de mejorar el servicio que brinda la organización.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 10)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (10, 5, 'la organización cuenta con mecanismos que permiten conocer el nivel de satisfacción de nuestros clientes.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 11)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (11, 2, 'Los mecanismos utilizados por la organización para informarme acerca del sistema de gestión de la calidad han sido efectivos.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 12)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (12, 1, 'La Empresa difunde clara y oportunamente la información sobre los cambios que ocurren en la Compañía.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 13)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (13, 1, 'En la Organización usamos de forma adecuada los canales diseñados para difundir la información.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 14)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (14, 6, 'La organización valora y apoya las personas que se destacan por la calidad y oportunidad de su trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 15)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (15, 7, 'Nuestra organización facilita que yo obtenga la formación necesaria para desarrollar y fortalecer mis habilidades.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 16)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (16, 7, 'Las personas que se vinculan o cambian de cargo reciben entrenamiento y la inducción necesaria para realizar su trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 17)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (17, 7, 'En la organización se respetan los requisitos exigidos para los ascensos.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 18)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (18, 7, 'La compañía nos prepara para enfrentar los nuevos retos.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 19)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (19, 7, 'Pienso que Se implementa de manera correcta el sistema de seguridad y salud en el trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 20)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (20, 7, 'Pienso que el comité convivencia laboral opera de manera correcta en la compañía.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 21)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (21, 7, 'Pienso que el COPASST se implementa de manera adecuada en la compañía.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 22)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (22, 6, 'En la organización se hacen reconocimientos y/o estímulos no economicos para incentivar el trabajo bien hecho.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 23)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (23, 8, 'Conozco los criterios y/o indicadores para evaluar mi trabajo y mis resultados.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 24)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (24, 8, 'Recibo retroalimentación oportuna con respecto a mi desempeño.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 25)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (25, 9, 'El Equipo Directivo de la organización tiene una VISION clara hacia donde queremos llegar.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 26)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (26, 9, 'Los Directivos de la organización muestran un comportamiento ético consistente con los valores de la organización.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 27)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (27, 9, 'La relación que existe entre los colaboradores y los Directivos de la organización es cordial y cooperativa.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 28)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (28, 9, 'Los Líderes tratan a los colaboradores como el bien más valioso de la organización.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 29)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (29, 9, 'Podría decir que los Líderes en esta organización son un modelo a seguir.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 30)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (30, 10, 'Mi Compañía implementa acciones que demuestran su preocupación y cuidado por el interés de sus usuarios y/o clientes.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 31)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (31, 11, 'Mi compañía vela por que tanto hombres como mujeres tengamos los mismos derechos y deberes.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 32)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (32, 11, 'Mi compañía es una organización con buena gestión de la diversidad, donde convivimos de manera armónica diferentes razas, culturas, edades, etc.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 33)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (33, 12, 'Mi Compañía implementa, a nivel externo, programas para reducir o minimizar la contaminación directa e indirecta que tiene sobre el medio ambiente.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 34)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (34, 12, 'Mi compañía implementa a nivel interno acciones para el manejo y reducción de energía, agua y residuos (reciclaje).');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 35)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (35, 13, 'Mi Compañía posee mecanismos de comunicación hacia adentro y hacia fuera de la organización, para mostrar los resultados financieros, económicos y sociales de su operación.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 36)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (36, 14, 'Mi compañía impulsa acciones sociales enfocadas a mejorar nuestra sociedad y me permite participar de manera voluntaria en estas iniciativas de responsabilidad social empresarial.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 37)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (37, 15, 'El Ambiente que se vive en la organización es el adecuado para hacer mi trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 38)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (38, 16, 'El balance entre mi trabajo y mi vida personal, es el adecuado para mi calidad de vida.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 39)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (39, 17, 'El plan de BIENESTAR esta estructurado deacuerdo a las necesidades de los Colaboradores que pertenecen a la Compañía..');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 40)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (40, 17, 'En la organización contamos con los medios que facilitan el acceso a planes y programas de salud, bienestar, recreación y deporte.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 41)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (41, 17, 'la organización se interesa por incentivar mi participación en actividades Culturales');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 42)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (42, 18, 'Estoy orgulloso(a) de contarles a otras personas que trabajo aquí.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 43)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (43, 18, 'Considero que la organización es una excelente empresa para trabajar.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 44)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (44, 18, 'Considero que la organización es una entidad LIDER en el negocio.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 45)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (45, 19, 'Estoy satisfecho con el cargo que desempeño en la empresa.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 46)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (46, 19, 'El trabajo que desempeño me permite desarrollarme como persona.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 47)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (47, 15, 'Las condiciones físicas en mi puesto de trabajo (limpieza, iluminación, espacio, seguridad, ventilación, etc.) me permiten desempeñarme con tranquilidad y concentración.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 48)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (48, 17, 'En la organización se realizan actividades de Seguridad y Salud en el Trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 49)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (49, 17, 'En la organización se realizan actividades que contribuyen al bienestar de mi familia.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 50)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (50, 17, 'La organización realiza programas que contribuyen al bienestar y mejoramiento de mi calidad de vida.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 51)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (51, 17, 'Indique su grado de satisfacción con respecto a la actividad "Día de la madre"');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 52)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (52, 17, 'Indique su grado de satisfacción con respecto a la actividad "Día del padre"');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 53)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (53, 17, 'Indique su grado de satisfacción con respecto a la actividad "Amor y Amistad" Photocabine, Teleton Dulcera y Ayuda a un Amigo');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 54)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (54, 17, 'Indique su grado de satisfacción con respecto a la actividad "Hallowen"');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 55)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (55, 20, 'En la organización asumimos y cumplimos los compromisos que adquirimos.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 56)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (56, 20, 'En la organización estamos comprometidos con el medio ambiente.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 57)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (57, 20, 'La organización es transparente en sus actuaciones, generando seguridad y confianza en sus clientes y empleados.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 58)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (58, 20, 'Los miembros de la organización se comportan de forma transparente consistente con nuestros principios y Valores.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 59)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (59, 21, 'Mi jefe inmediato asigna el trabajo, dando claridad sobre el resultado que espera.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 60)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (60, 21, 'Siento que mi Jefe nos direcciona de manera adecuada.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 61)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (61, 22, 'Mi jefe crea un ambiente que inspira confianza.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 62)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (62, 22, 'La forma en como mi jefe plantea los retos y objetivos nos inspira y reta a conseguirlos.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 63)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (63, 22, 'Mi Jefe es un modelo a seguir.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 64)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (64, 23, 'Cuando tengo dificultades en mi trabajo, encuentro en mi jefe un apoyo para realizar mis actividades.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 65)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (65, 23, 'Cuando hay trabajo duro, mi Jefe trabaja con nosotros en el logro de los resultados.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 66)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (66, 24, 'Mi Jefe asigna el trabajo de acuerdo a los roles y capacidades de los miembros del equipo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 67)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (67, 24, 'Mi Jefe utiliza las capacidades de los miembros del equipo de forma que saca el mayor potencial del mismo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 68)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (68, 25, 'Mi Jefe hace seguimiento adecuado a la forma en como estamos haciendo el trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 69)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (69, 25, 'Mi Jefe tiene claridad de los indicadores de gestión del área y el equipo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 70)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (70, 26, 'Mi jefe genera acciones que incentivan mi formación, capacitación y desarrollo profesional.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 71)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (71, 27, 'Mi jefe, me apoya y reconoce por el trabajo bien hecho.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 72)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (72, 28, 'Mi jefe brinda retroalimentación efectiva y oportuna, de la forma como realizo mi trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 73)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (73, 26, 'Mi Jefe aprovecha las situaciones del día a día para apoyar mi desarrollo y crecimiento.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 74)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (74, 29, 'En nuestro equipo, nos comunicamos de forma clara y honesta.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 75)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (75, 29, 'La información clave para hacer nuestro trabajo es difundida de manera oportuna en el equipo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 76)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (76, 30, 'Pienso que existe una relación de compañerismo y apoyo en mi grupo de trabajo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 77)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (77, 30, 'Las relaciones al interior de mi área son de cooperación.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 78)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (78, 31, 'En mi área de trabajo las reuniones son efectivas.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 79)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (79, 31, 'Mi área se adapta con facilidad a las nuevas estrategias de la organización.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 80)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (80, 31, 'Tengo clara la contribución de mi área al cumplimiento de las metas de la organización.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 81)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (81, 31, 'Pienso que en mi área se ejecuta lo planeado.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 82)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (82, 32, 'En mi equipo todos tenemos claras nuestras responsabilidades.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 83)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (83, 32, 'Mi Rol agrega valor al logro de los objetivos del equipo.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 84)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (84, 33, 'Puedo sugerir alternativas y aportar a la toma de decisiones para solucionar los problemas que se presenten.');
IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = 85)
    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES (85, 33, 'En nuestro equipo podemos tomar decisiones acerca de la forma en como hacer nuestro trabajo.');
SET IDENTITY_INSERT [EDS].[ItemSat] OFF;
GO

PRINT '¡Proceso de creación e inserción finalizado con éxito!';
GO

-- 4. Creación de Procesos Almacenados (Stored Procedures)

-- Proceso Almacenado Unificado (Filtros Opcionales)
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

-- Proceso Almacenado por ID de Instrumento
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
        its.[Enunciado]
    FROM [EDS].[Instrumento] i
    INNER JOIN [EDS].[TipoVaria] tv ON i.[IdInst] = tv.[IdInst]
    INNER JOIN [EDS].[SubVariable] sv ON tv.[IdTiVa] = sv.[IdTiVa]
    INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
    WHERE i.[IdInst] = @IdInst
    ORDER BY tv.[IdTiVa], sv.[IdSuVa], its.[IdItem];
END
GO

-- Proceso Almacenado por ID de TipoVaria
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

-- Proceso Almacenado por ID de Subvariable
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
