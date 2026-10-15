---
name: performance-optimization
description: Optimización de rendimiento, paginación, control de memoria y eficiencia de consultas en Placeres Culinarios.
---

# SKILL 8 — PERFORMANCE OPTIMIZATION

## Objetivo
Optimizar la velocidad de respuesta, consumo de memoria y eficiencia de recursos en frontend y backend sin alterar resultados funcionales ni comprometer la seguridad.

---

## 1. Principios de Optimización Responsable

- **Medición Antes de Optimizar:** No realizar optimizaciones prematuras ni basadas en suposiciones. Medir con datos objetivos (tiempo de respuesta, tamaño del bundle, cantidad de re-renders o volumen de transferencia).
- **SEGURIDAD ANTES QUE VELOCIDAD:** Queda terminantemente prohibido sustituir una consulta segura que filtra por colegio o padre por una consulta no segura más rápida que exponga información confidencial.
- **Evidencia Posterior:** Toda optimización debe demostrar una mejora medible en tiempo, uso de CPU o memoria tras su aplicación.

---

## 2. Optimización de Base de Datos y Consultas

- **Paginación en Servidor:**
  - Emplear paginación (`limit` y `offset` / `range`) en listados de pedidos, auditorías e historiales para evitar descargar miles de registros en una sola petición.
  - Asegurar que las exportaciones masivas a Excel obtengan el universo completo filtrado sin truncarse en la página activa.
- **Selección de Columnas:**
  - Evitar `SELECT *` cuando solo se requieren campos específicos (por ejemplo, `select('id, nombre_completo, colegio_nombre')` en catálogos de alumnos).
- **Indexación Estratégica:**
  - Garantizar índices en claves de filtro frecuentes: `(colegio_nombre, fecha)`, `(padre_id)`, `(estado_pago)`.

---

## 3. Eficiencia en React y Prevención de Fugas de Memoria

- **Limpieza de Suscripciones y Listeners:**
  - Todo `supabase.channel()` o `setInterval()` debe limpiarse obligatoriamente en la función de desmontaje del `useEffect`.
  - Evitar múltiples suscripciones duplicadas al mismo canal dentro de la misma vista.
- **Control de Re-renders:**
  - Usar `useMemo` y `useCallback` en cálculos costosos (agrupaciones de fiados, consolidado de cocina) cuando los inputs no hayan cambiado.
  - No colocar objetos o arreglos literales como dependencias directas en efectos sin memoizar.
- **Optimización de Imágenes:**
  - Comprimir los comprobantes de pago antes de su subida mediante `imageCompression.ts`.
  - Usar formatos modernos (WebP/AVIF) y dimensiones adaptadas para logotipos de colegios e imágenes de platos.
