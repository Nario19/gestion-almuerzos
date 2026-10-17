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

### D-007 — 2026-10-15 — Visualización y filtrado de fechas en Fiados

- Decisión: En la lista de fiados (`/fiado`), debe visualizarse explícitamente la fecha de cada consumo, deben aparecer y destacarse los consumos de "Hoy" y debe permitirse filtrar por fecha de manera flexible.
- Fuente: solicitud explícita del usuario.
- Impacto:
  1. Integración de barra de filtrado por fecha con selector de calendario (`input[type="date"]`), navegación de días (`<` / `>`), botón de acceso directo "Hoy" (con contador en vivo) y botón "Todas las Fechas" (histórico).
  2. Detección y destaque automático de pedidos de la fecha actual con badge `Consumo de HOY` en cabeceras de familias, desglose expandido, modal de reporte global y exportación a Excel.
  3. Cálculo de deuda segregada de la fecha seleccionada preservando el total acumulado histórico.
  4. Soporte en `dataService.obtenerFiados` para parámetro opcional `fechaFiltro` y fusión garantizada de pedidos locales en memoria para que órdenes registradas hoy bajo "Pagar luego" aparezcan de inmediato sin latencia.
  5. Creación de la suite de pruebas `tests/fiado-filtro-fechas.test.mjs`.

### D-008 — 2026-10-15 — Regla obligatoria de despliegue a producción y verificación en vivo

- Decisión: En absolutamente cada cambio, mejora, corrección o refactorización, además de ejecutar y aprobar toda la suite local de pruebas (`node tests/...`), el agente DEBE obligatoriamente subir los cambios a producción (rama `main` de GitHub -> Vercel) y realizar las pruebas y verificaciones correspondientes en el entorno de producción en vivo (`https://gestion-almuerzos-six.vercel.app`).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. Actualización de `skills/deployment-and-devops/SKILL.md` (Sección 1: Regla Obligatoria de Despliegue Continuo y Verificación Productiva).
  2. Actualización de `skills/professional-engineering-workflow/SKILL.md` (Pasos 8 y 9 dedicados a despliegue automático y verificación en vivo).
  3. Actualización de `AGENTS.md` (Criterios de Finalización 9 y 10).
  4. Ninguna tarea se reportará como finalizada sin haber sido probada en local, subida a `origin/main` y verificada en vivo en `https://gestion-almuerzos-six.vercel.app`.

### D-009 — 2026-10-15 — Paginación y simplificación visual en Control de Fiados

- Decisión: La pantalla de fiados (`/fiado`) debe contar con paginación de familias y una interfaz limpia y minimalista, reduciendo etiquetas redundantes y mostrando únicamente la información esencial para la cobranza y liquidación.
- Fuente: instrucción explícita del usuario ("debe tener pagination tambien el fiado y no dbe tener muchas labels que no sean necesarios mientras menos informacion ojo pero solo la necesaria estaria perfecto").
- Impacto:
  1. Paginación de tarjetas de familia con selector de registros por página (5, 8, 15, 25), navegación con primera página (`«`), anterior (`<`), números de página con elipsis, siguiente (`>`) y última página (`»`).
  2. Reset automático de página a 1 ante cualquier cambio en filtros de búsqueda, fecha, colegio o estado.
  3. Eliminación de etiquetas y textos secundarios redundantes en tarjetas de KPIs (textos explicativos innecesarios bajo los números).
  4. Simplificación visual de cabeceras de familias: badges concisos de deudas, fechas de consumo compactas sin etiquetas decorativas y tabla expandida con visualización limpia de pedidos.
  5. Incorporación de prueba automatizada en `tests/fiado-filtro-fechas.test.mjs` (paso 6).
### D-010 — 2026-10-15 — Seeder integral de prueba en base de datos en la nube
- Decisión: A petición explícita y temporal del usuario ("no hay problema con insertar datos fake en la bd de n la nube porque aun no esta en producción entonces podemos hacer eso y luego lo borramos solo es por esta vez..."), vaciar las tablas de Supabase y generar un juego completo de datos realistas para pruebas:
  1. 1 Super Administrador del Sistema.
  2. 3 Colegios con sus respectivos Administradores de Sede.
  3. Exactamente 60 estudiantes (hijos) por colegio (180 en total).
  4. Padres de familia vinculados con 1 o 2 hijos (40 padres por colegio: 20 padres con 2 hijos y 20 padres con 1 hijo, total 120 padres).
  5. Catálogo de 20 platos por colegio para toda la semana escolar (LUNES a VIERNES).
  6. 120 pedidos de prueba con fiados pendientes y pagados para validar el módulo de `/fiado` y su paginación.
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. Creación del script ejecutable `scripts/seed-completo.mjs` y adición del comando `npm run seed:completo`.
  2. Limpieza e inserción exitosa en Supabase (`https://mpautcrhfdsktnutrzpt.supabase.co`).
  3. Ejecución y aprobación de los 85 tests locales en verde.

