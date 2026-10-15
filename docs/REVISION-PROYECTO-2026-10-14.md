# Revisión del proyecto — 2026-10-14

## Resultado y alcance

La aplicación compila y sus pruebas locales existentes pasan, pero presenta problemas de autenticación, integridad de datos y funcionamiento que impiden considerar el sistema validado para operación real.

Se revisaron las nueve rutas, los componentes compartidos, los cinco módulos de `src/lib`, los tipos, los archivos SQL, scripts, configuración y pruebas. La revisión combina lectura de código, lint, TypeScript, build y reproducciones aisladas del servicio real. No es una certificación de seguridad ni una prueba completa de todas las interacciones.

No se conectó a Supabase para leer datos reales ni modificar tablas. No se ejecutaron semillas. No hay Playwright, jsdom ni un navegador automatizado disponible en este entorno; quedan pendientes los recorridos visuales, de accesibilidad y de concurrencia real. El esquema desplegado, RLS efectivo, permisos, límites de API y publicación Realtime remotos no se verificaron. No se realizó una auditoría de vulnerabilidades de dependencias.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Suite local: nueve archivos, excluyendo `colegios-sync.test.mjs` | 68 tests aprobados, 0 fallidos, 0 omitidos dentro de esa selección |
| `npx tsc --noEmit --incremental false` | Aprobado |
| `npm run build` | Aprobado; genera las nueve rutas de aplicación |
| `npm run lint` | Falló: 57 errores y 72 advertencias |
| Reproducciones aisladas de `dataService.ts` | Ocho escenarios confirmados, descritos abajo |
| Integración `colegios-sync.test.mjs` | No ejecutada: lee `.env.local`, inserta y elimina colegios |

Las reproducciones transpilaron el archivo real con el TypeScript instalado y lo ejecutaron en un contexto aislado con un doble de Supabase; también se ejecutó el modo local real. No se copiaron los algoritmos de negocio. Son evidencia de esta revisión, no nuevos tests permanentes ni validación de la base de datos remota.

## Hallazgos prioritarios

### R01 — Crítico — La sesión y los privilegios no se autentican de forma confiable

**Evidencia:** `src/lib/authContext.tsx:38`, `:160`, `:221`; `src/lib/supabase.ts:14`.

Al iniciar se acepta directamente el usuario y su rol guardados en `localStorage`. Existen accesos administrativos con credenciales fijas comprobadas antes de consultar Supabase. El registro guarda la contraseña recibida directamente en `password_hash`, y el login descarga el perfil y la compara en el cliente. No hay autenticación de servidor/Supabase Auth que respalde esa sesión. La comparación además se omite si falta la contraseña recibida o la del perfil, aunque el formulario habitual exige contraseña.

**Impacto:** cambiar el estado del navegador puede habilitar la UI privilegiada; cambiar una contraseña en BD no revoca los accesos fijos. La protección efectiva de datos depende del servidor y actualmente no está implementada por esta sesión.

**Corrección:** autenticación verificable, contraseñas gestionadas de forma segura, autorización de operaciones en servidor/BD y revocación efectiva de sesiones. Eliminar accesos fijos del flujo de producción.

### R02 — Crítico — El esquema versionado permite acceso general a datos sensibles

**Evidencia:** `supabase/schema.sql:164`, `:178`, `:182`, `:186`.

Las seis tablas tienen políticas `FOR ALL USING (true) WITH CHECK (true)` sin restricciones por padre, colegio o rol. Los perfiles incluyen contraseñas y los hijos incluyen datos personales. El cliente usa la clave pública y consulta directamente las tablas.

**Impacto:** si esas políticas y los permisos de tabla están aplicados en el entorno remoto, los filtros visuales no impiden consultas y escrituras ajenas. No se ha comprobado la configuración desplegada.

**Corrección:** diseñar y probar RLS sobre identidades autenticadas, relaciones estables y permisos mínimos. Probar accesos cruzados directamente contra un entorno aislado, no solo ocultación de botones.

### R03 — Alto — “Mis pedidos” cambia el orden de hooks al cargar la sesión

**Evidencia:** `src/app/pedidos/page.tsx:70`, `:82`, `:297`.

Hay retornos por carga, ausencia de usuario y rol antes de un `useEffect` de paginación. Al pasar de carga a padre autenticado se ejecuta un hook adicional. ESLint lo confirma con `react-hooks/rules-of-hooks`.

