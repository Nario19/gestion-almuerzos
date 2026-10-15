---
name: iso-quality-and-compliance
description: Alineación y cumplimiento pragmático con estándares internacionales de calidad y seguridad ISO/IEC en Placeres Culinarios.
---

# SKILL 10 — ISO QUALITY AND COMPLIANCE

## Objetivo
Adoptar los principios y mejores prácticas de los estándares internacionales de ingeniería de software para asegurar que el sistema Placeres Culinarios ofrezca un producto confiable, seguro, mantenible y de calidad comprobable.

---

## 1. Principio de Honestidad Normativa

> **REGLA FUNDAMENTAL:** No declarar certificaciones formales que el proyecto no posea. Este skill documenta la **alineación técnica y adopción voluntaria de buenas prácticas** inspiradas en marcos normativos internacionales, proporcionando evidencia real de su implementación.

---

## 2. Marco Normativo de Referencia y Prácticas Aplicables

- **ISO/IEC 25010 (Modelo de Calidad del Producto de Software):**
  - Evalúa 8 características fundamentales: Adecuación Funcional, Eficiencia de Desempeño, Compatibilidad, Usabilidad, Fiabilidad, Seguridad, Mantenibilidad y Portabilidad.
- **ISO/IEC 25023 (Medición de Calidad del Software):**
  - Métricas concretas de densidad de defectos, cobertura de pruebas y tiempos de respuesta.
- **ISO/IEC/IEEE 12207 (Procesos del Ciclo de Vida del Software):**
  - Metodología estructurada de desarrollo, verificación, validación y mantenimiento.
- **ISO/IEC/IEEE 29119 (Pruebas de Software):**
  - Procesos de diseño, ejecución y documentación de pruebas unitarias, de integración y regresión.
- **ISO/IEC 27001 / 27002 / 27034 (Seguridad de la Información y Seguridad en Aplicaciones):**
  - Gestión de controles de acceso, confidencialidad de datos, trazabilidad y defensa en profundidad.
- **ISO/IEC 25012 (Calidad de Datos):**
  - Exactitud, completitud, consistencia, credibilidad y actualidad de la información almacenada en base de datos.

---

## 3. Matriz de Cumplimiento Técnico

| Estándar | Práctica Aplicable | Implementación en Placeres Culinarios | Evidencia Verificable | Resultado |
|---|---|---|---|---|
| **ISO/IEC 25010** | Adecuación funcional y completitud | Implementación de flujos de pedidos, carta por colegio, despacho, cocina y fiados | Suites en `tests/` y validación con usuarios | Cumplimiento funcional total |
| **ISO/IEC 25010** | Fiabilidad y tolerancia a fallos | Propagación de errores en `dataService`, reintentos y persistencia segura | `tests/regresiones-criticas-revision.test.mjs` | Sin falsos éxitos |
| **ISO/IEC 25010** | Mantenibilidad | TypeScript estricto, separación por capas, cero código muerto | `npm run lint` y `npx tsc --noEmit` | Código tipado y modular |
| **ISO/IEC 27034** | Seguridad en el ciclo de vida | Control estricto de roles (`SUPER_ADMIN`, `ADMIN`, `PADRE`), validación multitenant | `tests/superadmin-colegios.test.mjs`, tests de aislamiento | Cero IDOR / BOLA |
| **ISO/IEC 29119** | Estrategia de pruebas | Pruebas automatizadas de regresión obligatorias en cada cambio | `for f in tests/*.test.mjs...` | Suite 100% aprobada |
| **ISO/IEC 25012** | Calidad e integridad de datos | Preservación estricta de observaciones/alergias, integridad de saldos en fiados | Migraciones versionadas en `supabase/migrations/` | Consistencia garantizada |
| **ISO/IEC 27002** | Control de acceso y privacidad | Aislamiento por colegio, protección de notas médicas y datos de menores | `skills/data-privacy-and-school-safety/SKILL.md` | Confidencialidad escolar |
