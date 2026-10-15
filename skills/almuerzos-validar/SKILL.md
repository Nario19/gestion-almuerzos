---
name: almuerzos-validar
description: Validar cambios en gestion-almuerzos seleccionando comprobaciones locales y detectando pruebas que escriben en Supabase. Usar al verificar cambios o diagnosticar regresiones del proyecto.
---

# Validar cambios en almuerzos

Trabajar desde la raíz y leer `AGENTS.md` y `MEMORY.md`. Revisar `git diff` y `package.json` para determinar el alcance. Aplicar también [almuerzos-pruebas-regresion](../almuerzos-pruebas-regresion/SKILL.md): la regresión local completa es obligatoria después de cada cambio y tras la última edición antes de entregar.

## Elegir las comprobaciones

- Solo documentación: verificar enlaces relativos, nombres, coherencia con el código y `git diff --check`. Ejecutar también toda la suite local de regresión; no hace falta arrancar la aplicación para cambios exclusivamente documentales.
- TypeScript/UI: ejecutar `npm run lint` y `npx tsc --noEmit` según el alcance; usar `npm run build` si se modifican rutas, dependencias o límites cliente/servidor. Leer antes la guía pertinente en `node_modules/next/dist/docs/`.
- Negocio: ejecutar los archivos pertinentes con `node --test tests/<archivo>.test.mjs`; revisar su contenido antes. Para fechas usar `tests/zona-horaria-peru.test.mjs`, que importa TypeScript directamente y requiere un Node compatible con esa ejecución.
- Las pruebas existentes a menudo inspeccionan texto o reproducen lógica. Complementar cambios funcionales con comprobación del flujo real cuando sea posible; no presentar esas pruebas como cobertura de navegador o de seguridad remota.

## Suite local sin la integración remota

Tras revisar que no aparezcan nuevos archivos con efectos externos, ejecutar obligatoriamente las pruebas locales desde la raíz con:

```sh
node --input-type=module -e 'import { readdirSync } from "node:fs"; import { spawnSync } from "node:child_process"; const files = readdirSync("tests").filter(f => f.endsWith(".test.mjs") && f !== "colegios-sync.test.mjs").map(f => "tests/" + f); const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" }); process.exit(result.status ?? 1);'
```

`npm test` incluye `colegios-sync.test.mjs`. Esa integración carga `.env.local` con prioridad sobre el entorno del proceso, crea/elimina colegios y depende de datos concretos. Ejecutarla solamente cuando la tarea autorice sus escrituras en un destino identificado de pruebas. No cambiar `.env.local` ni conectarse al proyecto real para hacer pasar una comprobación local.

No ejecutar `seed` ni `seed:superadmin` como preparación de pruebas: modifican perfiles o vacían tablas. `scripts/verify-all.mjs` comprueba ejemplos de lógica y no sustituye las regresiones.

## Entrega

Reportar comandos ejecutados, resultados, comprobaciones omitidas y motivos. Distinguir fallos preexistentes de regresiones del cambio. No ampliar la tarea para corregir fallos ajenos ni declarar una prueba omitida como aprobada.
