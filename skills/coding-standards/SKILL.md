---
name: coding-standards
description: Estándares profesionales de codificación limpia, TypeScript estricto, buenas prácticas React y mantenibilidad en Placeres Culinarios.
---

# SKILL 1 — CODING STANDARDS

## Objetivo
Garantizar que todo el código del sistema Placeres Culinarios sea profesional, altamente legible, seguro, tipado de forma estricta y fácilmente mantenible por cualquier miembro del equipo de ingeniería.

---

## 1. TypeScript Estricto y Tipado Exhaustivo

- **Prohibición de `any`:** Queda terminantemente prohibido usar `any` para ocultar discrepancias de tipos. Utilizar tipos explícitos, interfaces bien documentadas, genéricos restrictivos o tipos de unión discriminada (`type Action = { type: 'A'; payload: string } | ...`).
- **Uso de `unknown`:** Si una entrada externa o respuesta de red es impredecible, tiparla como `unknown` y validarla en el límite con type guards (`isRecord(data)`, `typeof data.id === 'string'`).
- **Inmutabilidad y `const`:** Declarar todas las referencias con `const`. Usar `let` únicamente cuando la variable sea reasignada en un bucle o bloque explícito. Nunca utilizar `var`.
- **Tipado en contratos públicos:** Todas las funciones exportadas en `src/lib/dataService.ts`, `src/lib/dateUtils.ts` y componentes compartidos deben declarar explícitamente sus tipos de retorno (`Promise<Pedido[]>`, `JSX.Element`, `string`).

---

## 2. Arquitectura de Código y Separación de Responsabilidades

- **Presentación (UI):** Componentes en `src/app/` enfocados exclusivamente en renderizar estado, capturar eventos de usuario y delegar la lógica de negocio.
- **Lógica de Negocio y Datos:** Centralizada en servicios (`src/lib/dataService.ts`, `src/lib/authContext.tsx`). La UI no debe armar queries complejas ni alterar reglas de cálculo de saldos en línea.
- **Utilidades Puras:** Funciones puras y deterministas en `src/lib/dateUtils.ts` y helpers sin efectos secundarios, testeables de forma aislada.
- **Eliminación de Código Muerto:** Remover importaciones no utilizadas, variables huérfanas y funciones deprecadas antes de cada commit.

---

## 3. Prácticas en Componentes React y Hooks

- **Reglas de Hooks de React:** Llamar a todos los Hooks en el nivel superior del componente. Nunca invocar hooks después de retornos condicionales (`if (!usuario) return <Loading />`).
- **Dependencias en `useEffect`:** Completar siempre la matriz de dependencias (`exhaustive-deps`). Si una función se utiliza dentro de un efecto, memorizarla con `useCallback` o incluirla en el scope del efecto.
- **Evitar llamadas sincronizadas a `setState` en el cuerpo del efecto:** No sincronizar estado derivado llamando a `setState` directamente en el cuerpo del efecto cuando el valor puede derivarse al vuelo durante el renderizado.
- **Escape de entidades en JSX:** Reemplazar comillas dobles literales en texto JSX por `&quot;` o envolverlas entre llaves `{"\"Texto\""}`.

---

## 4. Principios SOLID, DRY y KISS

- **Single Responsibility (SRP):** Cada módulo, clase o componente debe tener un único motivo de cambio.
- **DRY Pragmático:** Reutilizar utilidades y componentes cuando exista una verdadera coincidencia de dominio; evitar abstracciones prematuras si los casos de uso divergen.
- **KISS (Keep It Simple, Stupid):** Preferir soluciones directas, legibles y auditables sobre patrones excesivamente complejos o metaprogramación innecesaria.
- **Prohibición de refactorizaciones cosméticas extensas:** Durante la resolución de incidentes o correcciones críticas, está prohibido reescribir archivos enteros por gusto estético. Las modificaciones deben ser mínimas, quirúrgicas y probadas.

---

## 5. Control de Calidad Estática Previo a la Entrega

Antes de dar por finalizada cualquier tarea de desarrollo:
1. `npm run lint`: Debe pasar con 0 errores.
2. `npx tsc --noEmit`: Verificación estricta de TypeScript aprobada.
3. `npm run build`: Compilación de producción exitosa.
