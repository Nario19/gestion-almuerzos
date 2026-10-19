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
- Impacto:
  1. `src/app/despacho/page.tsx`
  2. `tests/despacho-filtros-rol-estado.test.mjs`

### D-015 — 2026-10-16 — Eliminación de Widgets y Filtros de Colegio para Administrador y Filtrado por Fecha en Admin
- Decisión: A petición explícita del usuario ("sigue habiendo filtros por coelgios en los admin, como en dashbaord y kpis Demanda por Colegio 1 colegios Colegio San Agustín 2 (100%) 1 colegios atendidos ... https://gestion-almuerzos-six.vercel.app/cocina Filtrar por: 🏫 Colegio: Colegio San Agustín ... Almuerzos Independientes por Colegio 1 sedes con pedidos ... https://gestion-almuerzos-six.vercel.app/admin esto tmb debe tener su filtrado como los demas por fecha y hoy"):
  1. Cocina (`/cocina`):
     - Barra de filtro por sede condicionada estrictamente a `esSuperAdmin`. El administrador de colegio ya no ve la fila de botones ni etiquetas redundantes de filtrado por colegio.
     - En el header se añade la insignia limpia `🏫 Sede: [Colegio]` para administradores de sede.
     - Sección "Almuerzos Independientes por Colegio" condicionada exclusivamente a `esSuperAdmin`, evitando que el admin de colegio vea un desglose redundante de 1 sede.
  2. Panel Administrativo (`/admin`):
     - Selector completo de fechas: input nativo de calendario (`type="date"`), navegación de día anterior y siguiente (`<` / `>`), botón rápido "Hoy", "Últimos 7 días" e "Histórico / Todas las Fechas", sincronizado con `pedidosPeriodo`.
     - KPI 2 ("Total Almuerzos"): muestra `[X] colegios atendidos` únicamente para SuperAdmin; para administrador de colegio muestra su sede (`Sede: [Colegio]`) o el total de raciones activas, eliminando "1 colegios atendidos".
     - Tarjeta "Demanda por Colegio": condicionada exclusivamente a `esSuperAdmin`. Cuando no es SuperAdmin, se oculta y la tarjeta de "Platos Más Solicitados" ocupa el ancho completo sin espacios vacíos.
     - Selectores de sede en pestañas "Menú Semanal", "Grados y Secciones" y "Observaciones": condicionados exclusivamente a `esSuperAdmin`.
  3. Suite automatizada en `tests/admin-cocina-filtros-rol-fechas.test.mjs` con 130 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/app/cocina/page.tsx`
  2. `src/app/admin/page.tsx`
  3. `tests/admin-cocina-filtros-rol-fechas.test.mjs`

### D-016 — 2026-10-17 — Experiencia de App Móvil para Padres (BottomNav, /perfil) y Estandarización de "Hijos" con Mayúsculas
- Decisión: A petición explícita del usuario ("NO DEBE APARECER ESTUDIANTES DEBE APARECER HIJOS. Y CUANDO ESCRIBAN EL NOMBRE DE LOS HIJOS QUE APAREZCA DE MAYUSCULAS, ENVES Q DIGA AGREGAR ESTUFIANTE DEBE DECIR AGREGAR HIJO.Y DEBE TENER EL DE LOS PADRES DEBE TENER UN NAVBAR DEBAJO COMO DE UNA APP MOVIL CON PEDIDOS, HIJOS, PERFIL Y EL DEL MEDIO DE PEDIR MENU, LA INTERFAZ DE LOS PADRES DEBE SER COMO UNA APP MOVIL."):
  1. Estandarización de Nomenclatura Familiar:
     - En todas las pantallas de padres (`/hijos`, `/`, modales de agregar y corroboración), se eliminó la denominación "Estudiante(s)" reemplazándola estrictamente por "Hijo(s)" (ej. "Mis Hijos", "Registrar Nuevo Hijo", "Hijos Registrados", "+ Agregar Hijo", "Hijo y Destino").
     - En el botón de registro de `/hijos` se fijó textualmente "+ Agregar Hijo" en lugar de "Agregar estudiante".
  2. Forzado Automático de Nombres en Mayúsculas:
     - En los inputs de nombres de hijos (tanto en `/hijos` como en el modal rápido de `/`), se implementó la conversión reactiva inmediata con `.toUpperCase()` en `onChange` y la clase CSS `uppercase font-medium`.
  3. Navbar Inferior Móvil Tipo App (`BottomNav.tsx`):
     - Barra de navegación fija inferior (`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t`) exclusiva para la experiencia de los padres y usuarios generales (`if (esAdmin || esSuperAdmin) return null;`).
     - 4 accesos principales con botón central prominente:
       - `Pedidos`: acceso a `/pedidos` con icono `ShoppingBag`.
       - `Hijos`: acceso a `/hijos` con icono `GraduationCap` y badge con conteo dinámico de hijos registrados.
       - `Pedir Menú`: botón central sobreelevado/flotante circular tipo FAB (`-mt-6 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600`) que conduce al menú principal `/`.
       - `Perfil`: acceso a `/perfil` con icono `User`.
     - En `src/app/layout.tsx` se integró `<BottomNav />` y se aplicó padding inferior defensivo `pb-24 md:pb-20` al `<main>` para evitar cualquier solapamiento.
     - En `HeaderNav.tsx` se ocultaron los accesos redundantes de padres en móviles (`hidden sm:flex`), dejando la barra superior limpia.
  4. Nueva Pantalla de Perfil de Padres (`/perfil`):
     - Diseñada con formato de aplicación móvil: tarjeta de apoderado con iniciales/avatar, DNI, teléfono, lista detallada de hijos inscritos con accesos rápidos a gestión y botón de cierre de sesión.
  5. Suite automatizada en `tests/mobile-parent-navbar-hijos.test.mjs` con 136 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/components/BottomNav.tsx` (nuevo)
  2. `src/app/perfil/page.tsx` (nuevo)
  3. `src/app/layout.tsx`
  4. `src/components/HeaderNav.tsx`
  5. `src/app/hijos/page.tsx`
  6. `src/app/page.tsx`
  7. `tests/mobile-parent-navbar-hijos.test.mjs` (nuevo)

