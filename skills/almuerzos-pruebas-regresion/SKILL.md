---
name: almuerzos-pruebas-regresion
description: Crear pruebas por funcionalidad, completar cobertura faltante y ejecutar la suite de regresión después de cada cambio en gestion-almuerzos. Aplicar en toda tarea que modifique el repositorio, incluidas funcionalidades nuevas, correcciones, refactorizaciones y documentación.
---

# Pruebas por funcionalidad y regresión obligatoria

Leer `AGENTS.md` y `MEMORY.md` desde la raíz. Esta política fue solicitada por el usuario: cada funcionalidad debe tener pruebas y después de cada cambio se debe ejecutar la suite de regresión para detectar roturas.

## Antes de modificar

1. Identificar las funcionalidades afectadas y sus pruebas actuales en `tests/`. Leer el código real y los casos existentes; el nombre de un archivo de pruebas no demuestra que cubra toda una funcionalidad.
2. Al evaluar cobertura del sistema, inventariar las funcionalidades existentes por módulo y relacionar cada una con pruebas que ejecuten su comportamiento. Incluir acceso/sesión/roles, estudiantes, colegios/administradores, menús, creación e historial de pedidos, comprobantes, pagos, cocina, despacho, fiados, reportes/exportaciones, fechas y sincronización.
3. Identificar funcionalidades sin pruebas y crearles casos, aunque sean anteriores a esta política. En cambios focalizados, cubrir primero las funcionalidades tocadas y sus dependencias. En una tarea de cobertura completa, recorrer todo el inventario; no darla por terminada mientras existan huecos sin resolver. Registrar explícitamente los pendientes y no afirmar cobertura total sin evidencia.
4. Cuando se vaya a cambiar comportamiento, ejecutar las pruebas existentes pertinentes antes de editar para distinguir fallos previos de regresiones.

## Crear pruebas que detecten errores reales

- Cada funcionalidad nueva debe incluir sus pruebas en la misma entrega. Una corrección debe incluir un caso que reproduzca el fallo y compruebe su solución.
- Probar resultados observables: datos devueltos o persistidos, rechazo de entradas inválidas, permisos, interacción de usuario o efectos esperados. Cubrir éxito, errores y límites relevantes para esa funcionalidad.
- Ejecutar el código de producción. No copiar el algoritmo dentro del test ni considerar suficiente comprobar que un archivo contiene una cadena. Las pruebas heredadas de texto o lógica reproducida son parciales y deben complementarse cuando se trabaje en esos comportamientos.
- Usar `node:test` para lógica y servicios; aislar dependencias externas con dobles controlados y datos de prueba. Si el comportamiento depende del navegador, añadir una prueba de interacción con herramientas apropiadas, sin presentarla como cubierta por una búsqueda de texto.
- Cubrir los invariantes aplicables: aislamiento por colegio y padre, permisos por rol, pago/entrega/fiado, fechas de Perú, observaciones/alergias y reportes completos pese a paginación.
- Mantener los tests deterministas: controlar reloj, identificadores y red cuando afecten las expectativas; limpiar los datos y dobles de cada caso. No depender de nombres de colegios reales, credenciales reales ni del orden de ejecución.
- No eliminar, omitir o debilitar una aserción para poner la suite en verde. Si cambió un requisito por decisión del usuario, actualizar la expectativa y registrar esa decisión en `MEMORY.md`.

## Después de cada cambio

1. Ejecutar los casos de la funcionalidad para corregir errores durante la implementación.
2. Después del último conjunto de ediciones, ejecutar **toda la suite local de regresión**, no solo los casos nuevos. Esto también aplica a cambios de documentación, configuración o refactorización. No es necesario lanzar la suite después de cada pulsación: sí después de cada cambio completo y antes de entregar.
3. Si después de esa ejecución se vuelve a editar cualquier archivo, repetir la suite al finalizar. Ejecutar lint, tipos y build según el alcance además de las pruebas, no como sustitutos.
4. Seguir [almuerzos-validar](../almuerzos-validar/SKILL.md) para el comando de regresión local y los límites de las pruebas remotas. La suite local excluye únicamente la integración identificada que escribe en Supabase; mantener esa exclusión visible en el informe.
5. No usar semillas ni datos de producción para cumplir esta obligación. Las integraciones deben usar un entorno de pruebas identificado y autorizado. Si falta ese entorno, comprobar con dobles lo que sea posible y declarar la integración pendiente; una prueba omitida no cuenta como aprobada.
6. Resolver las regresiones introducidas y volver a ejecutar. Si un fallo previo o un bloqueo impide validar, informar el caso, la causa conocida y el trabajo pendiente. No presentar la entrega como validada mientras haya fallos sin explicar.

## Criterio de entrega

Indicar funcionalidades cubiertas, archivos de pruebas añadidos/actualizados, comando ejecutado, resultados (aprobados, fallidos y omitidos) y huecos de cobertura conocidos. No confundir suite aprobada con garantía de ausencia de errores ni con cobertura completa del sistema.

Una entrega funcional requiere implementación, pruebas de su comportamiento y regresión ejecutada tras la última edición. La documentación de esta política no añade por sí misma cobertura a las funcionalidades existentes: esa cobertura se obtiene escribiendo y ejecutando los tests.