**Impacto:** abrir o recargar el historial con sesión puede provocar un error de hooks de React. El build no detecta esta transición del cliente.

**Corrección y test:** mantener todos los hooks antes de los retornos y probar carga → padre, cierre de sesión y cambio de rol mediante renderizado real.

### R04 — Alto — Se confirma un pedido aunque falle su escritura

**Evidencia:** `src/lib/dataService.ts:446`, `:497`, `:508`; `src/app/page.tsx:252`.

`crearPedido` registra el error de Supabase pero añade el pedido a memoria y lo devuelve normalmente. El formulario muestra éxito. Se reprodujo con un error remoto simulado y el método devolvió `REGISTRADO`.

**Impacto:** el padre cree que pidió y cocina/despacho no reciben la orden; al recargar puede desaparecer. No hay cola persistente de reintentos ni aviso de operación sin sincronizar.

**Corrección y test:** propagar el error o implementar explícitamente un estado pendiente de sincronización durable. Probar error de red, restricción de BD y respuesta exitosa, incluida la UI.

### R05 — Alto — Marcar entrega puede borrar observaciones y alergias

**Evidencia:** `src/lib/dataService.ts:383`, `:513`, `:519`, `:537`.

La lectura remota devuelve pedidos sin poblar `pedidosMemoria`. Al entregar un pedido leído desde BD, se busca su observación exclusivamente en esa memoria y, si no está, se escribe únicamente `[Entregado: ...]`. Al revertir puede escribirse `null`.

**Reproducción:** leer un pedido remoto con `ALERGIA PRUEBA`, entregarlo y capturar el UPDATE: su observación es solo la etiqueta de entrega.

**Impacto:** pérdida de notas, alergias y metadatos de padre/colegio codificados en ese campo.

**Corrección y test:** guardar la entrega en un campo propio y preservar observaciones desde la fuente persistente. Probar entrega desde otra sesión y reversión sin pérdida de datos.

### R06 — Alto — Solo existen 900 códigos de pedido posibles

**Evidencia:** `src/lib/dataService.ts:451`; `supabase/schema.sql:71`.

El código usa un entero aleatorio de 100 a 999 y la columna es única globalmente. Puede colisionar desde los primeros pedidos y necesariamente no admite más de 900 códigos distintos. No hay reintento de colisión. R04 oculta el error de inserción.

**Corrección y test:** identificador generado de forma confiable en la persistencia, con capacidad adecuada y manejo de concurrencia. Forzar colisiones en pruebas y verificar que no se confirma una orden inexistente.

### R07 — Alto — Eliminar o reasignar colegio no revoca al administrador anterior

**Evidencia:** `src/lib/dataService.ts:1216`, `:1252`, `:1318`; `src/lib/authContext.tsx:230`, `:300`; `src/app/despacho/page.tsx:40`.

Eliminar un colegio borra el colegio y su mapa, pero conserva el perfil con rol ADMIN. Editar el DNI del administrador hace un upsert por el nuevo DNI y deja el anterior. El login admite un ADMIN sin colegio y las pantallas lo tratan como acceso a TODOS. Una sesión previa tampoco se revalida. El modal promete que el administrador perderá acceso a la sede.

**Impacto:** con el mapa anterior eliminado y sin asignación en caché, un antiguo administrador puede terminar sin restricción de colegio. Si existe caché, conserva acceso obsoleto. Pausar un colegio tampoco se comprueba en el login.

**Corrección y test:** distinguir explícitamente administrador global y de sede, denegar acceso ante asignación ausente/inactiva y revocar el vínculo y las sesiones afectados. Probar eliminación, pausa y cambio de DNI.

### R08 — Alto — Renombrar un colegio rompe vínculos basados en nombre

**Evidencia:** `src/lib/dataService.ts:1232`, `:1277`; `src/lib/authContext.tsx:363`; `src/app/superadmin/page.tsx:127`.

El cambio de nombre actualiza `colegios`, pero no los nombres almacenados en hijos, pedidos ni etiquetas de platos. Los hijos nuevos no guardan `colegio_id` en la inserción actual. La inspección de estudiantes y numerosos filtros usan el nombre. La nueva clave de `adminsColegio` tampoco elimina necesariamente la antigua.

**Reproducción:** renombrar sin datos de admin genera únicamente una operación sobre `colegios`.

