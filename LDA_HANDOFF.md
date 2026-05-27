# Documentación de Migración y Continuidad: Módulo LDA y Conexión Real

Este documento sirve como bitácora y guía de transferencia para continuar el desarrollo del proyecto **Evaluación de Desempeño (EDD)** y el módulo de **Llamados de Atención (LDA)** en otro dispositivo o en una nueva conversación de IA.

---

## 1. Estado Actual y Logros Recientes

* **Conexión a Base de Datos de Producción:** El proyecto está completamente configurado y conectado al servidor real en red local `SVRICEBERGBD01` (Base de Datos `GTHS`).
* **Implementación Segura del Esquema LDA:** Se crearon las tablas `RelacionHecho`, `TipoCarga` y `Notificaciones` bajo el esquema `LDA` de forma limpia y segura en el servidor de producción.
* **Integración del Sistema de Roles Conjuntos:** Se actualizó la arquitectura del backend para admitir tanto la aplicación **EDD** como la aplicación **LDA**, resolviendo la limitación de accesos independientes.
* **Acceso en Red Local:** Toda la aplicación está lista para ser consumida y probada desde cualquier dispositivo de la red local.

---

## 2. Configuración del Entorno de Red Local

Para que otros dispositivos de la red local puedan acceder y usar la aplicación ejecutándose en la máquina host (IP actual: `192.168.1.81`):

### A. Frontend Angular (`frontend`)
1. **Archivo de Configuración:** [environment.ts](file:///c:/Users/ngonzalez/source/repos/evaluaciones-desempeno/frontend/src/environments/environment.ts) apunta a la IP real del host:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://192.168.1.81:5047/api',
     assetsUrl: 'http://192.168.1.81:5047'
   };
   ```
2. **Comando de Arranque:**
   ```bash
   cd frontend
   ng serve --host 0.0.0.0
   ```

### B. Backend .NET API (`backend`)
1. **Configuración de CORS:** En [appsettings.json](file:///c:/Users/ngonzalez/source/repos/evaluaciones-desempeno/backend/EDD.Api/appsettings.json) se agregaron los orígenes de red permitidos:
   ```json
   "Cors": {
     "AllowedOrigins": [
       "http://localhost:4200",
       "http://192.168.1.81:4200"
     ]
   }
   ```
2. **Comando de Arranque:**
   ```bash
   dotnet run --project backend/EDD.Api/EDD.Api.csproj --urls "http://0.0.0.0:5047"
   ```

> 💡 **Nota de Firewall:** Asegurarse de que los puertos de entrada **4200** y **5047** estén permitidos en el Firewall de Windows para conexiones entrantes de red privada.

---

## 3. Cambios Implementados en el Código del Backend

### A. Soporte para el Rol `NOTIFICADOR`
Se modificaron los métodos de validación en [UsuarioRepository.cs](file:///c:/Users/ngonzalez/source/repos/evaluaciones-desempeno/backend/EDD.Infrastructure/Repositories/UsuarioRepository.cs) (`CrearAsync` y `AsignarRolAsync`) para que admitan el rol de `NOTIFICADOR` del módulo LDA sin arrojar excepciones de rol no válido.

### B. Autenticación y Autorización Conjunta (Login)
Se optimizó el endpoint de inicio de sesión en [AuthController.cs](file:///c:/Users/ngonzalez/source/repos/evaluaciones-desempeno/backend/EDD.Api/Controllers/AuthController.cs):
* Permite el login a usuarios que tengan roles asignados en la app `EDD`, en la app `LDA`, o en ambas.
* Si el usuario posee el rol `ADMIN` en cualquiera de las aplicaciones, se le otorga acceso total de administrador.
* De lo contrario, se le asigna de manera dinámica el rol de su módulo correspondiente (`EVALUADOR` o `NOTIFICADOR`), activando las pantallas y menús correctos en el frontend de forma automática.

---

## 4. Instrucciones Administrativas para SQL Server

Ejecuta el siguiente bloque SQL en tu herramienta de base de datos (`GTHS` en `SVRICEBERGBD01`) con un usuario administrador (`sa` o `db_owner`) para realizar labores de mantenimiento o inicializar nuevos usuarios:

### A. Otorgar Permisos de Acceso al Esquema LDA
Permite que el usuario de la aplicación (`gths_app`) pueda leer y escribir en el esquema `LDA`:
```sql
USE [GTHS];
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::LDA TO gths_app;
GO
```

### B. Registrar la App y Roles Centrales de LDA
```sql
USE [GTHS];
-- Registrar la aplicación LDA
IF NOT EXISTS (SELECT 1 FROM [core].[Aplicaciones] WHERE NombreApp = 'LDA')
    INSERT INTO [core].[Aplicaciones] (NombreApp) VALUES ('LDA');

-- Registrar el rol NOTIFICADOR
IF NOT EXISTS (SELECT 1 FROM [core].[Roles] WHERE NombreRol = 'NOTIFICADOR')
    INSERT INTO [core].[Roles] (NombreRol) VALUES ('NOTIFICADOR');
GO
```

### C. Asignar Roles de LDA a un Usuario
```sql
USE [GTHS];
DECLARE @IdUsuario INT = 2; -- Cambiar por el ID del usuario real
DECLARE @IdRol INT = (SELECT IdRol FROM [core].[Roles] WHERE NombreRol = 'NOTIFICADOR');
DECLARE @IdApp INT = (SELECT IdApp FROM [core].[Aplicaciones] WHERE NombreApp = 'LDA');

IF NOT EXISTS (SELECT 1 FROM [core].[UsuarioRol] WHERE IdUsuario = @IdUsuario AND IdApp = @IdApp)
    INSERT INTO [core].[UsuarioRol] (IdUsuario, IdRol, IdApp) VALUES (@IdUsuario, @IdRol, @IdApp);
ELSE
    UPDATE [core].[UsuarioRol] SET IdRol = @IdRol WHERE IdUsuario = @IdUsuario AND IdApp = @IdApp;
GO
```

### D. Reiniciar Datos de Prueba en LDA
Para comenzar el sistema desde cero (con el ID secuencial en `1`):
```sql
USE [GTHS];
TRUNCATE TABLE LDA.Notificaciones;
GO
```

---

## 5. Metadata de Nómina (sp_Empleado_BuscarPorCedulaNomina)

Hemos confirmado que el procedimiento almacenado encargado de jalar los datos de los trabajadores del módulo de nómina:
* Acepta el parámetro `@CedulaEmpleado` (`varchar`).
* Retorna un conjunto de resultados con los campos:
  * `CedulaEmpleado` (`varchar` / `String`)
  * `NombresEmpleado` (`varchar` / `String`)
  * `ApellidosEmpleado` (`varchar` / `String`)