### D-017 — 2026-10-18 — Configuración Centralizada de Métodos de Pago (Yape y Plin) para Superadmin con Alcance Global
- Decisión: A petición explícita del usuario ("en la interfaz del SUPERADMIN DEBES PONER PARA PODER EDITAR EL NRO DE YAPE, PLIN PARA QUE ESTE APAREZCA EN EL METODO DE PAGO. ESTO SI SERA CONFIGURABLE PERO DEL SUPERADMIN PORQUE PARA TODOS LOS COLEGIOS SERÁ IGUAL."):
  1. Centralización Global en Superadmin (`/superadmin`):
     - Tarjeta destacada "Métodos de Pago Globales (Yape & Plin)" con badge "Para Todos los Colegios", mostrando en tiempo real los números y titulares actuales.
     - Botón "Editar Yape / Plin" tanto en la tarjeta como en la barra superior de acciones de Superadmin.
     - Modal de configuración (`modalPagosAbierto`) con inputs para: Número de Yape, Titular de Yape, Número de Plin, Titular de Plin, y vista previa interactiva en tiempo real del checkout.
  2. Persistencia Robusta en Supabase y Memoria:
     - Definición del contrato público `ConfiguracionPagos` en `src/types/index.ts`.
     - Funciones `dataService.obtenerConfiguracionPagos()` y `dataService.guardarConfiguracionPagos()` con persistencia en `menus_dia` (`dia_semana = 'SABADO'`) dentro de `mensaje_aviso` en formato JSON, con sincronización en `localStorage` y notificación en tiempo real a suscriptores (`notifyListeners()`).
  3. Visualización Dinámica en el Proceso de Pago de Padres (`/`):
     - Eliminación de números hardcodeados en los recuadros de Yape y Plin en `src/app/page.tsx`.
     - Carga reactiva de `configPagos` mediante `dataService.obtenerConfiguracionPagos()`, actualizando en vivo los números y titulares visibles para cualquier colegio.
  4. Suite automatizada en `tests/superadmin-configuracion-pagos-yape-plin.test.mjs` con 142 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/types/index.ts`
  2. `src/lib/dataService.ts`
  3. `src/app/superadmin/page.tsx`
  4. `src/app/page.tsx`
  5. `tests/superadmin-configuracion-pagos-yape-plin.test.mjs` (nuevo)

### D-018 — 2026-10-18 — BottomNav Exclusivo para Padres Logueados, Filtro de Colegio en Carta Pública y Botones Iniciar Sesión/Registrarme
- Decisión: A petición explícita del usuario ("[Pedidos](https://gestion-almuerzos-six.vercel.app/pedidos)[Hijos](https://gestion-almuerzos-six.vercel.app/hijos)Pedir Menú [Perfil](https://gestion-almuerzos-six.vercel.app/perfil) esta interfaz como de app movil solo debe aparecer cuando entré como padre. sino estoy logueado solo debe aparecer la carta semanal y debo poder filtrarlo por colegio y en el navbar superior el boton de iniciar sesion y de registrarme"):
  1. BottomNav Condicional y Exclusivo:
     - `BottomNav.tsx` retorna estrictamente `null` si `!usuario`, si `esAdmin` o `esSuperAdmin`, o si `usuario.rol !== 'PADRE'`. Los visitantes no autenticados y los roles administrativos no ven la barra inferior de app móvil.
  2. Vista Pública de Carta Semanal con Filtro de Colegio:
     - En `src/app/page.tsx`, cuando el usuario no está logueado (`if (!usuario)`), se presenta la Carta Semanal enriquecida con un selector interactivo de sede (`<Building2 />` + `<select>`) para filtrar los platos del colegio elegido de forma reactiva.
  3. Header Superior para Visitantes con Iniciar Sesión y Registrarme:
     - En `HeaderNav.tsx`, para usuarios no autenticados, se muestran dos accesos diferenciados:
       - Botón "Iniciar Sesión" (hacia `/login`, con estilo sobrio `bg-slate-900`).
       - Botón "Registrarme" (hacia `/login?modo=registro`, con botón llamativo `bg-orange-500` e icono `UserPlus`).
     - En `src/app/login/page.tsx`, se implementó detección de query parameter `modo=registro` vía `useSearchParams()` dentro de un boundary de `<Suspense>`, activando inmediatamente el formulario de registro.
  4. Suite automatizada en `tests/mobile-parent-navbar-hijos.test.mjs` con 143 tests totales del sistema aprobados en verde (`0` fallos) y compilación limpia en Next.js.
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/components/BottomNav.tsx`
  2. `src/components/HeaderNav.tsx`
  3. `src/app/login/page.tsx`
  4. `src/app/page.tsx`
  5. `tests/mobile-parent-navbar-hijos.test.mjs`

