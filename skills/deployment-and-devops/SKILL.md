---
name: deployment-and-devops
description: Procedimientos de despliegue controlado, verificación de builds, gestión de entornos y planes de rollback en Placeres Culinarios.
---

# SKILL 9 — DEPLOYMENT AND DEVOPS

## Objetivo
Garantizar que todo pase a producción de forma segura, controlada, verificable y recuperable, protegiendo la disponibilidad continua del servicio para las familias y colegios.

---

## 1. REGLA OBLIGATORIA: DESPLIEGUE CONTINUO Y VERIFICACIÓN EN PRODUCCIÓN

**DIRECTIVA DEL USUARIO (OBLIGATORIA EN CADA CAMBIO):**
Cada vez que se realice cualquier modificación, corrección o mejora en el código:
1. **Pruebas Locales Obligatorias:** Se debe ejecutar y aprobar la batería completa de pruebas automatizadas locales (`node tests/...`), además de validar TypeScript (`npx tsc --noEmit`), linting (`npm run lint`) y build (`npm run build`).
2. **Subida Obligatoria a Producción:** Inmediatamente después de verificar en local, los cambios deben confirmarse en Git y subirse a la rama `main` del repositorio remoto (`git push origin main`), activando el despliegue automático en Vercel.
3. **Pruebas y Verificación en Producción:** Se deben realizar las pruebas pertinentes directamente en el entorno de producción en vivo:
   - Comprobar que la URL canónica responda con código HTTP 200: **`https://gestion-almuerzos-six.vercel.app`**.
   - Validar que las rutas modificadas (ej. `/fiado`, `/despacho`, `/admin`, etc.) carguen correctamente y reflejen los cambios aplicados en los bundles productivos.
   - Descartar errores de hidratación en React, fallos de renderizado o excepciones de red en producción.

---

## 2. Verificación Previa al Despliegue

Antes de subir a producción o aplicar una migración en Supabase:

1. **Suite de Pruebas en Verde:** Toda la batería de pruebas locales debe ejecutarse y aprobarse al 100% (0 fallos).
2. **Compilación de Producción Limpia:** `npm run build` debe completar sin errores de TypeScript ni advertencias bloqueantes.
3. **Control de Variables de Entorno:**
   - Verificar que las variables necesarias existan y estén configuradas en Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).
   - No almacenar claves privadas, service roles o tokens en repositorios públicos.
4. **Inspección de Cambios de Esquema:** Confirmar que cualquier cambio en base de datos haya sido aplicado y verificado previamente en Supabase.

---

## 3. Protección del Entorno de Producción

- **Prohibición de Pruebas Destructivas en Producción:** Queda estrictamente prohibido utilizar la base de datos de producción para pruebas destructivas, scripts de semillas que borren datos o pruebas de estrés no autorizadas.
- **No Desplegar Modificaciones de Alto Riesgo sin Autorización:** Cambios estructurales profundos en autenticación, pagos o esquema de base de datos deben validarse en local y comunicarse previamente.

---

## 4. Verificación Posterior al Despliegue y Monitoreo

Inmediatamente después de desplegar a producción:
1. Comprobar que la URL canónica responda con código HTTP 200 (`https://gestion-almuerzos-six.vercel.app`).
2. Verificar las rutas principales: `/`, `/login`, `/pedidos`, `/cocina`, `/despacho`, `/fiado`, `/superadmin`.
3. Revisar que los bundles de cliente (`_next/static/chunks/...`) contengan las modificaciones y que no existan errores de runtime.
4. Revisar los logs de ejecución para descartar errores 500 o excepciones en tiempo de ejecución.

---

## 5. Plan de Rollback Inmediato

- Si tras un despliegue se identifica un fallo crítico o una regresión inesperada:
  1. Ejecutar de inmediato el rollback al despliegue anterior estable en Vercel (`vercel rollback`).
  2. Si hubo migración de base de datos, aplicar el script de reversión planificado.
  3. Diagnosticar la causa en el entorno de desarrollo y reproducir con una prueba antes de reintentar.
