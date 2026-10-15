---
name: testing-and-qa
description: Estrategia integral de testing, aseguramiento de calidad, pirámide de pruebas y protocolo de bugs en Placeres Culinarios.
---

# SKILL 6 — TESTING AND QA

## Objetivo
Garantizar que todo cambio en Placeres Culinarios esté respaldado por pruebas automatizadas verificables, impidiendo regresiones y proporcionando evidencia irrefutable de calidad de software.

---

## 1. Pirámide y Tipologías de Pruebas

- **Pruebas Unitarias (`tests/`):**
  - Pruebas rápidas y deterministas sobre funciones puras (por ejemplo, cálculo de horas en `src/lib/dateUtils.ts`, validación de campos, generación de códigos).
- **Pruebas de Integración:**
  - Ejecutan servicios del sistema (`src/lib/dataService.ts`) simulando o conectando bases de datos controladas para validar flujos de pedidos, sincronización multitenant, liquidación de fiados y transiciones de estado.
- **Pruebas de Autorización y Aislamiento:**
  - Comprueban que un ADMIN de un colegio no pueda acceder a datos de otro colegio, y que un PADRE no pueda consultar pedidos ajenos.
- **Pruebas de Casos Límite y Concurrencia:**
  - Validar cruces de medianoche en UTC-5, listas masivas de alumnos con paginación, importes en cero y pedidos concurrentes con códigos colisionantes.

---

## 2. Protocolo Obligatorio para Cada Bug o Defecto

Ante cualquier fallo reportado o identificado en el sistema:

1. **Reproducir el fallo:** Construir un escenario mínimo que replique fielmente el problema.
2. **Crear una prueba que falle:** Escribir una prueba automatizada que detecte el defecto y certifique que falla antes del arreglo.
3. **Implementar la corrección mínima segura:** Aplicar el cambio quirúrgico necesario sin refactorizaciones innecesarias.
4. **Ejecutar la prueba específica:** Confirmar que la prueba recién creada ahora pasa a color verde (PASS).
5. **Ejecutar las pruebas relacionadas:** Ejecutar los archivos de prueba del mismo módulo o subsistema.
6. **Ejecutar la suite de regresión general:** Ejecutar la suite completa del proyecto para garantizar que ningún otro flujo se haya roto.
7. **Documentar resultados:** Registrar en el commit o reporte la causa raíz, la prueba implementada y la confirmación de solución.

---

## 3. Prohibiciones Estrictas en Testing

- **Prohibido falsificar resultados:** Jamás marcar como aprobada (PASS) una prueba omitida, comentada o no ejecutada.
- **Prohibido debilitar aserciones:** No relajar las expectativas (`assert.ok(true)` o cambiar valores esperados) con el fin de ocultar un defecto real de la aplicación.
- **Prohibido simular el algoritmo dentro del test:** Las pruebas deben invocar el código real de producción (`import { ... } from '../src/lib/...'`), no replicar una copia del algoritmo dentro del archivo de test.

---

## 4. Ejecución de la Suite Local

Para ejecutar todas las pruebas locales sin escrituras destructivas remotas:

```sh
for f in tests/*.test.mjs; do
  if [ "$f" != "tests/colegios-sync.test.mjs" ]; then
    node --input-type=module -e "import './$f'";
  fi
done
```

> **Nota sobre `colegios-sync.test.mjs`:** Esta prueba realiza operaciones de escritura y borrado en Supabase usando `.env.local`. Solo debe ejecutarse cuando se autorice expresamente la prueba contra una base de datos de pruebas descartable.
