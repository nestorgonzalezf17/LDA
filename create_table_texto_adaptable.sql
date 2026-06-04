USE [GTHS];
GO

-- 1. Crear la tabla TextoAdaptablePlantilla en el esquema LDA
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[LDA].[TextoAdaptablePlantilla]') AND type in (N'U'))
BEGIN
    CREATE TABLE [LDA].[TextoAdaptablePlantilla](
        [IdTexto] [int] IDENTITY(1,1) NOT NULL CONSTRAINT PK_TextoAdaptablePlantilla PRIMARY KEY,
        [IdRelacionHecho] [int] NOT NULL,
        [Contenido] [varchar](2000) NOT NULL,
        CONSTRAINT FK_TextoAdaptablePlantilla_RelacionHecho FOREIGN KEY ([IdRelacionHecho]) 
            REFERENCES [LDA].[RelacionHecho]([IdRelacionHecho])
            ON DELETE CASCADE
    );
    
    PRINT 'Tabla LDA.TextoAdaptablePlantilla creada con éxito.';
END
ELSE
BEGIN
    PRINT 'La tabla LDA.TextoAdaptablePlantilla ya existe.';
END
GO

-- 2. Conceder permisos de acceso al usuario de la aplicación gths_app
GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::[LDA].[TextoAdaptablePlantilla] TO gths_app;
GO

-- 3. Ejemplo de cómo insertar datos con saltos de línea para el hecho con IdRelacionHecho = 1 (Desvío de Ruta)
-- NOTA: Puedes personalizar este texto según las necesidades reales.
IF NOT EXISTS (SELECT 1 FROM [LDA].[TextoAdaptablePlantilla] WHERE IdRelacionHecho = 1)
BEGIN
    INSERT INTO [LDA].[TextoAdaptablePlantilla] (IdRelacionHecho, Contenido)
    VALUES (1, 'Por medio de la presente, se le comunica que el día de los hechos se detectó un desvío de ruta no autorizado.
   
Esta conducta representa una desviación directa de los procedimientos estándar establecidos por la compañía para el transporte de carga seca.
   
Le solicitamos presentar sus explicaciones y comprometerse a seguir los itinerarios aprobados.');
    PRINT 'Registro inicial de prueba insertado con éxito para IdRelacionHecho = 1.';
END
GO