### D-011 — 2026-10-15 — Independencia estricta de almuerzos, códigos correlativos y vistas por colegio
- Decisión: A petición explícita del usuario ("los almuerzos estan mezclados entre todos, es decir es global los pedidos, los pedidos deben ser independientes por cada colegio. es decir que le pondras un identificador por cada colegio y el numero de almuerzo. cada colegio tiene sus propios almuerzo eso corrige y crea las pruebas respectivas"):
  1. Identificadores canónicos por colegio: `CLA` (Colegio Claretiano), `CSA` (Colegio San Agustín), `CSR` (Colegio Santa Rosa), `CLS` (Colegio La Salle), `INC` (Inmaculada Concepción) y generación dinámica de siglas representativas para colegios adicionales.
  2. Correlativo secuencial de almuerzos aislado e independiente por colegio: `CLA-001`, `CLA-002`, `CSA-001`, `CSR-001`.
  3. Catálogo de platos de menú independiente por colegio: cada colegio tiene sus propios platos distintivos (ej. Seco de pollo claretiano, Arroz chaufa agustino, Pollo doradito santarrosino) sin mezclarse.
  4. Despacho (`/despacho`): visualización de "N° Almuerzo / Hora" con badge escolar (`#CLA-001`, `Almuerzo #1`) y exportación a Excel con columnas `Código` y `N° Almuerzo`.
  5. Cocina (`/cocina`): desglose independiente por colegio con tarjetas visuales exclusivas por sede, identificador y totales aislados.
  6. Suite automatizada completa en `tests/almuerzos-pedidos-independientes-colegios.test.mjs` con 92 tests en verde.
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. Tipado extendido en `src/types/index.ts` (`ResumenCocinaColegio`).
  2. Funciones `obtenerIdentificadorColegio`, `obtenerSiguienteNumeroAlmuerzoColegio`, `crearPedido` y `calcularResumenCocina` en `src/lib/dataService.ts`.
  3. UI de `/despacho` y `/cocina` actualizadas para reflejar códigos y almuerzos por colegio.
  4. `scripts/seed-completo.mjs` actualizado con 60 platos únicos y 120 pedidos clasificados con prefijos `CLA-xxx`, `CSA-xxx` y `CSR-xxx`.

### D-012 — 2026-10-15 — Estandarización de colores de pago y simplificación de botón en Despacho
- Decisión: A petición explícita del usuario ("en la columna de pago el yape debe aparecer de morado el plinde celeeste y el pagar luego de amarillo. y el boton solo debe decir aceptar pago y el metodo depago solo debeir eso en esa columna para todos"):
  1. Yape: Insignia en color morado representativo (`bg-purple-600 text-white font-black`).
  2. Plin: Insignia en color celeste representativo (`bg-sky-500 text-white font-black`).
  3. Pagar luego: Insignia en color amarillo representativo (`bg-yellow-400 text-slate-950 font-black`).
  4. Botón de pago en Despacho: Texto estricto "Aceptar pago" para todas las órdenes pendientes de pago (sin sufijos de método ni `(Por Cobrar)`).
  5. Estado pagado en Despacho: Texto estricto "Pago aceptado" (sin sufijos ni paréntesis).
  6. Columna de Pago limpia y uniforme: Eliminación de insignias accesorias como "Pendiente en Fiado" para mantener la vista minimalista y sin sobrecarga de etiquetas.
  7. Selector de pagos en Home (`/`): Alineación de Plin a celeste (`border-sky-500 bg-sky-50 text-sky-950`), Yape a morado y Pagar luego a amarillo.
  8. Suite de prueba automatizada en `tests/despacho-columna-pago-estilos.test.mjs` con 99 tests locales aprobados en verde.
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. Modificación en `src/app/despacho/page.tsx` (columna de Pago).
  2. Modificación en `src/app/page.tsx` (selector y banners de métodos de pago).
  3. Nueva suite `tests/despacho-columna-pago-estilos.test.mjs`.

