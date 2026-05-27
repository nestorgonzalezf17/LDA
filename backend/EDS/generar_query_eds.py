import csv
import os
import re

# Definición de rutas
csv_filename = "ENCUESTA DE CLIMA ORGANIZACIONAL (6)_hoja2.csv"
sql_filename = "crear_esquema_eds.sql"

# Rutas absolutas relativas al directorio del script
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, csv_filename)
sql_path = os.path.join(base_dir, sql_filename)

# 1. Valores estáticos para tablas maestras
escolaridades = [
    "Estudiante Universitario",
    "tecnico otecnologo",
    "profesional",
    "profesional con especializacion",
    "bachiller",
    "sin estudio"
]

estados_civiles = [
    "casado",
    "separado",
    "viudo",
    "union libre",
    "soltero"
]

areas_eds = [
    "talento humano",
    "ciclos y procesos",
    "nomina",
    "sistemas",
    "trafico",
    "carga seca",
    "carga liquida",
    "tev",
    "hseq",
    "mantenimiento",
    "compras",
    "almacen",
    "contabilidad",
    "servicio al cliente",
    "comercial",
    "conductores",
    "tesoreria"
]

# Mapas de normalización para corregir discrepancias de escritura en el CSV
normalization_map = {
    # Tipo Varia
    "gestion del talento": "Gestión del Talento",
    "gestión del talento": "Gestión del Talento",
    "crear contexto": "Crear Contexto",
    "sostener contexto": "Sostener Contexto",
    "toma de decisiones": "Toma de Decisiones",
    
    # Sub Var
    "direccionamiento y orientación a resultados": "Direccionamiento y Orientación a Resultados",
    "satisfacción con el cargo": "Satisfacción con el Cargo",
    "motivación y reconocimiento": "Motivación y Reconocimiento",
}

def clean_text(text):
    if not text:
        return ""
    text = text.strip()
    # Reemplazar múltiples espacios o tabulaciones por uno solo
    text = re.sub(r'\s+', ' ', text)
    
    # Aplicar mapa de normalización si coincide en minúsculas
    text_lower = text.lower()
    if text_lower in normalization_map:
        return normalization_map[text_lower]
        
    return text

def clean_enunciado(enunciado):
    if not enunciado:
        return ""
    enunciado = enunciado.strip()
    enunciado = re.sub(r'\s+', ' ', enunciado)
    
    # Eliminar número y espacio al inicio (ej. "42 Estoy" -> "Estoy", "16 Mi jefe" -> "Mi jefe")
    # Para ser seguros, solo si empieza por un número y va seguido de texto
    enunciado = re.sub(r'^\d+\s+', '', enunciado)
    return enunciado

# 2. Lectura y procesamiento del CSV
print(f"Leyendo CSV desde: {csv_path}")

instrumentos = {}  # {titulo: id}
tipo_varias = {}   # {(id_inst, titulo): id}
sub_vars = {}      # {(id_tiva, titulo): id}
item_sats = []     # [(id_sub_varia, enunciado)]

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for row_idx, row in enumerate(reader, start=1):
        if not row or len(row) < 4:
            continue
        
        # Extraer y limpiar datos de cada columna
        inst_val = clean_text(row[0])
        tiva_val = clean_text(row[1])
        subv_val = clean_text(row[2])
        enum_val = clean_enunciado(row[3])
        
        if not inst_val or not tiva_val or not subv_val or not enum_val:
            continue
            
        # Registrar Instrumento
        if inst_val not in instrumentos:
            instrumentos[inst_val] = len(instrumentos) + 1
        id_inst = instrumentos[inst_val]
        
        # Registrar TipoVaria
        tiva_key = (id_inst, tiva_val)
        if tiva_key not in tipo_varias:
            tipo_varias[tiva_key] = len(tipo_varias) + 1
        id_tiva = tipo_varias[tiva_key]
        
        # Registrar SubVar
        subv_key = (id_tiva, subv_val)
        if subv_key not in sub_vars:
            sub_vars[subv_key] = len(sub_vars) + 1
        id_subv = sub_vars[subv_key]
        
        # Registrar ItemSat
        item_sats.append((id_subv, enum_val))

print(f"Procesamiento del CSV completado:")
print(f"  - Instrumentos únicos: {len(instrumentos)}")
print(f"  - Tipos de Variable únicos: {len(tipo_varias)}")
print(f"  - Sub-Variables únicas: {len(sub_vars)}")
print(f"  - Ítems de Satisfacción cargados: {len(item_sats)}")

# 3. Construcción del Query SQL Server
sql = []

# Encabezado
sql.append("""/*
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
""")

# Creación de Tablas
sql.append("""-- 2. Creación de Tablas

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

-- SubVar
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[EDS].[SubVar]') AND type in (N'U'))
BEGIN
    CREATE TABLE [EDS].[SubVar](
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
        FOREIGN KEY ([IdSubVaria]) REFERENCES [EDS].[SubVar]([IdSuVa])
    );
END
GO
""")

# Inserción de datos
sql.append("-- 3. Inserción de Datos\n")

# Función auxiliar para formatear cadenas SQL
def escape_sql(val):
    return val.replace("'", "''")

# Insertar Escolaridad
sql.append("PRINT 'Insertando en [EDS].[Escolaridad]...';")
sql.append("SET IDENTITY_INSERT [EDS].[Escolaridad] ON;")
for idx, val in enumerate(escolaridades, start=1):
    sql.append(f"IF NOT EXISTS (SELECT 1 FROM [EDS].[Escolaridad] WHERE [IdEsco] = {idx})")
    sql.append(f"    INSERT INTO [EDS].[Escolaridad] ([IdEsco], [Titulo]) VALUES ({idx}, '{escape_sql(val)}');")