**Impacto:** estudiantes, menús e históricos pueden desaparecer de la vista de la sede renombrada o continuar vinculados al nombre antiguo.

**Corrección y test:** identidad por ID para relaciones y filtros; mantener nombres históricos con intención explícita. Probar renombrado con estudiantes, menú, deuda e históricos existentes.

### R09 — Alto — Una selección de platos anterior sobrevive al cambio de día/colegio

**Evidencia:** `src/app/page.tsx:157`, `:178`, `:231`, `:292`.

Al cargar el catálogo solo se reemplazan las selecciones si se encuentra un plato del tipo esperado. Si el nuevo colegio/día no tiene platos, quedan los nombres anteriores. La validación exige cadenas no vacías, pero no pertenencia al catálogo actual. El botón solo se deshabilita por envío, no por carga del menú.

**Impacto:** se pueden enviar platos de otro día/colegio, o enviar durante la recarga. El servicio tampoco valida esa pertenencia.

**Corrección y test:** resetear selección al cambiar contexto, bloquear mientras carga y validar por ID, colegio, día y disponibilidad en persistencia. Probar colegio A con menú → B sin menú y respuestas de carga fuera de orden.

### R10 — Alto — La fecha operativa no corresponde al día elegido

**Evidencia:** `src/app/page.tsx:253`, `:885`; `src/lib/dataService.ts:167`, `:455`.

La UI permite seleccionar lunes a viernes, pero `crearPedido` fija `fecha` a hoy. El mapeo remoto además ignora una fecha explícita cuando existe `created_at` y la sustituye por la fecha de creación en Perú.

**Reproducción:** un pedido con `fecha=2026-10-16` y creación el 14 se devuelve con fecha 14.

**Impacto:** cocina y despacho filtran por creación, aunque el pedido diga otro día de menú. No existe una fecha de servicio independiente.

**Corrección y test:** definir la semántica del selector (solo consulta o programación), separar creación y servicio, y probar pedidos anticipados y cruces de medianoche. No modificar la regla histórica sin concretar ese significado con el usuario.

### R11 — Alto — La liquidación global puede cobrar solo parte de lo confirmado

**Evidencia:** `src/lib/dataService.ts:633`, `:694`; `src/app/fiado/page.tsx:314`, `:336`.

Con filtro TODOS se agrupa por padre, mezclando colegios y conservando un solo `colegioNombre` en el grupo. El modal anuncia toda la deuda y llama a liquidar restringiendo a ese único colegio.

**Reproducción en modo local real:** dos pedidos de S/ 12, mismo padre y colegios A/B: el modal recibiría deuda 24, pero liquidar con el colegio del grupo deja deuda 12.

**Corrección y test:** agrupar por padre/colegio o liquidar exactamente los IDs mostrados en la confirmación, respetando permisos. Probar familias con hijos en distintas sedes.

### R12 — Alto — Errores de actualización y eliminación se presentan como éxito

**Evidencia:** `src/lib/dataService.ts:555`, `:694`, `:1232`, `:1318`, `:1362`; `src/lib/authContext.tsx:393`; `src/app/superadmin/page.tsx:304`.

Numerosas operaciones solo usan try/catch y no inspeccionan el `error` devuelto. Liquidación y actualización de colegio retornan `ok:true` incluso ante error remoto; ambos casos fueron reproducidos. La eliminación de hijos actualiza la sesión local aunque falle BD. Algunas pantallas además ignoran el resultado `{ok:false}` de métodos que sí lo devuelven.

**Impacto:** cobros, borrados o cambios aparentemente completados que no persistieron; la vista y la base divergen.

**Corrección y test:** resultado explícito y consistente, cambios locales posteriores al éxito y mensajes visibles. Probar rechazo de cada escritura relevante y no solo excepciones lanzadas.

## Hallazgos adicionales

### R13 — Medio — El precio configurable no llega a la compra

`src/app/admin/page.tsx:251` permite un precio de plato, pero `src/app/page.tsx:266` registra siempre 12 y diversas etiquetas/reportes muestran S/ 12. `src/lib/dataService.ts:191` convierte un monto válido de cero en 12 mediante `||`; esto se reprodujo.

Definir si el menú tiene precio fijo o por selección y usar una única fuente persistente. Probar precio distinto de 12 y cero cuando sea admitido. La variable de ejemplo `NEXT_PUBLIC_PRECIO_MENU` no gobierna la compra actual.