### D-019 — 2026-10-19 — Almacenamiento de Comprobantes de Pago y Fotos en Cloudinary (Desacoplamiento de Supabase PostgreSQL)
- Decisión: A petición explícita del usuario ("quiero guardar los comprobantes de pago en cloudinary por ejemplo para quen o llené la bd gratuita de supabase. com olo hariamos evlualo para que no llene la bd ... si ya hice todo lo que indicaste dejalo listo"):
  1. Diagnóstico y Mitigación de Saturación de PostgreSQL:
     - Anteriormente, las capturas de comprobantes se almacenaban como cadenas Base64 de 60-150 KB en la columna `comprobante_url` de la tabla `pedidos`, lo que saturaría los 500 MB de disco del plan gratuito de Supabase en 1-2 meses.
  2. Implementación de Servicio Cloudinary (`src/lib/cloudinaryService.ts`):
     - Módulo de subida directa a la API REST de Cloudinary mediante Upload Preset no firmado (Unsigned), utilizando las variables `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
     - Incluye fallback de contingencia transparente: si las credenciales no están disponibles o falla la conexión externa, preserva la operación sin rechazar la orden del padre.
  3. Integración en el Checkout de Padres (`src/app/page.tsx`):
     - Al seleccionar captura de pago, se optimiza localmente a ~50 KB y se sube de inmediato a Cloudinary en la carpeta `comprobantes`.
     - En Supabase PostgreSQL sólo se almacena la URL segura HTTPS de Cloudinary (~70 bytes vs 100,000 bytes, reducción de almacenamiento del 99.95%).
     - Indicador de estado en tiempo real ("Optimizando y guardando comprobante en la nube..." y badge "En Cloudinary").
  4. Optimización de Fotos de Platos en Administración (`src/app/admin/page.tsx`):
     - En `handleFotoUpload`, las fotos de platos del menú semanal se suben a la carpeta `platos` en Cloudinary para evitar saturar la tabla `platos` con Base64.
  5. Suite automatizada en `tests/cloudinary-comprobantes-upload.test.mjs` con 149 tests totales del sistema aprobados en verde (`0` fallos) y compilación limpia en Next.js.
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/lib/cloudinaryService.ts` (nuevo)
  2. `src/app/page.tsx`
  3. `src/app/admin/page.tsx`
  4. `.env.example`
  5. `tests/cloudinary-comprobantes-upload.test.mjs` (nuevo)

