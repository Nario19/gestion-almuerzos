---
name: almuerzos-pedidos-pagos
description: Modificar flujos de pedidos, pagos, entrega y fiados de gestion-almuerzos preservando reglas de cobro, fechas de Perú y alcance por colegio.
---

# Cambiar pedidos y pagos

Leer `AGENTS.md` y `MEMORY.md` desde la raíz. Identificar el escenario solicitado y los roles afectados antes de editar.

## Seguir el flujo existente

1. Leer los contratos `Pedido`, `EstadoPedido`, `EstadoPago` y `MetodoPago` en `src/types/index.ts` y los mapeos/operaciones correspondientes de `src/lib/dataService.ts`.
2. Revisar las pantallas consumidoras: `src/app/page.tsx`, `pedidos/page.tsx`, `despacho/page.tsx`, `cocina/page.tsx` y `fiado/page.tsx`, según el cambio. Leer la guía local de Next.js aplicable antes de escribir código.
3. Mantener separados el estado del pago y el estado de entrega. En despacho, Yape/Plin requieren `PAGADO` para entregar; «Pagar luego» permite deuda. La liquidación admite también `Efectivo` heredado. Un pedido entregado y pagado no debe volver a pendiente desde despacho, salvo cambio explícito de esa regla.
4. Conservar filtros de colegio en consultas, agregaciones, liquidaciones y reportes. Comprobar que una liquidación de un padre no alcance sus pedidos de otro colegio.
5. Para fechas, usar `src/lib/dateUtils.ts`. El mapeo actual puede derivar la fecha del pedido desde `created_at`; revisar esa precedencia al tocar filtros. Conservar hora de entrega y compatibilidad de etiquetas en observaciones.
6. Revisar el camino Supabase y el camino local, sus notificaciones y los errores que recibe la UI. No considerar una caché actualizada como prueba de persistencia remota.

## Validación enfocada

Consultar `skills/almuerzos-validar/SKILL.md`. Elegir entre `timeline-flujo`, `fiado-pagarluego-colegios`, `paginacion-bloqueo-pago`, `admin-scoping-fiado-reportes` y `zona-horaria-peru` dentro de `tests/`.

Para cambios funcionales, comprobar el caso solicitado y sus límites relevantes: pago pendiente/verificando/pagado, entrega a crédito, fecha cerca de medianoche UTC, padre con pedidos en distintos colegios y exportación con paginación. Las exportaciones deben conservar todos los registros del filtro, no solo la página visible.

Registrar en `MEMORY.md` nuevas decisiones del usuario sobre el negocio, sin convertir decisiones de implementación del agente en requisitos aprobados.
