---
name: regression-prevention
description: Protocolo estricto de análisis de impacto y prevención sistemática de regresiones en Placeres Culinarios.
---

# SKILL 7 — REGRESSION PREVENTION

## Objetivo
Blindar el sistema para que ninguna corrección, optimización o adición de funcionalidad degrade, altere o rompa comportamientos preexistentes que funcionan correctamente.

---

## 1. Regla Fundamental de Ingeniería

> **REGLA ABSOLUTA:** Ante dos soluciones técnicamente equivalentes, priorizar siempre aquella que introduzca **menor riesgo**, **menor cantidad de líneas modificadas** y **mayor facilidad de reversión**.

---

## 2. Procedimiento de Análisis de Impacto (Antes de Modificar)

Antes de editar cualquier archivo en el proyecto, el ingeniero debe responder explícitamente a las siguientes preguntas:

1. **¿Dónde se importa y consume este archivo?**
   - Ejecutar una búsqueda de referencias (`grep` o buscador del IDE) para identificar todos los archivos que dependen directa o indirectamente de él.
2. **¿Qué contratos públicos o firmas de función se ven involucrados?**
   - Verificar si el cambio altera argumentos, tipos de retorno, opcionalidad de campos o valores esperados.
3. **¿Qué pantallas o vistas de usuario se verán afectadas?**
   - Determinar si el impacto es en la vista de Padres (`/`, `/pedidos`, `/hijos`), Administradores (`/admin`, `/cocina`, `/despacho`, `/fiado`) o Superadmin (`/superadmin`).
4. **¿Qué reglas de negocio están en juego?**
   - Contrastar el cambio contra `skills/business-rules/SKILL.md` (aislamiento por colegio, corte de 09:30 AM, estado de entrega sin forzar pago, etc.).
5. **¿Qué consultas o tablas de base de datos intervienen?**
   - Identificar si se alteran `SELECT`, `INSERT` o `UPDATE` sobre `pedidos`, `hijos`, `colegios`, `menus_dia` o `perfiles_padres`.
6. **¿Qué pruebas automatizadas cubren actualmente este código?**
   - Identificar las suites en `tests/` que validan el comportamiento actual antes de tocar el código.

---

## 3. Verificación Posterior al Cambio (Checklist Anti-Regresión)

Tras realizar la modificación en el código:

1. **Comparación Comportamiento Anterior vs. Posterior:**
   - Confirmar que la funcionalidad nueva o corregida opera de acuerdo al objetivo, y que los flujos alternativos no han sido alterados.
2. **Ejecución de la Suite de Regresión Completa:**
   - Correr todas las pruebas existentes en `tests/` para confirmar que se mantienen 100% aprobadas.
3. **Revisión de Permisos y Autorizaciones:**
   - Comprobar que no se haya filtrado información entre colegios ni abierto accesos no autorizados.
4. **Inspección de Errores de Servidor y Consola:**
   - Validar que no existan advertencias de React (hooks desordenados, dependencias faltantes), excepciones no capturadas ni errores de compilación TypeScript.
5. **Compatibilidad con Datos Históricos:**
   - Asegurarse de que los registros antiguos de la base de datos (pedidos pasados, alumnos sin `colegio_id`, configuraciones anteriores) continúen leyéndose y renderizándose sin errores.