### D-020 — 2026-10-19 — Visualización de Comprobante Adjunto en Pantalla de Corroboración de Pedido
- Decisión: A petición explícita del usuario ("primero n la pantalla de confirmar pedido que se cargue el comprobante para que pueda verificar si es el correcto"):
  1. Renderizado de Vista Previa del Comprobante:
     - En el modal de confirmación y corroboración de pedido en `src/app/page.tsx`, se integró un bloque visual de previsualización que carga la imagen del comprobante (`cloudinaryUrl` o `comprimidoInfo?.compressedDataUrl`).
     - Permite al padre verificar visualmente la captura (monto de S/ 12.00, destinatario y número de operación) antes de confirmar el pedido.
  2. Manejo de Casos sin Comprobante:
     - Si el método seleccionado es Yape/Plin y no se adjuntó captura, se muestra un aviso informativo de apoyo recordando que podrá enviarse luego por WhatsApp o la administración validará el pago.
  3. Suite automatizada en `tests/cloudinary-comprobantes-upload.test.mjs` con 150 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/app/page.tsx`
  2. `tests/cloudinary-comprobantes-upload.test.mjs`

### D-021 — 2026-10-19 — Remoción de Botón WhatsApp en Éxito, Optimización de Calendario en Pedidos y Adopción Universal de Skeleton Loaders
- Decisión: A petición explícita del usuario ("en la pantalla de pedido registrado con exito ya no debe tener el boton de enviar comprobante por whatsapp , y en la pantalla de historial de pedidos el calendario n ose esta mostrando bien, y la pantalla de carga de todo el sistema debe ser de skeleton."):
  1. Pantalla de Éxito Limpia:
     - En `src/app/page.tsx`, se removió el botón redundante de "Enviar comprobante por WhatsApp". Dado que el comprobante se sincroniza automáticamente con Cloudinary y el sistema de despacho, el botón principal pasa a ser "Ver en Mis Pedidos" y el secundario "Hacer otro pedido".
  2. Corrección del Calendario en Historial de Pedidos:
     - En `src/app/pedidos/page.tsx`, se rediseñó el selector de fecha: contenedor responsivo con icono `Calendar` visible, navegación con flechas táctiles (`<` / `>`), input nativo `type="date"` sin desbordes en móviles y botón de reset "Ver todos".
  3. Adopción de Skeleton Loaders en todo el sistema:
     - Se creó la biblioteca modular `src/components/Skeleton.tsx` con componentes especializados: `SkeletonHomePage`, `SkeletonPedidosPage`, `SkeletonHijosPage`, `SkeletonPerfilPage`, `SkeletonDashboardPage`, `SkeletonLoginPage` y `Skeleton`.
     - Se implementó `src/app/loading.tsx` para transiciones globales de Next.js App Router.
     - Se sustituyeron todos los spinners planos y textos de "Cargando..." por estados Skeleton con efecto shimmer en `/`, `/pedidos`, `/hijos`, `/perfil`, `/login`, `/admin`, `/despacho`, `/cocina`, `/fiado` y `/superadmin`.
  4. Suite automatizada en `tests/pedidos-success-whatsapp-calendar-skeleton.test.mjs` con 155 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/components/Skeleton.tsx` (nuevo)
  2. `src/app/loading.tsx` (nuevo)
  3. `src/app/page.tsx`
  4. `src/app/pedidos/page.tsx`
  5. `src/app/hijos/page.tsx`
  6. `src/app/perfil/page.tsx`
  7. `src/app/login/page.tsx`
  8. `src/app/admin/page.tsx`
  9. `src/app/despacho/page.tsx`
  10. `src/app/cocina/page.tsx`
  11. `src/app/fiado/page.tsx`
  12. `src/app/superadmin/page.tsx`
  13. `tests/pedidos-success-whatsapp-calendar-skeleton.test.mjs` (nuevo)
