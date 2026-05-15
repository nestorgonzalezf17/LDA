# Registro de Cambios (Changelog) - Proyecto Evaluaciones y LDA

Este documento registra los cambios realizados en el sistema de Evaluaciones de Desempeño (EDD) y el nuevo módulo de Logística y Desvíos (LDA).

## [2026-05-15] - Implementación Módulo LDA y Correcciones Base

### Dashboard (EDD)
- [x] Corrección del error 500: Creación del procedimiento almacenado `EDD.sp_Dashboard_Obtener`.

### Módulo LDA
- [x] Creación de DTOs en `EDD.Application/DTOs/LDA/`.
- [x] Creación de Interfaces en `EDD.Application/Interfaces/LDA/`.
- [x] Implementación de Repositorios en `EDD.Infrastructure/Repositories/LDA/`.
- [x] Implementación de Controladores en `EDD.Api/Controllers/LDA/`.
- [x] Registro de inyección de dependencias en `Program.cs`.### Módulo LDA - Fase 2 (Catálogos y Filtros)
- [x] Creación de `TipoCargaDto.cs`.
- [x] Implementación de filtrado dinámico en `NotificacionRepository.cs` (soporta cédula, placa, operación, fechas, etc.).
- [x] Endpoints de catálogos para llenar selectores: `/api/lda/notificaciones/catalogos/...`.
- [x] Creación de `backend/test.http` para pruebas con REST Client.

### Módulo LDA - Fase 3 (POST y PUT)
- [x] Creación de `NotificacionSaveDto.cs` para el envío de datos.
- [x] Implementación de `CrearAsync` (INSERT) y `ActualizarRegistroAsync` (UPDATE) en el repositorio.
- [x] Nuevos endpoints: `POST /api/lda/notificaciones` y `PUT /api/lda/notificaciones/{id}/registro`.
- [x] Actualización de `test.http` con ejemplos de creación y edición.

### Módulo LDA - Fase 4 (Frontend)
- [x] Integración en el Sidebar (Menú lateral).
- [x] Creación de `LdaService` para consumo de APIs.
- [x] Componente `NuevoLlamadoComponent` con layout de dos columnas.
- [x] Implementación de búsqueda de empleado por cédula (integración con nómina).
- [x] Formulario reactivo con selectores dinámicos.