### R14 — Medio — El esquema inicial no prepara la configuración que espera la aplicación

`supabase/schema.sql:130` crea menús de lunes a viernes, pero las operaciones de configuración (`src/lib/dataService.ts:1470`) solo hacen UPDATE de SABADO. No hay creación si falta esa fila ni unicidad por día para `maybeSingle()`. La semilla de superadmin sí la crea, pero vacía datos; no es una migración segura para subsanar la ausencia.

Se confirmó que guardar configuración con fila ausente no intenta INSERT/UPSERT. El esquema también introduce ejemplos de colegios/platos contrarios al catálogo vacío vigente. Separar esquema, migraciones seguras y datos de demostración; probar instalación limpia y reaplicación.

### R15 — Medio — Cocina y el historial confunden crédito con pago aceptado

`src/app/cocina/page.tsx:99` excluye órdenes REGISTRADO/PENDIENTE, incluidas «Pagar luego». Despacho ofrece marcar como ENTREGADO, pero no un paso operativo EN_COCINA/EMPACADO. Así, una orden a crédito no aparece en cocina hasta pagarla o avanzarla fuera del flujo normal; marcarla entregada la hace aparecer después de la entrega. `src/app/pedidos/page.tsx:176` interpreta cualquier estado avanzado como pago aceptado, incluso crédito aún adeudado.

Separar aceptación operativa de cobro y definir cómo entra a cocina un pedido a crédito. Probar el recorrido completo sin marcar pagado lo que continúa como deuda. El contador de pendientes de cocina además se calcula antes del filtro de colegio (`:104`).

### R16 — Medio — La sincronización deja huecos de visibilidad

`src/lib/dataService.ts:807` escucha cambios de colegios y configuración, pero el SQL solo añade pedidos/platos a la publicación (`supabase/schema.sql:100`). Su funcionamiento remoto requiere comprobar la publicación desplegada. La suscripción del inicio recarga configuración, pero no el catálogo de platos; el admin tampoco recarga platos en su callback. El inicio ignora listas vacías de configuración (`src/app/page.tsx:119`), manteniendo opciones retiradas.

Probar dos sesiones: alta/baja de platos, último colegio eliminado, configuración vacía y pausa de sede. Asegurar actualización por la entidad correcta y distinguir ausencia de datos de error de red.

### R17 — Medio — El historial se amplía por teléfono sin exigir propiedad del padre

`src/lib/dataService.ts:425` consulta padre_id OR teléfono. Dos perfiles con el mismo teléfono pueden recibir pedidos del otro. En el esquema el teléfono no es único. En liquidación, el camino de teléfono incluye una comparación contra `padre_id` UUID (`:717`), que puede ser inválida en PostgreSQL; esta última consecuencia requiere prueba de integración.

Revisar la recuperación de pedidos históricos sin dueño, separándola de pedidos pertenecientes a otro perfil. Probar teléfonos compartidos y liquidación de registros heredados.

### R18 — Medio — Exportaciones interpolan texto sin neutralizarlo

`src/app/despacho/page.tsx:192` y `src/app/fiado/page.tsx:210` interpolan nombres y notas en HTML de Excel sin escapar etiquetas. `src/app/superadmin/page.tsx:141` escapa comillas CSV, pero no trata celdas que empiezan como fórmulas.

Confirmado por inspección del generador; no se abrió el archivo en Excel. Puede alterarse la estructura del documento y hay riesgo de interpretación activa según el visor. Escapar HTML y neutralizar fórmulas según el formato; probar nombres con `<`, `&`, comillas, saltos de línea y prefijos de fórmula.

### R19 — Medio — El horario anunciado no se aplica

El inicio muestra “Pedidos hasta las 09:30 AM” (`src/app/page.tsx:827`), pero el envío y `crearPedido` no consultan ni aplican `menus_dia.hora_cierre` o `activo`. Definir si es una regla o solo un mensaje; si es regla, hacerla cumplir en el servidor con horario de Perú y probar el límite.

### R20 — Medio — Las pruebas verdes no cubren el funcionamiento real principal

Solo `tests/zona-horaria-peru.test.mjs` importa directamente un módulo de producción entre los tests locales existentes. Los demás usan búsquedas de cadenas y/o lógica reproducida. Por ejemplo, `timeline-flujo.test.mjs:4` declara que replica la función de la pantalla y `confirmacion-eliminacion.test.mjs:6` manipula arreglos propios.