### D-022 — 2026-10-19 — Títulos Dinámicos de Pantalla en el Navbar Superior (HeaderNav)
- Decisión: A petición explícita del usuario ("todos los titulos delas pantallas en la interfaz del padre deben ir en el navbar superior, ya no debe decir placeres culinarios sino el titulo de la pantalla debe subir para ahi."):
  1. Top App Bar Dinámico:
     - En `src/components/HeaderNav.tsx`, se retiró el texto fijo de marca "Placeres Culinarios" en el título de la cabecera.
     - Se creó el módulo `src/lib/navUtils.ts` con la función pura `obtenerInfoPantalla(pathname, estaAutenticado)`.
     - Según la pantalla actual y estado de sesión, la cabecera superior despliega reactivamente el título, subtítulo e icono correspondiente:
       - `/` (autenticado como padre): "Pedir Menú" (`UtensilsCrossed`)
       - `/` (visitante): "Carta Semanal" (`UtensilsCrossed`)
       - `/pedidos`: "Mis Pedidos" (`ShoppingBag`)
       - `/hijos`: "Mis Hijos" (`GraduationCap`)
       - `/perfil`: "Mi Perfil" (`User`)
       - `/login`: "Iniciar Sesión" (`LogIn`)
       - Rutas operativas: `/admin` ("Panel Admin"), `/cocina` ("Cocina"), `/fiado` ("Control de Fiados"), `/despacho` ("Despacho"), `/superadmin` ("Super Admin").
  2. Suite automatizada en `tests/header-titulos-dinamicos.test.mjs` con 159 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/lib/navUtils.ts` (nuevo)
  2. `src/components/HeaderNav.tsx`
### D-023 — 2026-10-19 — Remoción de WhatsApp en Tarjetas de Pedidos y Fiado, y Envío a WhatsApp desde Reporte
- Decisión: A petición explícita del usuario ("en la tarjeta de pedidos aparece un boton de whatsapp. elimina ese boton, y en fiado desparece el boton de whatsapp y de colegio claretiano porque ya se sabe de que colegio es cuando haga clic en reporte y ahi me aparezca el boton de enviar a whatsapp debe poder enviar al whatsapp registrado"):
  1. Tarjetas de Pedidos ([`src/app/pedidos/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/pedidos/page.tsx)):
     - Se eliminó el botón de WhatsApp y la función `abrirConsultaWhatsApp`. La tarjeta ahora mantiene únicamente el botón para visualizar el comprobante adjunto si existe.
  2. Vista Principal de Fiado ([`src/app/fiado/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/fiado/page.tsx)):
     - Se eliminó el botón directo de WhatsApp de la tarjeta familiar para evitar saturación visual y envíos accidentales.
     - Se removió la insignia de colegio (ej: "Colegio Claretiano") en la cabecera de la tarjeta familiar dado que el administrador ya opera dentro del ámbito de su sede o colegio seleccionado en los filtros superiores.
  3. Modal de Reporte Detallado en Fiado:
     - El botón "Enviar a WhatsApp" se muestra de forma permanente y clara al abrir el modal de reporte.
     - La función `enviarCobroWhatsApp` valida el número de teléfono celular registrado del apoderado, antepone el prefijo oficial de Perú (`51`) y abre WhatsApp con el desglose de almuerzos escolares (si hay deuda pendiente o indicando cuenta al día si no la hay).
  4. Suite automatizada en `tests/fiado-pedidos-limpieza-whatsapp.test.mjs` con 163 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
### D-024 — 2026-10-19 — Edición de Datos de Perfil y Supresión de Títulos Duplicados en Pantallas de Padres
- Decisión: A petición explícita del usuario ("se debe poder editar los datos en el perfil, y como en cada pantalla de la interfaz delpadre ya aparece en el navbar el titulo que ya no aparezca el titulo en la pantalla porque ya aparece en el navbar."):
  1. Edición de Datos de Apoderado ([`src/app/perfil/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/perfil/page.tsx) y [`src/lib/authContext.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/lib/authContext.tsx)):
     - Se integró la función `actualizarPerfil(datos)` en `AuthContext` con persistencia en `perfiles_padres` de Supabase y `localStorage`.
     - Se agregó un botón de edición (`Pencil`) en la tarjeta principal del apoderado en `/perfil`.
     - Se diseñó un modal interactivo con validación de Nombres y Apellidos, Teléfono WhatsApp y DNI, con feedback visual de guardado y banner de confirmación exitosa.
  2. Supresión de Títulos Duplicados en Pantallas de Padres:
     - Dado que la barra de navegación superior (`HeaderNav.tsx`) ya muestra dinámicamente el título e icono de la pantalla ("Pedir Menú", "Carta Semanal", "Mis Pedidos", "Mis Hijos", "Mi Perfil"), se retiraron los encabezados visibles duplicados (`<h1>` convertidos a accesibles `sr-only`) en:
       - Inicio Visitante ([`src/app/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/page.tsx)): `Carta Semanal` -> `sr-only`.
       - Inicio Padres ([`src/app/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/page.tsx)): `Menú Escolar` -> `sr-only`.
       - Historial ([`src/app/pedidos/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/pedidos/page.tsx)): `Historial de Pedidos` -> `sr-only`.
       - Gestión de Estudiantes ([`src/app/hijos/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/hijos/page.tsx)): `Mis Hijos` -> `sr-only`.
       - Cuenta ([`src/app/perfil/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/perfil/page.tsx)): `Mi Perfil` -> `sr-only`.
  3. Suite automatizada en `tests/perfil-edicion-titulos-limpios.test.mjs` con 166 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/lib/authContext.tsx`
  2. `src/app/perfil/page.tsx`
  3. `src/app/page.tsx`
  4. `src/app/pedidos/page.tsx`
  5. `src/app/hijos/page.tsx`
  6. `tests/perfil-edicion-titulos-limpios.test.mjs` (nuevo)

### D-025 — 2026-10-19 — Pedidos Filtrados por Defecto en HOY y Cobranza WhatsApp en Fiado con Medios de Pago de Superadmin y Comprobante Digital
- Decisión: A petición explícita del usuario ("cuando le de adl botonde enviar a whatsapp cuando se abra el chat del padre ya debe cargarse el pdf con un mensaje ya hecho como la deuda que tiene es de ... adjunto el comprobante ... y los medios de pago ya establecidos segun lo que hayamos puesto en el superadmin. y una observacion mas cuando entre a la pantalla de pedidos de los padres debe aparecer por defecto el de hoy."):
  1. Pantalla de Mis Pedidos de los Padres ([`src/app/pedidos/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/pedidos/page.tsx)):
     - Se inicializó `fechaFiltro` por defecto con `fechaHoy` (`obtenerFechaHoyPeru()`). Al ingresar a la pantalla, se despliegan de inmediato los pedidos de la fecha actual de Perú.
     - Se preserva el chip "Todos" para restablecer a `'TODAS'` y consultar el historial completo en cualquier momento.
  2. Cobranza WhatsApp en Fiados con Medios de Pago de Superadmin ([`src/app/fiado/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/fiado/page.tsx)):
     - Se integró la carga dinámica de `dataService.obtenerConfiguracionPagos()` tanto en el montaje inicial como en `enviarCobroWhatsApp`.
     - El mensaje predefinido en el chat de WhatsApp incorpora la redacción solicitada:
       `"Le informamos que la deuda que tiene es de S/ {padre.totalDeuda.toFixed(2)} por concepto de almuerzos escolares bajo la modalidad 'Pagar luego / Fiado'."`
       `"📄 Adjunto el comprobante y detalle de consumos: ..."`
       y los medios de pago reales configurados en el Superadmin:
       `• Yape: {config.numeroYape} ({config.titularYape})`
       `• Plin: {config.numeroPlin} ({config.titularPlin})`
       eliminando números fijos o quemados.
  3. Generación y Descarga de Comprobante Digital:
     - Se implementó `descargarComprobantePadre(padre, config)` para generar y descargar al vuelo un archivo de comprobante oficial formateado con membrete, institución, apoderado, desglose cronológico de estudiantes, total adeudado y medios de pago.
     - En el modal de reporte se actualizó el botón a "Imprimir / Guardar PDF".
  4. Suite automatizada en `tests/pedidos-hoy-fiado-whatsapp-superadmin.test.mjs` con 171 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/app/pedidos/page.tsx`
  2. `src/app/fiado/page.tsx`
  3. `tests/pedidos-hoy-fiado-whatsapp-superadmin.test.mjs` (nuevo)

### D-026 — 2026-10-19 — Registro de Pedidos Manuales en Navbar Superior para Superadmin y Admins de Sede
- Decisión: A petición explícita del usuario ("AGREGARÁS UNA OPCIÓN EN EL NAVABR SUPERIOR DEL SUPERADMIN Y DE LOS ADMIN PARA QUE? PARA PEDIR PEDIDOS MANUEALMENTE YA QUE HAY PERSONAS MAYORES QUE TIENE NIETOS OHIJOS Y NO SABEN USAR EL SISTEMA. OBVIAMENTE EN EL SUPERADMIN COMO ES EL SUPERADMIN PODRÁ ELEGIR EL COLEGIO Y AHI ESCRIBIRA A LA ALUMNA Y SEGUN EL COLEGIO LE LISTARA EL GRADO Y EL ALMUERZO Y SI LO AHCE UN ADMIN DE UN COLEGIO OBVIAMENTE SOLO LE MOSTRARA DE ESE COLEGIO SU ALMUERZO Y SU GRADO."):
  1. Botón en Navbar Superior (`HeaderNav.tsx`):
     - Para usuarios con rol administrativo (`esAdmin`), se agregó el botón destacado `+ Pedido Manual` (`bg-emerald-600 hover:bg-emerald-700 text-white font-black`) accesible desde cualquier pantalla del sistema sin perder la vista de trabajo actual.
  2. Modal de Registro de Pedido Manual (`src/components/ModalPedidoManual.tsx`):
     - **Super Administrador:** Puede seleccionar libremente cualquier colegio activo. Al cambiar de colegio, se actualizan de forma reactiva los grados y los platos escolares de ese colegio.
     - **Administrador de Colegio:** Su colegio queda fijo a su sede asignada (`usuario.colegioNombre`) y solo se listan los grados y platos pertenecientes a su institución, garantizando el aislamiento multitenant.
     - **Campos del Formulario:** Nombre de la alumna/o (con mayúsculas automáticas), selector de grado/sección oficial, plato principal (segundo) del día escolar con opción manual, entrada/sopa/postre opcional, observaciones de alergias, datos del solicitante (tutor/abuelito) y métodos de pago (`Efectivo`, `Yape`, `Plin`, `Pagar luego`).
     - **Persistencia e Impacto Transversal:** Guarda mediante `dataService.crearPedido` asignando correlativo por colegio (`CLA-xxx`), impactando en tiempo real en Cocina, Despacho, Admin y Fiado (si es pagar luego) mediante `notifyListeners()`.
  3. Soporte de Fecha en `dataService.crearPedido`:
     - Se añadió soporte para `fecha?: string` en `crearPedido` manteniendo por defecto la fecha actual de Perú.
  4. Suite automatizada en `tests/pedido-manual-navbar-admin-superadmin.test.mjs` con 177 tests totales del sistema aprobados en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/components/ModalPedidoManual.tsx` (nuevo)
  2. `src/components/HeaderNav.tsx`
  3. `src/lib/dataService.ts`
  4. `tests/pedido-manual-navbar-admin-superadmin.test.mjs` (nuevo)

### D-027 — 2026-10-19 — Filtros Personalizados de Grados para Despacho en Configuración de Grados y Secciones
- Decisión: A petición explícita del usuario ("AHORA, YO QUIERO EDITAR MIS FILTROS, ES DECIR QUE ACA Dashboard & KPIs Menú Semanal Grados y Secciones (13) Observaciones (5) Nuevo Grado / Sección ... ME APAREZCA DEBAJO DE GRADO Y SECCION FILTROS ENTONCES, YO CREO MI FILTRO Y SELECCIONO LOS GRADOS QUE QUIERO QUE APAREZCAN. Y ESE FILTRO SE MOSTRARÁ EN DESPACHO. LO MISMO PARA TODOS LOS ADMINS."):
  1. Interfaz y Modelo de Datos (`src/types/index.ts`):
     - Creación de la interfaz `FiltroGrados` (`id`, `colegioNombre`, `nombre`, `grados: string[]`, `createdAt?`).
  2. Servicio de Datos con Aislamiento Multitenant (`src/lib/dataService.ts`):
     - Implementación de `obtenerFiltrosGrados(colegioNombreOId)`, `guardarFiltroGrados(filtroData)` y `eliminarFiltroGrados(id, colegioNombreOId)`.
     - Persistencia redundante en memoria, en `localStorage` (`config_filtros_grados_${colegio}`) y en Supabase (`menus_dia.mensaje_aviso.filtrosGradosPorColegio`) con sincronización reactiva en tiempo real mediante `notifyListeners()`.
  3. Panel de Administración de Filtros (`src/app/admin/page.tsx`):
     - Ubicado en la pestaña "Grados y Secciones" (`/admin`), debajo de "Grados y Secciones Activas".
     - Formulario interactivo para crear y editar filtros con nombre (ej. "Primaria", "Secundaria", "1° a 3° Primaria"), checkboxes para seleccionar/deseleccionar individualmente o masivamente los grados oficiales del colegio activo.
     - Listado de tarjetas de filtros con detalle de grados incluidos y acciones para editar y eliminar de manera segura.
     - Aislamiento estricto por colegio: el Superadmin puede gestionar y seleccionar cualquier colegio; los administradores de sede únicamente los filtros de su colegio institucional.
  4. Integración Operativa en Despacho (`src/app/despacho/page.tsx`):
     - Carga reactiva de los filtros de grados del colegio activo.
     - Barra de chips interactiva con `GraduationCap`: botón "Todos los Grados" más los chips de cada filtro personalizado con su conteo en vivo de pedidos de la fecha.
     - Filtrado dimensional en `pedidosBase` que actualiza dinámicamente los KPIs operativos (Total, Entregados, Falta Entregar, Pagados, Por Cobrar).
     - Inclusión del grupo de grados en el nombre del archivo exportado a Excel (`Reporte_Despacho_{Colegio}_{Grupo}_{Estado}_{Fecha}.xls`) y en la cabecera de la orden para impresión física.
  5. Suite de Pruebas Automatizadas:
     - `tests/filtros-grados-despacho-admin.test.mjs` aprobada al 100% con 182 tests totales del sistema en verde (`0` fallos).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/types/index.ts`
  2. `src/lib/dataService.ts`
  3. `src/app/admin/page.tsx`
  4. `src/app/despacho/page.tsx`
  5. `tests/filtros-grados-despacho-admin.test.mjs` (nuevo)

### D-028 — 2026-10-19 — Pantalla Dedicada de Pedido Manual, Estructura de Módulos (Admin, Superadmin, Padres) y Supresión de Título en Navbar de Gestión
- Decisión: A petición explícita del usuario ("el pedido manual que sea otra pantalla como admin, fiado etc. y tenemos que trabajr ordenadamente en las carpeta por ejemplo superadmin/page.tsx pero dentro tiene sus propias carpetas fiado desapcho, admin/page.tsx y aca tmb estan las demas fiado etc, padres/tsx pedidos etc, y en el navbar de la interfaz de admin y superadmin por eso te digo que hagas la estructura de esa manera ya no irá el titulo"):
  1. Pantalla Completa Dedicada de Pedido Manual ([`src/app/admin/pedido-manual/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/admin/pedido-manual/page.tsx)):
     - Pantalla autónoma para ventanilla y toma de pedidos manuales, con formulario espacioso y responsive, selector de colegio dinámico para Superadmin, sede institucional fija para Admin, carga reactiva de grados y platos del día escolar, selección de entrada/sopa/postre, observaciones médicas de alergias, datos del tutor/solicitante, medios de pago (`Efectivo`, `Yape`, `Plin`, `Pagar luego`), confeti y tarjeta de éxito con código generado (`#CLA-xxx`) y enlaces de navegación a Despacho y Cocina.
     - Enlace integrado en la barra de pestañas del menú administrativo (`adminNavItems`) con pestaña activa resaltada.
     - Ruta de compatibilidad directa en [`src/app/pedido-manual/page.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/app/pedido-manual/page.tsx).
  2. Estructura Organizada de Carpetas por Módulo:
     - **Admin (`src/app/admin/`):** Contiene `despacho/page.tsx`, `fiado/page.tsx`, `cocina/page.tsx` y `pedido-manual/page.tsx`.
     - **Superadmin (`src/app/superadmin/`):** Contiene `despacho/page.tsx`, `fiado/page.tsx`, `cocina/page.tsx` y `pedido-manual/page.tsx`.
     - **Padres (`src/app/padres/`):** Contiene `page.tsx` (Home de menú), `pedidos/page.tsx`, `hijos/page.tsx` y `perfil/page.tsx`.
     - **Rutas Canónicas Raíz:** Se mantienen `src/app/despacho/`, `src/app/fiado/`, `src/app/cocina/`, `src/app/pedidos/`, `src/app/hijos/` y `src/app/perfil/` intactas para garantizar cero roturas de URLs públicas o marcadores.
  3. Supresión de Título en Navbar de Gestión ([`src/components/HeaderNav.tsx`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/components/HeaderNav.tsx)):
     - Se implementó [`esRutaAdministrativa`](file:///Users/reyesrios/Dev/gestion-almuerzos/src/lib/navUtils.ts).
     - **En interfaz de Admin y Superadmin:** El navbar superior YA NO muestra el título de la pantalla (evitando duplicar el título que ya está en la barra de pestañas y en la página). Muestra el logo corporativo con la marca **"Placeres Culinarios"** y el subtítulo del portal.
     - **En interfaz de Padres (`/`, `/pedidos`, `/hijos`, `/perfil`):** Se preserva el título dinámico de la pantalla en el navbar superior ("Pedir Menú", "Mis Pedidos", "Mis Hijos", "Mi Perfil") tal como se definió para la vista móvil de apoderados.
  4. Suite de Pruebas Automatizadas:
     - Nueva suite en [`tests/pedido-manual-pantalla-rutas-anidadas.test.mjs`](file:///Users/reyesrios/Dev/gestion-almuerzos/tests/pedido-manual-pantalla-rutas-anidadas.test.mjs) aprobada al 100%.
     - Suite completa del sistema con 188 pruebas ejecutadas (182 aprobadas, 0 fallos, 0 regresiones).
- Fuente: instrucción explícita del usuario en esta conversación.
- Impacto:
  1. `src/lib/navUtils.ts`
  2. `src/components/HeaderNav.tsx`
  3. `src/app/admin/pedido-manual/page.tsx` (nuevo)
  4. `src/app/pedido-manual/page.tsx` (nuevo)
  5. `src/app/admin/despacho/page.tsx` (nuevo)
  6. `src/app/admin/fiado/page.tsx` (nuevo)
  7. `src/app/admin/cocina/page.tsx` (nuevo)
  8. `src/app/superadmin/despacho/page.tsx` (nuevo)
  9. `src/app/superadmin/fiado/page.tsx` (nuevo)
  10. `src/app/superadmin/cocina/page.tsx` (nuevo)
  11. `src/app/superadmin/pedido-manual/page.tsx` (nuevo)
  12. `src/app/padres/page.tsx` (nuevo)
  13. `src/app/padres/pedidos/page.tsx` (nuevo)
  14. `src/app/padres/hijos/page.tsx` (nuevo)
  15. `src/app/padres/perfil/page.tsx` (nuevo)
  16. `tests/header-titulos-dinamicos.test.mjs`
  17. `tests/pedido-manual-pantalla-rutas-anidadas.test.mjs` (nuevo)

## Contexto observado el 2026-10-14 (no decisiones del usuario)

- Aplicación de almuerzos escolares con Next.js 16 (App Router), React 19, TypeScript estricto, Tailwind CSS y Supabase PostgreSQL.
- Reglas de negocio confirmadas: zona horaria oficial `America/Lima`, hora de corte 09:30 AM, menús independientes por colegio, administradores de colegio con acceso restringido a su sede, superadmin global.
- Flujo de estados: Registro -> Validación/Pago -> Cocina (prepara todos los pedidos registrados pagados o no) -> Despacho/Entrega -> Fiado (deuda y liquidación de saldos).
- Las políticas RLS de Supabase deben verificarse y reforzarse para evitar accesos cruzados entre colegios o padres.
- Los catálogos iniciales de colegios y platos son vacíos; no sembrar datos ficticios.

## Pendientes de definición

- Validar con el cliente si el precio de S/ 12 es universal o si se habilitarán formalmente platos con precios variables en la interfaz de compra pública.
- Establecer si el cierre a las 09:30 AM debe rechazar pedidos automáticamente en el backend vía trigger/función SQL o mantenerse como aviso visual en frontend.


