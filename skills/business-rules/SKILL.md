---
name: business-rules
description: Reglas del negocio oficiales de Placeres Culinarios (padres, colegios, pedidos, pagos, fiados y zona horaria).
---

# SKILL 5 — BUSINESS RULES

## Objetivo
Preservar y hacer cumplir estrictamente las reglas comerciales aprobadas de la plataforma Placeres Culinarios, impidiendo alteraciones inadvertidas en la lógica operativa de colegios, familias, cocina y finanzas.

---

## 1. Reglas de Padres y Estudiantes

- **Gestión Estricta de Hijos:** Los padres solo pueden registrar, editar o ver información de sus propios hijos. No tienen visibilidad sobre el alumnado de otras familias.
- **Pedidos Vinculados:** Un pedido solo puede registrarse para un estudiante previamente seleccionado y vinculado al padre.
- **Carta Escolar por Colegio:** Cuando un padre selecciona a un hijo para hacer un pedido, el catálogo de platos (sopas/postres y segundos) debe filtrarse exclusivamente según el colegio al que pertenece dicho estudiante.
- **Historial Privado:** En "Mis Pedidos", el padre solo visualiza las órdenes de sus hijos registrados.

---

## 2. Aislamiento y Roles de Colegios

- **Colegios 100% Independientes:** Cada colegio posee sus propios grados y secciones, observaciones predeterminadas, carta semanal de menús, lista de alumnos, cocina, despacho y fiados. No se mezclan atributos ni catálogos entre colegios.
- **Administrador de Colegio (Sede):**
  - Limitado exclusivamente al colegio al que fue asignado (`usuario.colegioNombre`).
  - No puede ver pedidos, alumnos, métricas ni fiados de otras sedes escolares.
  - No debe mostrarse el selector o pestaña de "Mi Sede" en su panel; opera directamente en su colegio.
- **Super Administrador:**
  - Alcance global autorizado.
  - Puede visualizar el consolidado general ("TODOS") o auditar individualmente cualquier colegio.
  - Único autorizado para crear nuevos colegios y asignar o renovar credenciales de administradores de sede.

---

## 3. Ciclo de Vida del Pedido

- **Validación de Horario de Corte:**
  - El horario oficial de corte de pedidos para el mismo día es las **09:30 AM** (hora de Perú).
  - Los pedidos posteriores a este límite deben gestionarse con advertencia o programarse para fechas futuras según configuración.
- **Confirmación Previa:** Antes de enviar el pedido a la base de datos, el sistema debe solicitar corroboración explícita al padre mediante un modal resumen con los datos del alumno, colegio, platos seleccionados y método de pago.
- **Prevención de Duplicados:** Evitar la creación accidental de múltiples pedidos para el mismo estudiante en la misma fecha de almuerzo.
- **Preservación Histórica:** Modificaciones posteriores de catálogo (por ejemplo, renombrar un plato) no deben alterar los nombres guardados en pedidos históricos ya emitidos.

---

## 4. Pagos, Entrega y Despacho

- **Yape / Plin (Pagos Digitales):**
  - Requieren comprobante de pago subido por el padre.
  - El pedido nace en estado de pago `PENDIENTE` (o `VERIFICANDO`).
  - En Despacho, la entrega del almuerzo requiere que el administrador verifique y acepte el pago (`PAGADO`), salvo excepción manual autorizada.
- **Pagar Luego (Crédito / Fiado):**
  - Permite la entrega del almuerzo al estudiante sin exigir pago previo.
  - El estado del pedido pasa a `ENTREGADO`, pero el pago se mantiene estrictamente en `PENDIENTE`.
  - La orden se registra de inmediato en el módulo de **Fiado** como deuda pendiente del padre.
- **Protección de Pedidos Entregados:**
  - Un pedido marcado como `ENTREGADO` queda protegido contra modificaciones accidentales de pago en el panel de despacho regular. Su liquidación se realiza formalmente en el módulo de Fiados o mediante acción auditada.
- **Preservación de Notas y Alergias:**
  - Al marcar como entregado un pedido o revertir su estado, las notas médicas, alergias y preferencias alimentarias del estudiante **nunca** deben sobrescribirse ni borrarse.

---

## 5. Módulo de Cocina

- **Consolidado Universal:** El contador "Almuerzos a Cocinar - Órdenes confirmadas" y el consolidado de porciones (sopas/postres y segundos) debe sumar **todos los pedidos realizados para la fecha**, se hayan pagado o no (incluyendo digital pendiente, efectivo y pagar luego).
- **Aislamiento Multitenant:** El superadmin puede alternar entre "TODOS" y cada colegio específico; el administrador de colegio solo ve las órdenes de su colegio.

---

## 6. Módulo de Fiados y Liquidaciones

- **Cálculo Exacto:** La deuda de un padre es la suma exacta de sus pedidos a crédito no pagados.
- **Liquidación Granular y Global:**
  - Es posible liquidar pedidos específicos mediante `pedidoIds` seleccionados.
  - La liquidación global de un padre que tenga hijos en múltiples colegios debe saldar las deudas de cada colegio de forma consistente y auditable, sin dejar saldos huérfanos.
- **Reportes:** El módulo de fiados debe emitir reportes globales detallados y reportes individuales por padre y por hijos con exportación íntegra a Excel e impresión.

---

## 7. Zona Horaria Oficial

- **Zona Horaria Estricta:** La zona horaria oficial del sistema es **`America/Lima` (UTC-5)**.
- **Cálculo de Fechas:** Todas las operaciones de fecha (día actual, filtros de hoy/ayer, fecha de entrega) deben calcularse en UTC-5, independientemente de que los servidores de producción (Vercel, Supabase) operen internamente en UTC.
- **Prohibición de Alterar Reglas de Negocio:** No modificar ninguna regla de negocio sin previa autorización expresa del usuario.
