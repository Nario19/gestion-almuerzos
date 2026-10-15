---
name: deployment-and-devops
description: Procedimientos de despliegue controlado, verificación de builds, gestión de entornos y planes de rollback en Placeres Culinarios.
---

# SKILL 9 — DEPLOYMENT AND DEVOPS

## Objetivo
Garantizar que todo pase a producción de forma segura, controlada, verificable y recuperable, protegiendo la disponibilidad continua del servicio para las familias y colegios.

---

## 1. Verificación Previa al Despliegue

Antes de iniciar un despliegue en Vercel o aplicar una migración en Supabase:

1. **Suite de Pruebas en Verde:** Toda la batería de pruebas locales debe ejecutarse y aprobarse al 100%.
2. **Compilación de Producción Limpia:** `npm run build` debe completar sin advertencias críticas ni errores de TypeScript.
3. **Control de Variables de Entorno:**
   - Verificar que las variables necesarias existan y estén configuradas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).
   - No almacenar claves privadas o tokens en repositorios públicos.
4. **Inspección de Cambios de Esquema:** Confirmar que cualquier cambio en base de datos haya sido aplicado y verificado previamente.

---

## 2. Protección del Entorno de Producción

- **Prohibición de Pruebas Destructivas en Producción:** Queda estrictamente prohibido utilizar la base de datos de producción para pruebas destructivas, scripts de semillas que borren datos o pruebas de estrés no autorizadas.
- **No Desplegar Modificaciones de Alto Riesgo sin Autorización:** Cambios estructurales profundos en autenticación, pagos o esquema de base de datos deben validarse en local y comunicarse previamente.

---

## 3. Verificación Posterior al Despliegue y Monitoreo

Inmediatamente después de desplegar a producción:
1. Comprobar que la URL canónica responda con código HTTP 200 (`https://gestion-almuerzos-tau.vercel.app`).
2. Verificar las rutas principales: `/`, `/login`, `/pedidos`, `/cocina`, `/despacho`, `/fiado`, `/superadmin`.
3. Revisar los logs de ejecución para descartar errores 500 o excepciones en tiempo de ejecución.

---

## 4. Plan de Rollback Inmediato

- Si tras un despliegue se identifica un fallo crítico o una regresión inesperada:
  1. Ejecutar de inmediato el rollback al despliegue anterior estable en Vercel (`vercel rollback`).
  2. Si hubo migración de base de datos, aplicar el script de reversión planificado.
  3. Diagnosticar la causa en el entorno de desarrollo y reproducir con una prueba antes de reintentar.
