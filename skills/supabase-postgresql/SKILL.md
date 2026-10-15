---
name: supabase-postgresql
description: Integridad relacional, seguridad RLS, migraciones seguras y persistencia atómica en PostgreSQL y Supabase.
---

# SKILL 4 — SUPABASE POSTGRESQL

## Objetivo
Preservar la integridad referencial, consistencia transaccional y confidencialidad de la base de datos de Placeres Culinarios alojada en PostgreSQL mediante Supabase.

---

## 1. Principio Fundamental de Integridad de Datos

- **REGLA CRÍTICA INNEGOCIABLE:** Jamás eliminar tablas, columnas o registros reales existentes en la base de datos únicamente porque parezcan innecesarios o no se usen en una vista particular.
- **Toda migración estructural debe:**
  1. Evaluar dependencias y compatibilidad hacia atrás con registros históricos.
  2. Implementar transformaciones de datos no destructivas (por ejemplo, agregar columnas nuevas como opcionales `NULL` o con valores por defecto antes de hacerlas obligatorias).
  3. Contar con un plan de rollback documentado.
  4. Ejecutarse a través de archivos de migración SQL versionados (`supabase/migrations/YYYYMMDDNNNN_nombre.sql`).

---

## 2. Row Level Security (RLS) y Políticas Granulares

- **Activación de RLS:** Toda tabla creada o modificada (`colegios`, `perfiles_padres`, `hijos`, `pedidos`, `menus_dia`, `platos_catalogo`) debe tener RLS habilitado (`ALTER TABLE nombre ENABLE ROW LEVEL SECURITY;`).
- **Políticas Específicas por Operación:**
  - Separar explícitamente las políticas `SELECT`, `INSERT`, `UPDATE` y `DELETE`.
  - Evitar políticas abiertas del tipo `USING (true) WITH CHECK (true)` en tablas que contengan datos personales o sensibles.
  - Asegurar que los filtros verifiquen la relación entre el usuario autenticado (`auth.uid()`) y el registro correspondiente (`padre_id` o el `colegio_id` asignado al rol).
- **Aislamiento Multitenant en BD:** La pertenencia de un pedido o alumno a un colegio debe estar validada a nivel de tabla con clave foránea (`REFERENCES colegios(id)` o `colegio_nombre`) para evitar filtraciones de datos entre sedes escolares.

---

## 3. Transacciones Atómicas y Protección contra Condiciones de Carrera

- **Atomicidad en Pagos y Liquidaciones:**
  - Al liquidar un fiado o registrar un abono, la actualización del saldo deudor y el cambio de estado de los pedidos asociados deben ejecutarse como una única transacción o secuencia consistente.
  - No permitir que un fallo en la red deje pedidos marcados como `PAGADO` sin que se registre el abono, ni abonos registrados sin que se liquiden los pedidos.
- **Operaciones Idempotentes:**
  - Diseñar inserciones y actualizaciones de modo que una repetición por reintento de red (por ejemplo, doble clic del usuario o timeout temporal) no genere pedidos duplicados ni cobros dobles.
  - Emplear claves de unicidad compuestas o códigos de pedido resistentes a colisión (`ALM-...` combinando timestamp y entropía criptográfica).

---

## 4. Índices y Rendimiento en Consultas Reales

- **Indexación Orientada a la Carga:**
  - Índices sobre columnas utilizadas intensamente en cláusulas `WHERE` y `JOIN`:
    - `pedidos(colegio_nombre, fecha)`
    - `pedidos(padre_id)`
    - `hijos(padre_id)`
    - `hijos(colegio_nombre)`
  - Evitar escaneos secuenciales completos (`Seq Scan`) en tablas que crecen a lo largo del año lectivo.
- **Consultas Parametrizadas y Límites:**
  - Todas las lecturas masivas deben contar con soporte de paginación (`range(from, to)`) o filtros de fecha para optimizar el consumo de ancho de banda y memoria.

---

## 5. Verificación Posterior a Cada Migración

- Tras aplicar cualquier migración SQL:
  1. Verificar que las tablas mantengan sus relaciones íntegras.
  2. Ejecutar la suite de pruebas automatizadas del proyecto para comprobar que las queries de la aplicación siguen respondiendo en tiempo y forma.
  3. Comprobar que no existan errores de serialización ni bloqueos en transacciones concurrentes.