### D-013 — 2026-10-15 — Opción de Cancelar Pedido en Despacho e Impacto Transversal en el Sistema
- Decisión: A petición explícita del usuario ("ahora agregaras la opcion de cancelar pedido en despacho debe haber una opcion de cancelar pedido, y este afectará a todo lo que tenga que ver con pedido obviamente"):
  1. Estado `CANCELADO`: Agregado formalmente a `EstadoPedido` en `src/types/index.ts`.
  2. Despacho (`/despacho`):
     - Botón "Cancelar pedido" en cada fila con modal de confirmación detallado (muestra estudiante, grado, colegio, plato y motivo opcional) para evitar cancelaciones accidentales.
     - Filas canceladas muestran badge distintivo `CANCELADO`, no muestran botones de cobro activo ("Pedido cancelado") y ofrecen la opción de "Reactivar pedido" en caso de error.
     - Métricas operativas (`faltaEntregar`, `pendientesPago`, `pagados`) excluyen automáticamente los pedidos cancelados.
  3. Cocina (`/cocina`): Los pedidos cancelados se excluyen estrictamente de las preparaciones, desglose por platos, colegios y alertas de alergias u observaciones.
  4. Fiados (`/fiado`):
     - `obtenerFiados` y `liquidarDeudaPadre` excluyen pedidos con `estado_pedido = 'CANCELADO'`, evitando que se atribuya deuda o se exija cobro a los padres por pedidos no servidos.
  5. Panel Administrativo (`/admin`):
     - Los indicadores financieros y operacionales (ventas totales, almuerzos activos, por cobrar) operan exclusivamente sobre pedidos activos, excluyendo cancelados.
     - La tabla de pedidos recientes muestra la insignia `CANCELADO` en color rosa/rojo.
  6. Historial de Pedidos para Padres (`/pedidos`):
     - Las órdenes canceladas muestran el estado "Cancelado" con badge representativo y timeline informativo indicando la cancelación.
  7. Suite de prueba automatizada completa en `tests/cancelar-pedido-despacho-integracion.test.mjs` con 114 tests del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/types/index.ts`
  2. `src/lib/dataService.ts` (`cancelarPedido`, `cambiarEstadoPedido`, `calcularResumenCocina`, `obtenerFiados`, `liquidarDeudaPadre`, `obtenerColegiosDetallados`)
  3. `src/app/despacho/page.tsx`
  4. `src/app/cocina/page.tsx`
  5. `src/app/admin/page.tsx`
  6. `src/app/pedidos/page.tsx`
  7. `tests/cancelar-pedido-despacho-integracion.test.mjs`

### D-014 — 2026-10-16 — Filtros Operativos en Despacho por Rol: Colegios sólo para Superadmin y Estados para Todos
- Decisión: A petición explícita del usuario ("para el superadmin esta perfecto que haya filtros por colegios en desapcho por ejemplo pero para los admins ya no debe haber esos filtros sino filtros como de cancelador entregados pagados o n opagados, etc y el superadmin si debe tener ambos"):
  1. Filtro por Colegio: Condicionado estrictamente a `esSuperAdmin`. Los administradores de colegio no ven la fila de botones de selección de colegios (evitando ruido visual y redundancia).
  2. Identificación de Sede para Administrador: En la cabecera se muestra un badge claro con su colegio asignado (`🏫 Sede: [Colegio]`).
  3. Filtros por Estado Operativo: Disponibles para todos (Administradores de sede y Super Administrador):
     - `Todos`: Visualiza el total consolidado.
     - `Entregados`: Filtra pedidos con `estadoPedido === 'ENTREGADO'`.
     - `Falta Entregar`: Filtra pedidos activos pendientes de entrega (`estadoPedido !== 'ENTREGADO' && estadoPedido !== 'CANCELADO'`).
     - `Pagados`: Filtra pedidos activos con pago verificado (`estadoPago === 'PAGADO' && estadoPedido !== 'CANCELADO'`).
     - `No Pagados`: Filtra pedidos activos pendientes de cobro (`estadoPago !== 'PAGADO' && estadoPedido !== 'CANCELADO'`).
     - `Cancelados`: Filtra órdenes en estado `CANCELADO`.
  4. Tarjetas KPI Interactivas: Las tarjetas de métricas en la parte superior actúan como atajos de filtrado rápido al hacer clic en ellas.
  5. Paginación y Exportación a Excel: Sincronizadas dinámicamente con `totalFiltrados` y registran el estado operativo seleccionado en el nombre del archivo y reporte.
  6. Suite automatizada en `tests/despacho-filtros-rol-estado.test.mjs` con 120 tests aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/app/despacho/page.tsx`
  2. `tests/despacho-filtros-rol-estado.test.mjs`

## Contexto observado el 2026-10-14 (no decisiones del usuario)

- Aplicación de almuerzos escolares con Next.js 16 (App Router), React 19, TypeScript estricto, Tailwind CSS y Supabase PostgreSQL.
- Reglas de negocio confirmadas: zona horaria oficial `America/Lima`, hora de corte 09:30 AM, menús independientes por colegio, administradores de colegio con acceso restringido a su sede, superadmin global.
- Flujo de estados: Registro -> Validación/Pago -> Cocina (prepara todos los pedidos registrados pagados o no) -> Despacho/Entrega -> Fiado (deuda y liquidación de saldos).
- Las políticas RLS de Supabase deben verificarse y reforzarse para evitar accesos cruzados entre colegios o padres.
- Los catálogos iniciales de colegios y platos son vacíos; no sembrar datos ficticios.

## Pendientes de definición

- Validar con el cliente si el precio de S/ 12 es universal o si se habilitarán formalmente platos con precios variables en la interfaz de compra pública.
- Establecer si el cierre a las 09:30 AM debe rechazar pedidos automáticamente en el backend vía trigger/función SQL o mantenerse como aviso visual en frontend.
