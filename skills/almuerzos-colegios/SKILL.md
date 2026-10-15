---
name: almuerzos-colegios
description: Modificar colegios, administradores asignados, menús por colegio y sincronización de configuración en gestion-almuerzos. Usar cuando el cambio afecte pertenencia, visibilidad o persistencia por colegio.
---

# Cambiar colegios y configuración

Leer `AGENTS.md` y `MEMORY.md` desde la raíz. Revisar `src/types/index.ts`, las operaciones pertinentes de `src/lib/dataService.ts` y `src/lib/authContext.tsx`.

## Puntos de compatibilidad

- `colegioId` y `colegioNombre` conviven; algunos registros antiguos solo tienen nombre. Revisar cómo cada consumidor resuelve ambos antes de alterar la identificación.
- La asignación de administradores se resuelve mediante información en `colegios.sede`, JSON `adminsColegio` de la fila `menus_dia/SABADO` y caché `config_admins_colegio`. No eliminar estas rutas incidentalmente.
- `menus_dia.mensaje_aviso` para `SABADO` también guarda grados y observaciones. Al cambiar una parte, preservar las demás claves; no reemplazarlo por un mensaje de menú.
- Platos y pedidos tienen mapeos de compatibilidad mediante etiquetas de texto. Revisar lectores y escritores, incluido `TipoOriginal`, antes de modificar tipos o columnas. El SQL versionado no garantiza que el despliegue tenga nuevas columnas.
- Los catálogos iniciales de colegios y platos son vacíos. No agregar datos ficticios como alternativa ante errores de conexión.

## Procedimiento

1. Localizar la UI afectada: `superadmin`, `admin`, `hijos`, inicio y/o pantallas operativas. Leer la documentación local de Next.js pertinente.
2. Seguir lectura, escritura, mapeo, memoria local, `localStorage` y suscripciones. Actualizar las partes necesarias para que los cambios se reflejen en los consumidores.
3. Distinguir colegio inactivo de colegio eliminado. Preservar confirmaciones de eliminación y registros históricos según el comportamiento solicitado; no ejecutar eliminaciones remotas para probar la UI.
4. Verificar el alcance de padre, admin asignado, admin general heredado y superadmin. No ampliar acceso por un nombre/ID ausente sin revisar el comportamiento previsto.
5. Si se requiere una migración, preparar el archivo y describir compatibilidad e impacto. Editar SQL local no autoriza aplicarlo a la base remota.

## Validación enfocada

Consultar `skills/almuerzos-validar/SKILL.md`. Revisar `superadmin-colegios`, `superadmin-estudiantes-menu-visibilidad`, `admin-scoping-fiado-reportes`, `home-padres-flujo` y `confirmacion-eliminacion` en `tests/` según la modificación.

`tests/colegios-sync.test.mjs` crea y elimina datos en el Supabase configurado: no ejecutarlo por rutina. Para el flujo afectado, verificar visibilidad tras crear/editar/pausar un colegio, selección del colegio del hijo y ausencia de mezcla entre sedes. No atribuir a las restricciones de UI garantías de autorización de la base de datos.

Registrar decisiones nuevas del usuario en `MEMORY.md`; describir por separado cualquier limitación observada del esquema o de autenticación.