sql.append("SET IDENTITY_INSERT [EDS].[Escolaridad] OFF;\nGO\n")

# Insertar EstadoCivil
sql.append("PRINT 'Insertando en [EDS].[EstadoCivil]...';")
sql.append("SET IDENTITY_INSERT [EDS].[EstadoCivil] ON;")
for idx, val in enumerate(estados_civiles, start=1):
    sql.append(f"IF NOT EXISTS (SELECT 1 FROM [EDS].[EstadoCivil] WHERE [IdEstC] = {idx})")
    sql.append(f"    INSERT INTO [EDS].[EstadoCivil] ([IdEstC], [Titulo]) VALUES ({idx}, '{escape_sql(val)}');")
sql.append("SET IDENTITY_INSERT [EDS].[EstadoCivil] OFF;\nGO\n")

# Insertar AreaEDS
sql.append("PRINT 'Insertando en [EDS].[AreaEDS]...';")
sql.append("SET IDENTITY_INSERT [EDS].[AreaEDS] ON;")
for idx, val in enumerate(areas_eds, start=1):
    sql.append(f"IF NOT EXISTS (SELECT 1 FROM [EDS].[AreaEDS] WHERE [IdArea] = {idx})")
    sql.append(f"    INSERT INTO [EDS].[AreaEDS] ([IdArea], [Titulo]) VALUES ({idx}, '{escape_sql(val)}');")
sql.append("SET IDENTITY_INSERT [EDS].[AreaEDS] OFF;\nGO\n")

# Insertar Instrumento
sql.append("PRINT 'Insertando en [EDS].[Instrumento]...';")
sql.append("SET IDENTITY_INSERT [EDS].[Instrumento] ON;")
# Ordenar por ID
for val, idx in sorted(instrumentos.items(), key=lambda x: x[1]):
    sql.append(f"IF NOT EXISTS (SELECT 1 FROM [EDS].[Instrumento] WHERE [IdInst] = {idx})")
    sql.append(f"    INSERT INTO [EDS].[Instrumento] ([IdInst], [Titulo]) VALUES ({idx}, '{escape_sql(val)}');")
sql.append("SET IDENTITY_INSERT [EDS].[Instrumento] OFF;\nGO\n")

# Insertar TipoVaria
sql.append("PRINT 'Insertando en [EDS].[TipoVaria]...';")
sql.append("SET IDENTITY_INSERT [EDS].[TipoVaria] ON;")
for (id_inst, val), idx in sorted(tipo_varias.items(), key=lambda x: x[1]):
    sql.append(f"IF NOT EXISTS (SELECT 1 FROM [EDS].[TipoVaria] WHERE [IdTiVa] = {idx})")
    sql.append(f"    INSERT INTO [EDS].[TipoVaria] ([IdTiVa], [IdInst], [Titulo]) VALUES ({idx}, {id_inst}, '{escape_sql(val)}');")
sql.append("SET IDENTITY_INSERT [EDS].[TipoVaria] OFF;\nGO\n")

# Insertar SubVar
sql.append("PRINT 'Insertando en [EDS].[SubVar]...';")
sql.append("SET IDENTITY_INSERT [EDS].[SubVar] ON;")
for (id_tiva, val), idx in sorted(sub_vars.items(), key=lambda x: x[1]):
    sql.append(f"IF NOT EXISTS (SELECT 1 FROM [EDS].[SubVar] WHERE [IdSuVa] = {idx})")
    sql.append(f"    INSERT INTO [EDS].[SubVar] ([IdSuVa], [IdTiVa], [Titulo]) VALUES ({idx}, {id_tiva}, '{escape_sql(val)}');")
sql.append("SET IDENTITY_INSERT [EDS].[SubVar] OFF;\nGO\n")

# Insertar ItemSat
sql.append("PRINT 'Insertando en [EDS].[ItemSat]...';")
sql.append("SET IDENTITY_INSERT [EDS].[ItemSat] ON;")
for idx, (id_subv, val) in enumerate(item_sats, start=1):
    sql.append(f"IF NOT EXISTS (SELECT 1 FROM [EDS].[ItemSat] WHERE [IdItem] = {idx})")
    sql.append(f"    INSERT INTO [EDS].[ItemSat] ([IdItem], [IdSubVaria], [Enunciado]) VALUES ({idx}, {id_subv}, '{escape_sql(val)}');")
sql.append("SET IDENTITY_INSERT [EDS].[ItemSat] OFF;\nGO\n")

sql.append("PRINT '¡Proceso de creación e inserción finalizado con éxito!';\nGO\n")

# 4. Creación de Procesos Almacenados (Stored Procedures)
sql.append("""-- 4. Creación de Procesos Almacenados (Stored Procedures)

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
    INNER JOIN [EDS].[SubVar] sv ON tv.[IdTiVa] = sv.[IdTiVa]
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
    INNER JOIN [EDS].[SubVar] sv ON tv.[IdTiVa] = sv.[IdTiVa]
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
    INNER JOIN [EDS].[SubVar] sv ON tv.[IdTiVa] = sv.[IdTiVa]
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
    INNER JOIN [EDS].[SubVar] sv ON tv.[IdTiVa] = sv.[IdTiVa]
    INNER JOIN [EDS].[ItemSat] its ON sv.[IdSuVa] = its.[IdSubVaria]
    WHERE sv.[IdSuVa] = @IdSuVa
    ORDER BY its.[IdItem];
END
GO
""")

# Escribir el archivo .sql
with open(sql_path, mode='w', encoding='utf-8') as f:
    f.write("\n".join(sql))

print(f"Archivo SQL generado con éxito en: {sql_path}")
