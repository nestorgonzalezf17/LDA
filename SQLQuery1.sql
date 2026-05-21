USE [master]
GO

/****** Objeto: Database [EvaluacionesDesempeno] Fecha de script: 20/05/2026 8:30:28 a. m. ******/
CREATE DATABASE [EvaluacionesDesempeno]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'EvaluacionesDesempeno', FILENAME = N'C:\Users\ngonzalez\EvaluacionesDesempeno.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'EvaluacionesDesempeno_log', FILENAME = N'C:\Users\ngonzalez\EvaluacionesDesempeno_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO

IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [EvaluacionesDesempeno].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO

ALTER DATABASE [EvaluacionesDesempeno] SET ANSI_NULL_DEFAULT OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET ANSI_NULLS OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET ANSI_PADDING OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET ANSI_WARNINGS OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET ARITHABORT OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET AUTO_CLOSE ON 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET AUTO_SHRINK OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET AUTO_UPDATE_STATISTICS ON 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET CURSOR_DEFAULT  GLOBAL 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET CONCAT_NULL_YIELDS_NULL OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET NUMERIC_ROUNDABORT OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET QUOTED_IDENTIFIER OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET RECURSIVE_TRIGGERS OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET  ENABLE_BROKER 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET TRUSTWORTHY OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET PARAMETERIZATION SIMPLE 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET READ_COMMITTED_SNAPSHOT OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET HONOR_BROKER_PRIORITY OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET RECOVERY SIMPLE 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET  MULTI_USER 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET PAGE_VERIFY CHECKSUM  
GO

ALTER DATABASE [EvaluacionesDesempeno] SET DB_CHAINING OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET DELAYED_DURABILITY = DISABLED 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET OPTIMIZED_LOCKING = OFF 
GO

ALTER DATABASE [EvaluacionesDesempeno] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO

ALTER DATABASE [EvaluacionesDesempeno] SET QUERY_STORE = ON
GO

ALTER DATABASE [EvaluacionesDesempeno] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO

ALTER DATABASE [EvaluacionesDesempeno] SET  READ_WRITE 
GO


USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [core].[Aplicaciones] Fecha de script: 20/05/2026 8:31:01 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [core].[Aplicaciones](
	[IdApp] [int] IDENTITY(1,1) NOT NULL,
	[NombreApp] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdApp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NombreApp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [core].[Roles] Fecha de script: 20/05/2026 8:31:11 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [core].[Roles](
	[IdRol] [int] IDENTITY(1,1) NOT NULL,
	[NombreRol] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdRol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NombreRol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [core].[UsuarioRol] Fecha de script: 20/05/2026 8:31:20 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [core].[UsuarioRol](
	[IdUsuarioRol] [int] IDENTITY(1,1) NOT NULL,
	[IdUsuario] [int] NOT NULL,
	[IdRol] [int] NOT NULL,
	[IdApp] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdUsuarioRol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [core].[UsuarioRol]  WITH CHECK ADD FOREIGN KEY([IdApp])
REFERENCES [core].[Aplicaciones] ([IdApp])
GO

ALTER TABLE [core].[UsuarioRol]  WITH CHECK ADD FOREIGN KEY([IdRol])
REFERENCES [core].[Roles] ([IdRol])
GO

ALTER TABLE [core].[UsuarioRol]  WITH CHECK ADD FOREIGN KEY([IdUsuario])
REFERENCES [core].[Usuarios] ([IdUsuario])
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [core].[Usuarios] Fecha de script: 20/05/2026 8:31:31 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [core].[Usuarios](
	[IdUsuario] [int] IDENTITY(1,1) NOT NULL,
	[Documento] [nvarchar](50) NOT NULL,
	[Nombre] [nvarchar](200) NOT NULL,
	[Email] [nvarchar](255) NOT NULL,
	[PasswordHash] [nvarchar](max) NOT NULL,
	[Estado] [bit] NOT NULL,
	[FechaCreacion] [datetime] NOT NULL,
	[DebeCambiarClave] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdUsuario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Documento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [core].[Usuarios] ADD  DEFAULT ((1)) FOR [Estado]
GO

ALTER TABLE [core].[Usuarios] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO

ALTER TABLE [core].[Usuarios] ADD  DEFAULT ((1)) FOR [DebeCambiarClave]
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [EDD].[Areas] Fecha de script: 20/05/2026 8:31:43 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [EDD].[Areas](
	[IdArea] [int] IDENTITY(1,1) NOT NULL,
	[IdEmpresa] [int] NOT NULL,
	[Nombre] [nvarchar](200) NOT NULL,
	[Activo] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IdArea] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [EDD].[Areas] ADD  DEFAULT ((1)) FOR [Activo]
GO

ALTER TABLE [EDD].[Areas]  WITH CHECK ADD FOREIGN KEY([IdEmpresa])
REFERENCES [EDD].[Empresas] ([IdEmpresa])
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [EDD].[Cargos] Fecha de script: 20/05/2026 8:31:53 a. m. ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDD].[Cargos]') AND type in (N'U'))
DROP TABLE [EDD].[Cargos]
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [EDD].[EmpleadosNomina] Fecha de script: 20/05/2026 8:32:02 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [EDD].[EmpleadosNomina](
	[CedulaEmpleado] [nvarchar](50) NOT NULL,
	[NombresEmpleado] [nvarchar](200) NOT NULL,
	[ApellidosEmpleado] [nvarchar](200) NOT NULL,
	[Activo] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[CedulaEmpleado] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [EDD].[EmpleadosNomina] ADD  DEFAULT ((1)) FOR [Activo]
GO

USE [EvaluacionesDesempeno]
GO

ALTER TABLE [EDD].[Empresas] DROP CONSTRAINT [DF__Empresas__FechaC__5CD6CB2B]
GO

ALTER TABLE [EDD].[Empresas] DROP CONSTRAINT [DF__Empresas__Activo__5BE2A6F2]
GO

/****** Objeto: Table [EDD].[Empresas] Fecha de script: 20/05/2026 8:32:11 a. m. ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDD].[Empresas]') AND type in (N'U'))
DROP TABLE [EDD].[Empresas]
GO

/****** Objeto: Table [EDD].[Empresas] Fecha de script: 20/05/2026 8:32:11 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [EDD].[Empresas](
	[IdEmpresa] [int] IDENTITY(1,1) NOT NULL,
	[Nombre] [nvarchar](200) NOT NULL,
	[Codigo] [nvarchar](50) NULL,
	[LogoUrl] [nvarchar](max) NULL,
	[Activo] [bit] NOT NULL,
	[FechaCreacion] [datetime] NOT NULL,
	[FechaActualizacion] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[IdEmpresa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [EDD].[Empresas] ADD  DEFAULT ((1)) FOR [Activo]
GO

ALTER TABLE [EDD].[Empresas] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [LDA].[Notificaciones] Fecha de script: 20/05/2026 8:32:22 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [LDA].[Notificaciones](
	[IdNotificacion] [int] IDENTITY(1,1) NOT NULL,
	[CedulaEmpleado] [varchar](50) NOT NULL,
	[NombreCompletoEmpleado] [varchar](200) NOT NULL,
	[PlacaVehiculoAsignado] [varchar](10) NOT NULL,
	[IdRelacionHecho] [int] NOT NULL,
	[IdTipoCarga] [int] NOT NULL,
	[Operacion] [varchar](50) NULL,
	[FechaHecho] [datetime] NOT NULL,
	[FechaNotificacion] [datetime] NOT NULL,
	[Registro] [varchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[IdNotificacion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [LDA].[Notificaciones] ADD  DEFAULT (getdate()) FOR [FechaNotificacion]
GO

ALTER TABLE [LDA].[Notificaciones]  WITH CHECK ADD  CONSTRAINT [FK_Notificaciones_RelacionHecho] FOREIGN KEY([IdRelacionHecho])
REFERENCES [LDA].[RelacionHecho] ([IdRelacionHecho])
GO

ALTER TABLE [LDA].[Notificaciones] CHECK CONSTRAINT [FK_Notificaciones_RelacionHecho]
GO

ALTER TABLE [LDA].[Notificaciones]  WITH CHECK ADD  CONSTRAINT [FK_Notificaciones_TipoCarga] FOREIGN KEY([IdTipoCarga])
REFERENCES [LDA].[TipoCarga] ([IdTipoCarga])
GO

ALTER TABLE [LDA].[Notificaciones] CHECK CONSTRAINT [FK_Notificaciones_TipoCarga]
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [LDA].[RelacionHecho] Fecha de script: 20/05/2026 8:32:33 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [LDA].[RelacionHecho](
	[IdRelacionHecho] [int] IDENTITY(1,1) NOT NULL,
	[TituloRel] [varchar](150) NOT NULL,
	[RutaPlantilla] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[IdRelacionHecho] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

USE [EvaluacionesDesempeno]
GO

/****** Objeto: Table [LDA].[TipoCarga] Fecha de script: 20/05/2026 8:32:40 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [LDA].[TipoCarga](
	[IdTipoCarga] [int] IDENTITY(1,1) NOT NULL,
	[TituloTipoCarga] [varchar](50) NOT NULL,
	[Descripcion] [varchar](150) NULL,
PRIMARY KEY CLUSTERED 
(
	[IdTipoCarga] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