No hay pruebas de renderizado que detecten R03 ni pruebas de escritura real del servicio que detecten R04/R05/R12. El proyecto no tiene configuración de CI versionada ni herramienta de navegador en sus dependencias declaradas. La política en AGENTS.md requiere ejecución por el agente; no representa un disparador automático ante cada edición.

## Matriz de cobertura revisada

“Parcial” significa presencia de comprobaciones textuales o simulaciones; no equivale a comportamiento real cubierto.

| Área | Evidencia actual | Pendiente principal |
| --- | --- | --- |
| Fechas Perú | Tests sobre `dateUtils.ts` real | Fecha de servicio y uso correcto en pantallas |
| Login/registro/sesión | Simulaciones de roles | Autenticación real, revocación, manipulación de sesión, errores |
| Hijos/alergias | Simulaciones de alta/confirmación | Propiedad, persistencia, rechazo de borrado, preservación de alergias |
| Colegios y administradores | Textos/simulaciones; integración remota no ejecutada | Renombrado, eliminación, pausa, reasignación, límites de autorización |
| Menús y categorías | Parcial por texto | CRUD real, aislamiento, errores, catálogos vacíos y selecciones obsoletas |
| Pedidos | Simulaciones | Inserción rechazada, colisiones, precios, día de servicio, doble envío |
| Historial | Simulaciones de paginación/timeline | Renderizado al restaurar sesión, acceso entre padres, estados de crédito |
| Compresión/comprobantes | Sin test ejecutable localizado | Lectura fallida, imagen inválida, canvas ausente, fallback JPEG, subida durante envío |
| Cocina | Filtros reproducidos | Crédito antes de entrega, aislamiento de métricas, actualización remota |
| Despacho | Textos y lógica reproducida | Escritura real, preservación de notas, errores y concurrencia |
| Fiados | Simulaciones y presencia de funciones | Liquidación multi-colegio, rechazo remoto, montos y teléfonos heredados |
| Exportación e impresión | Presencia de funciones/textos | Datos completos, caracteres especiales, fórmulas, impresión con paginación |
| Navegación/modales | Parcial por texto/simulaciones | Teclado, foco, retorno del foco, vista móvil y confirmaciones reales |
| Realtime y caché | Integración remota pendiente | Dos sesiones, reconexión, invalidación y listas vacías |
| Instalación/esquema | Lectura de SQL | Migración limpia y segura, políticas efectivas, unicidad y publicaciones |

## Otros puntos de mantenimiento

- ESLint: errores de hooks, uso de `any`, variables que deberían ser constantes y texto JSX sin escapar; advertencias de dependencias de efectos, imports no usados e imágenes. R03 tiene consecuencia de ejecución directa; no todos los 57 errores tienen la misma gravedad.
- Se descargan listas completas de pedidos, con comprobantes base64, para filtrar y paginar en el navegador. Despacho repite la lectura cada cuatro segundos. El límite remoto de resultados debe verificarse antes de asumir que los reportes contienen todos los datos.
- `imageCompression.ts` reduce dimensiones, pero no impone un límite final garantizado de bytes. Sus operaciones dependen del navegador; no se verificó memoria/tiempo con archivos grandes.
- `ModalConfirmacion` tiene rol de diálogo y Escape, pero no implementa contención ni restauración de foco. Falta comprobar teclado y lector de pantalla.
- El README sigue siendo una plantilla y no describe instalación segura, pruebas locales frente a remotas ni credenciales de prueba aisladas.
- Los seeds incluyen destinos/credenciales de respaldo y acciones destructivas. No se ejecutaron; no deben formar parte de una verificación habitual.

## Orden recomendado de corrección

1. Identidad, autorización y revocación (R01, R02, R07, R17), con entorno aislado para validar políticas.
2. Protección de pedidos, notas y cobros (R04, R05, R06, R11, R12).
3. Historial, selección de menú, fechas y relaciones por colegio (R03, R08, R09, R10).
4. Precio, crédito, configuración, sincronización, exportaciones y horario (R13–R19).
5. Reemplazar progresivamente simulaciones por tests sobre código real y añadir recorridos de navegador. Cada corrección debe incluir su regresión y ejecutar toda la suite local después de la última edición.

Esta entrega documenta la revisión; no corrige los hallazgos ni añade cobertura completa. No se han tomado decisiones nuevas de negocio en nombre del usuario.
