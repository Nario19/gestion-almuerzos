---
name: professional-engineering-workflow
description: Flujo de trabajo transversal y obligatorio de 10 pasos para todas las tareas de ingeniería en Placeres Culinarios.
---

# SKILL 11 — PROFESSIONAL ENGINEERING WORKFLOW

## Objetivo
Establecer el procedimiento metódico, profesional y reproducible que el agente y cualquier desarrollador deben seguir rigurosamente en absolutamente todas las tareas, correcciones o mejoras en el sistema.

---

## Procedimiento Obligatorio de 10 Pasos

```mermaid
flowchart TD
    P1[1. COMPRENDER] --> P2[2. INVESTIGAR]
    P2 --> P3[3. EVALUAR]
    P3 --> P4[4. PLANIFICAR]
    P4 --> P5[5. PROTEGER]
    P5 --> P6[6. IMPLEMENTAR]
    P6 --> P7[7. VALIDAR]
    P7 --> P8[8. REVISAR]
    P8 --> P9[9. DOCUMENTAR]
    P9 --> P10[10. INFORMAR]
```

### PASO 1 — COMPRENDER
- Leer detenidamente la solicitud del usuario.
- Identificar el requerimiento de negocio y su objetivo operativo.
- No asumir intenciones no declaradas; si hay ambigüedad crítica, plantear opciones claras.

### PASO 2 — INVESTIGAR
- Inspeccionar el código real en `src/`, esquemas en `supabase/` y pruebas en `tests/`.
- Consultar `MEMORY.md`, `AGENTS.md` y las Skills relevantes.
- Determinar cómo funciona la característica actualmente antes de tocar una sola línea.

### PASO 3 — EVALUAR
- Clasificar el riesgo del cambio según la Política de Cambios Seguros (Bajo, Medio, Alto, Crítico).
- Evaluar dependencias directas e indirectas y posibles efectos secundarios.

### PASO 4 — PLANIFICAR
- Diseñar la solución técnica más segura, minimalista y mantenible.
- Priorizar la alternativa con menor cantidad de código modificado y menor riesgo de regresión.

### PASO 5 — PROTEGER
- Diseñar de antemano las pruebas unitarias o de integración que certificarán el cambio.
- Si se trata de un bug, reproducirlo primero con una prueba que falle.
- Establecer mecanismos de reversión (backup o commit limpio) antes de cambios de riesgo.

### PASO 6 — IMPLEMENTAR
- Realizar modificaciones quirúrgicas y ordenadas.
- Mantener tipado estricto en TypeScript sin utilizar `any`.
- Respetar la convención arquitectónica existente.

### PASO 7 — VALIDAR
- Ejecutar la prueba específica creada o modificada.
- Ejecutar la suite completa de pruebas de regresión local.
- Ejecutar verificación estática: `npx tsc --noEmit` y `npm run lint`.
- Ejecutar compilación de producción: `npm run build`.

### PASO 8 — REVISAR
- Verificar que ninguna funcionalidad existente se haya roto.
- Comprobar permisos, aislamiento de colegios y reglas de negocio.
- Descartar errores en consola o llamadas de red innecesarias.

### PASO 9 — DOCUMENTAR
- Actualizar `MEMORY.md` si se formalizó una decisión técnica o de negocio duradera.
- Actualizar la documentación técnica o tests cuando corresponda.

### PASO 10 — INFORMAR
- Entregar un resumen claro, estructurado y transparente al usuario:
  - Qué cambió.
  - Por qué se implementó de esa manera.
  - Qué pruebas se ejecutaron y sus resultados exactos.
  - Qué riesgos residuales o limitaciones externas quedan identificadas.
