# Memoria de decisiones

## Cómo mantener este archivo

Registrar decisiones importantes expresadas por el usuario: fecha, decisión, fuente, motivo si fue indicado e impacto. Separar hechos observados de decisiones. No inventar razones ni convertir una sugerencia del agente en una decisión aprobada. No guardar secretos, tokens, credenciales ni datos personales.

Si una decisión cambia, conservar su contexto y marcarla como reemplazada por la nueva entrada. No convertir esta memoria en un registro de cada edición o prueba.

## Decisiones confirmadas

### D-001 — 2026-10-14 — Instrucciones del proyecto

- Decisión: analizar primero el proyecto y crear o sustituir `AGENTS.md` para documentar nombres, tecnologías y lo que está prohibido tocar.
- Fuente: solicitud explícita del usuario en esta conversación.
- Impacto: `AGENTS.md` es la guía del repositorio. Se conserva el bloque generado por Next.js; `CLAUDE.md` ya referencia `@AGENTS.md`.

### D-002 — 2026-10-14 — Memoria persistente

- Decisión: crear `MEMORY.md`, referenciarlo desde `AGENTS.md` y registrar aquí cada decisión importante que tome el usuario.
- Fuente: solicitud explícita del usuario en esta conversación.
- Impacto: consultar la memoria al empezar y actualizarla con decisiones relevantes posteriores.

### D-003 — 2026-10-14 — Tareas repetitivas como skills

- Decisión: documentar como skills los procedimientos reutilizables del proyecto.
- Fuente: solicitud explícita del usuario en esta conversación.
- Impacto: se crean procedimientos locales en `skills/` para validación, pedidos/pagos y colegios.

### D-004 — 2026-10-14 — Pruebas por funcionalidad y regresión después de cada cambio

- Decisión: toda funcionalidad nueva tendrá sus pruebas; también se crearán pruebas para las funcionalidades existentes que carezcan de ellas. Después de cada cambio se ejecutarán las pruebas para detectar roturas del sistema.
- Fuente: solicitud explícita del usuario en esta conversación.
- Motivo indicado: detectar si un cambio rompe algo en el sistema.
- Impacto: se añade la skill de pruebas y regresión obligatoria vinculada desde `AGENTS.md`. Se exige una ejecución final de toda la suite local después de la última edición.

### D-005 — 2026-10-14 — Corrección de los 6 hallazgos críticos de la revisión

- Decisión: corregir prioritariamente los 6 hallazgos de seguridad, integridad y estabilidad detectados en la auditoría del proyecto:
  1. Permisos vulnerables: revalidación de sesión y rol contra base de datos, revocación de cuentas inactivas y prevención de alteración de privilegios en el navegador.
  2. Pedidos con falso éxito: propagación de errores de persistencia en `crearPedido` y generación de identificadores robustos sin colisión (`ALM-...`).
  3. Pérdida de observaciones: preservación íntegra de alergias y notas en `cambiarEstadoPedido` al entregar o revertir estados.
  4. Colegios y administradores: actualización en cascada al renombrar colegios, revocación automática del rol `ADMIN` a `PADRE` al eliminar un colegio y bloqueo estricto en pantallas de gestión si el administrador no tiene sede asignada.
  5. Historial: reubicación de hooks de React antes de retornos condicionales en `pedidos/page.tsx` para evitar roturas de renderizado.
  6. Fiados: soporte de liquidación granular con `pedidoIds` y liquidación global `TODOS` para evitar saldo deudor huérfano entre múltiples colegios.
- Fuente: solicitud explícita del usuario en esta conversación.
- Impacto: creación de la suite de pruebas `tests/regresiones-criticas-revision.test.mjs` y migración SQL complementaria `supabase/migrations/202610140001_integridad_y_acceso.sql`.

### D-006 — 2026-10-14 — Directiva Maestra de Ingeniería Profesional y 12 Skills Obligatorias

- Decisión: adoptar con carácter vinculante y permanente la Directiva Maestra de Ingeniería Profesional para Placeres Culinarios:
  1. Principio innegociable de cero regresiones en cada cambio, refactorización o corrección.
  2. Política de clasificación de riesgos para cambios técnicos (Bajo, Medio, Alto, Crítico).
  3. Implementación obligatoria de 12 Skills formales en `skills/`:
     - SKILL 1 — Coding Standards
     - SKILL 2 — Next.js React Architecture
     - SKILL 3 — Security Standards
     - SKILL 4 — Supabase PostgreSQL
     - SKILL 5 — Business Rules
     - SKILL 6 — Testing and QA
     - SKILL 7 — Regression Prevention
     - SKILL 8 — Performance Optimization
     - SKILL 9 — Deployment and DevOps
     - SKILL 10 — ISO Quality and Compliance
     - SKILL 11 — Professional Engineering Workflow
     - SKILL 12 — Data Privacy and School Safety
  4. Flujo transversal de ingeniería de 10 pasos para todas las tareas futuras.
  5. Controles estrictos de privacidad y seguridad infantil: protección de notas de alergias, aislamiento multitenant por colegio y retención responsable.
- Fuente: solicitud explícita del usuario mediante la Directiva Maestra de Ingeniería Profesional.
- Impacto: actualización de `AGENTS.md`, creación/consolidación de las 12 Skills en `skills/`, auditoría integral del código fuente y mitigación de problemas de calidad estática y tipos.

## Contexto observado el 2026-10-14 (no decisiones del usuario)

- Aplicación de almuerzos escolares con Next.js 16 (App Router), React 19, TypeScript estricto, Tailwind CSS y Supabase PostgreSQL.
- Reglas de negocio confirmadas: zona horaria oficial `America/Lima`, hora de corte 09:30 AM, menús independientes por colegio, administradores de colegio con acceso restringido a su sede, superadmin global.
- Flujo de estados: Registro -> Validación/Pago -> Cocina (prepara todos los pedidos registrados pagados o no) -> Despacho/Entrega -> Fiado (deuda y liquidación de saldos).
- Las políticas RLS de Supabase deben verificarse y reforzarse para evitar accesos cruzados entre colegios o padres.
- Los catálogos iniciales de colegios y platos son vacíos; no sembrar datos ficticios.

## Pendientes de definición

- Validar con el cliente si el precio de S/ 12 es universal o si se habilitarán formalmente platos con precios variables en la interfaz de compra pública.
- Establecer si el cierre a las 09:30 AM debe rechazar pedidos automáticamente en el backend vía trigger/función SQL o mantenerse como aviso visual en frontend.
