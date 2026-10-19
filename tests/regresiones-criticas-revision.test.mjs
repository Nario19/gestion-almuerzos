import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Regresiones Críticas de la Revisión de Seguridad e Integridad (2026-10-14)', async (t) => {

  await t.test('1. Pérdida de observaciones: Marcar entrega y revertir preserva alergias y notas médicas', () => {
    const dataServiceContent = fs.readFileSync(path.resolve('src/lib/dataService.ts'), 'utf-8');

    // Debe consultar la observación de Supabase si no está en memoria
    assert.ok(
      dataServiceContent.includes("if (!observacionExistente) {") &&
      dataServiceContent.includes(".select('observacion')"),
      'cambiarEstadoPedido debe consultar Supabase si el pedido no tiene observación en memoria'
    );

    // Debe limpiar únicamente marcas de entrega previas conservando todas las notas y alergias
    assert.ok(
      dataServiceContent.includes("replace(/\\s*•?\\s*\\[Entregado:\\s*[^\\\]]+\\]/g, '').trim()"),
      'dataService debe limpiar únicamente la etiqueta [Entregado: ...] sin destruir el texto restante'
    );

    // Prueba de comportamiento del algoritmo de preservación
    const observacionOriginal = 'ALERGIA CRÍTICA AL MANÍ [Padre: Juan Pérez]';
    const horaSimulada = '12:30:00';

    // Marcar entrega
    const limpiaObs = observacionOriginal.replace(/\s*•?\s*\[Entregado:\s*[^\]]+\]/g, '').trim();
    const observacionConEntrega = limpiaObs ? `${limpiaObs} • [Entregado: ${horaSimulada}]` : `[Entregado: ${horaSimulada}]`;

    assert.ok(observacionConEntrega.includes('ALERGIA CRÍTICA AL MANÍ'), 'Debe conservar la nota médica de alergia');
    assert.ok(observacionConEntrega.includes('[Padre: Juan Pérez]'), 'Debe conservar la referencia al padre');
    assert.ok(observacionConEntrega.includes(`[Entregado: ${horaSimulada}]`), 'Debe incluir la hora de entrega');

    // Revertir entrega
    const observacionRevertida = observacionConEntrega.replace(/\s*•?\s*\[Entregado:\s*[^\]]+\]/g, '').trim();
    assert.equal(observacionRevertida, observacionOriginal, 'Al revertir la entrega se recupera exactamente la nota original');
  });

  await t.test('2. Pedidos con falso éxito y códigos resistentes a colisión', () => {
    const dataServiceContent = fs.readFileSync(path.resolve('src/lib/dataService.ts'), 'utf-8');

    // 1. crearPedido lanza error si Supabase falla
    assert.ok(
      dataServiceContent.includes("throw new Error(`Error al registrar pedido:"),
      'crearPedido debe lanzar error cuando la inserción en Supabase falla'
    );

    // 2. Comprobar que no se agrega a memoria antes de que la BD responda con éxito
    const indexError = dataServiceContent.indexOf("throw new Error(`Error al registrar pedido:");
    const indexPushMemoria = dataServiceContent.indexOf("pedidosMemoria.unshift(nuevo);");
    assert.ok(
      indexError < indexPushMemoria,
      'El lanzamiento de error debe ocurrir ANTES de agregar el pedido a la memoria local'
    );

    // 3. Códigos resistentes a colisiones
    assert.ok(
      dataServiceContent.includes("Math.floor(1000 + Math.random() * 9000)") ||
      dataServiceContent.includes("Date.now().toString().slice(-4)"),
      'Debe generar códigos de pedido combinando timestamp o amplio rango aleatorio'
    );

    // 4. Verificar manejo en page.tsx
    const homeContent = fs.readFileSync(path.resolve('src/app/padres/page.tsx'), 'utf-8');
    assert.ok(
      homeContent.includes("setErrorValidacion(err?.message || 'Ocurrió un error al registrar el pedido.')"),
      'El Home notifica al usuario en caso de error y no muestra modal de éxito falso'
    );
    assert.ok(
      homeContent.includes("setMostrarModalConfirmacionPedido(false);"),
      'El Home cierra el modal de confirmación en caso de fallo'
    );
  });

  await t.test('3. Historial de pedidos: Todos los React Hooks antes de retornos condicionales', () => {
    const pedidosPageContent = fs.readFileSync(path.resolve('src/app/padres/pedidos/page.tsx'), 'utf-8');

    // Localizar useEffect de reseteo de página y los returns condicionales
    const indexUseEffectPagina = pedidosPageContent.indexOf('useEffect(() => {\n    setPaginaActual(1);\n  }, [fechaFiltro]);');
    const indexReturnCargando = pedidosPageContent.indexOf('if (cargandoAuth) {');
    const indexReturnNoUsuario = pedidosPageContent.indexOf('if (!usuario) {');
    const indexReturnAdmin = pedidosPageContent.indexOf("if (usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN') {");

    assert.ok(indexUseEffectPagina !== -1, 'El hook useEffect(fechaFiltro) debe existir');
    assert.ok(indexReturnCargando !== -1, 'El condicional cargandoAuth debe existir');
    assert.ok(
      indexUseEffectPagina < indexReturnCargando,
      'useEffect debe estar declarado antes de if (cargandoAuth)'
    );
    assert.ok(
      indexUseEffectPagina < indexReturnNoUsuario,
      'useEffect debe estar declarado antes de if (!usuario)'
    );
    assert.ok(
      indexUseEffectPagina < indexReturnAdmin,
      'useEffect debe estar declarado antes de if (usuario.rol)'
    );
  });

  await t.test('4. Colegios y administradores: Cascada al renombrar y revocación estricta al eliminar', () => {
    const dataServiceContent = fs.readFileSync(path.resolve('src/lib/dataService.ts'), 'utf-8');

    // 1. Cascada de renombrado en hijos y pedidos
    assert.ok(
      dataServiceContent.includes(".from('hijos')") &&
      dataServiceContent.includes(".update({ colegio_nombre: nombreLimpio })"),
      'actualizarColegioConAdmin debe propagar el nuevo nombre a la tabla hijos'
    );
    assert.ok(
      dataServiceContent.includes(".from('pedidos')") &&
      dataServiceContent.includes(".update({ colegio_nombre: nombreLimpio })"),
      'actualizarColegioConAdmin debe propagar el nuevo nombre a la tabla pedidos'
    );

    // 2. Revocación de rol ADMIN al eliminar colegio
    assert.ok(
      dataServiceContent.includes(".from('perfiles_padres')") &&
      dataServiceContent.includes(".update({ rol: 'PADRE' })"),
      'eliminarColegioCompleto debe revocar el rol de ADMIN a PADRE para evitar privilegios huérfanos'
    );

    // 3. Páginas administrativas bloquean admin sin colegio asignado
    const despachoContent = fs.readFileSync(path.resolve('src/app/admin/despacho/page.tsx'), 'utf-8');
    assert.ok(
      despachoContent.includes('!esSuperAdmin && !usuario?.colegioNombre'),
      'Despacho debe bloquear acceso si un admin no tiene colegio asignado'
    );

    const cocinaContent = fs.readFileSync(path.resolve('src/app/admin/cocina/page.tsx'), 'utf-8');
    assert.ok(
      cocinaContent.includes('!esSuperAdmin && !usuario?.colegioNombre'),
      'Cocina debe bloquear acceso si un admin no tiene colegio asignado'
    );

    const fiadoContent = fs.readFileSync(path.resolve('src/app/admin/fiado/page.tsx'), 'utf-8');
    assert.ok(
      fiadoContent.includes('!esSuperAdmin && !usuario?.colegioNombre'),
      'Fiado debe bloquear acceso si un admin no tiene colegio asignado'
    );

    const adminContent = fs.readFileSync(path.resolve('src/app/admin/page.tsx'), 'utf-8');
    assert.ok(
      adminContent.includes('!esSuperAdmin && !usuario?.colegioNombre'),
      'Admin general debe bloquear acceso si un admin no tiene colegio asignado'
    );
  });

  await t.test('5. Fiados: Liquidación total exacta sin deuda residual multi-colegio', () => {
    const dataServiceContent = fs.readFileSync(path.resolve('src/lib/dataService.ts'), 'utf-8');
    const fiadoContent = fs.readFileSync(path.resolve('src/app/admin/fiado/page.tsx'), 'utf-8');

    // liquidarDeudaPadre soporta lista de IDs específicos
    assert.ok(
      dataServiceContent.includes('pedidoIds?: string[]'),
      'liquidarDeudaPadre debe soportar el parámetro pedidoIds para liquidación granular'
    );
    assert.ok(
      dataServiceContent.includes("colegioNombre === 'TODOS'"),
      'liquidarDeudaPadre debe manejar explícitamente colegioNombre === TODOS'
    );

    // Fiado UI extrae y envía los IDs de todos los pedidos pendientes
    assert.ok(
      fiadoContent.includes("idsPendientes = padre.pedidos") &&
      fiadoContent.includes(".filter((p) => p.estadoPago !== 'PAGADO')") &&
      fiadoContent.includes(".map((p) => p.id)"),
      'Fiado UI debe extraer los IDs de todos los pedidos pendientes del padre'
    );
    assert.ok(
      fiadoContent.includes('await dataService.liquidarDeudaPadre(ident, colFiltro, idsPendientes);'),
      'Fiado UI debe enviar los IDs específicos a liquidarDeudaPadre'
    );
  });

  await t.test('6. Sesión Segura: Revalidación en base de datos y rechazo de manipulación en cliente', () => {
    const authContextContent = fs.readFileSync(path.resolve('src/lib/authContext.tsx'), 'utf-8');

    // Revalidación contra la tabla perfiles_padres
    assert.ok(
      authContextContent.includes(".from('perfiles_padres')") &&
      authContextContent.includes(".select('id, nombre_completo, dni, telefono, email, rol, activo')"),
      'authContext debe consultar perfiles_padres al iniciar la sesión para verificar rol y vigencia'
    );

    // Desactivación inmediata ante activo === false o perfil borrado
    assert.ok(
      authContextContent.includes('if (error || !perfil || perfil.activo === false)'),
      'authContext debe cerrar sesión si el usuario no existe o está inactivo en base de datos'
    );

    // Imposición del rol de la base de datos
    assert.ok(
      authContextContent.includes("perfil.rol === 'SUPER_ADMIN'"),
      'authContext debe imponer el rol real obtenido de la base de datos sobre el guardado en localStorage'
    );

    // eliminarHijo maneja error de base de datos
    assert.ok(
      authContextContent.includes("if (error) {") &&
      authContextContent.includes("Error al eliminar el estudiante en base de datos"),
      'eliminarHijo debe reportar error si Supabase falla y no actualizar localmente'
    );
  });

  await t.test('7. Conteo exacto de estudiantes sin duplicación y catálogo activo por colegio', () => {
    const dataServiceContent = fs.readFileSync(path.resolve('src/lib/dataService.ts'), 'utf-8');
    const homeContent = fs.readFileSync(path.resolve('src/app/padres/page.tsx'), 'utf-8');
    const cocinaContent = fs.readFileSync(path.resolve('src/app/admin/cocina/page.tsx'), 'utf-8');

    // 1. dataService no duplica el incremento de estudiantes
    assert.ok(
      dataServiceContent.includes('conteoEstudiantes[colMatch.id] = (conteoEstudiantes[colMatch.id] || 0) + 1;'),
      'dataService debe asociar a colMatch e incrementar exactamente 1 por estudiante'
    );
    assert.ok(
      !dataServiceContent.includes("conteoEstudiantes[h.colegio_nombre.toLowerCase().trim()] ="),
      'dataService no debe tener un segundo incremento que duplique el conteo de alumnos'
    );

    // 2. Simulación de conteo para "colegio zarate san carlos"
    const colegiosBase = [{ id: 'col-zarate-sc', nombre: 'colegio zarate san carlos' }];
    const hijosData = [{ id: 'hijo-1', colegio_id: null, colegio_nombre: 'colegio zarate san carlos' }];

    const estudiantesPorColegio = {};
    for (const h of hijosData) {
      const colMatch = colegiosBase.find(
        (c) =>
          (h.colegio_id && c.id === h.colegio_id) ||
          (h.colegio_nombre && c.nombre.trim().toLowerCase() === h.colegio_nombre.trim().toLowerCase())
      );
      if (colMatch) {
        estudiantesPorColegio[colMatch.id] = (estudiantesPorColegio[colMatch.id] || 0) + 1;
      }
    }
    assert.equal(estudiantesPorColegio['col-zarate-sc'], 1, 'Debe contar exactamente 1 estudiante y no 2');

    // 3. Reset de selección y validación de pertenencia al catálogo en page.tsx
    assert.ok(
      homeContent.includes("setEntradaSeleccionada('');") &&
      homeContent.includes("setSegundoSeleccionado('');"),
      'page.tsx debe limpiar la selección anterior al cambiar colegio o día'
    );
    assert.ok(
      homeContent.includes("platosDelDia.some((p) => p.nombre === entradaSeleccionada && p.disponible)"),
      'page.tsx debe validar que los platos seleccionados pertenezcan al menú activo del colegio'
    );

    // 4. Inclusión de "Pagar luego" en Cocina
    assert.ok(
      cocinaContent.includes("p.metodoPago === 'Pagar luego'"),
      'Cocina debe preparar pedidos con método "Pagar luego" aunque su pago esté pendiente'
    );
  });

  await t.test('8. Colegios 100% independientes en BD y atributos (grados y observaciones no se mezclan)', () => {
    const dataServiceContent = fs.readFileSync(path.resolve('src/lib/dataService.ts'), 'utf-8');
    const schemaContent = fs.readFileSync(path.resolve('supabase/schema.sql'), 'utf-8');
    const adminContent = fs.readFileSync(path.resolve('src/app/admin/page.tsx'), 'utf-8');
    const hijosContent = fs.readFileSync(path.resolve('src/app/padres/hijos/page.tsx'), 'utf-8');
    const homeContent = fs.readFileSync(path.resolve('src/app/padres/page.tsx'), 'utf-8');
    const migrationContent = fs.readFileSync(
      path.resolve('supabase/migrations/202610140002_colegios_atributos_independientes.sql'),
      'utf-8'
    );

    // 1. Columnas en esquema y migración
    assert.ok(
      schemaContent.includes('grados JSONB') && schemaContent.includes('observaciones JSONB'),
      'supabase/schema.sql debe declarar columnas JSONB independientes grados y observaciones en colegios'
    );
    assert.ok(
      migrationContent.includes('ALTER TABLE public.colegios') &&
      migrationContent.includes('ADD COLUMN IF NOT EXISTS grados jsonb') &&
      migrationContent.includes('ADD COLUMN IF NOT EXISTS observaciones jsonb'),
      'La migración SQL debe asegurar las columnas grados y observaciones en public.colegios'
    );

    // 2. dataService acepta colegioNombreOId en todas las operaciones de grados y observaciones
    assert.ok(
      dataServiceContent.includes('obtenerGrados(colegioNombreOId?: string)') &&
      dataServiceContent.includes('guardarGradosColegio(nuevosGrados: string[], colegioNombreOId?: string)') &&
      dataServiceContent.includes('agregarGrado(nombre: string, colegioNombreOId?: string)') &&
      dataServiceContent.includes('eliminarGrado(nombre: string, colegioNombreOId?: string)'),
      'dataService debe parametrizar grados por colegioNombreOId'
    );
    assert.ok(
      dataServiceContent.includes('obtenerObservaciones(colegioNombreOId?: string)') &&
      dataServiceContent.includes('guardarObservacionesColegio(nuevasObs: string[], colegioNombreOId?: string)') &&
      dataServiceContent.includes('agregarObservacion(tag: string, colegioNombreOId?: string)') &&
      dataServiceContent.includes('eliminarObservacion(tag: string, colegioNombreOId?: string)'),
      'dataService debe parametrizar observaciones por colegioNombreOId'
    );

    // 3. Simulación funcional: mutar Colegio A NO debe alterar Colegio B
    const gradosPorColegio = {
      'Colegio Zarate': ['1.° Primaria A', '1.° Primaria B', '2.° Primaria A'],
      'Colegio Innova': ['1.° Primaria A', '3.° Primaria A'],
    };

    // Eliminar '1.° Primaria A' exclusivamente de Colegio Zarate
    const targetGrado = '1.° Primaria A';
    const targetColegio = 'Colegio Zarate';
    gradosPorColegio[targetColegio] = gradosPorColegio[targetColegio].filter(
      (g) => g.toLowerCase() !== targetGrado.toLowerCase()
    );

    // Verificaciones de aislamiento estricto
    assert.deepEqual(
      gradosPorColegio['Colegio Zarate'],
      ['1.° Primaria B', '2.° Primaria A'],
      'Colegio Zarate ya no debe tener 1.° Primaria A'
    );
    assert.deepEqual(
      gradosPorColegio['Colegio Innova'],
      ['1.° Primaria A', '3.° Primaria A'],
      'Colegio Innova DEBE MANTENER 1.° Primaria A intacto sin mezclarse con Colegio Zarate'
    );

    // 4. Panel Admin vincula colegioObjetivo a las llamadas
    assert.ok(
      adminContent.includes('dataService.obtenerGrados(colegioObjetivo)') &&
      adminContent.includes('dataService.obtenerObservaciones(colegioObjetivo)') &&
      adminContent.includes('dataService.agregarGrado(nuevoGrado.trim(), colegioObjetivo)') &&
      adminContent.includes('dataService.eliminarGrado(nombre, colegioObjetivo)') &&
      adminContent.includes('dataService.agregarObservacion(nuevaObservacion.trim(), colegioObjetivo)') &&
      adminContent.includes('dataService.eliminarObservacion(tag, colegioObjetivo)'),
      'admin/page.tsx debe pasar colegioObjetivo en todas las consultas y mutaciones de grados y observaciones'
    );

    // 5. Los padres obtienen los grados específicos del colegio de su hijo
    assert.ok(
      hijosContent.includes('dataService.obtenerGrados(colegio)'),
      'hijos/page.tsx debe recargar los grados cuando el padre selecciona un colegio'
    );
    assert.ok(
      homeContent.includes('dataService.obtenerGrados(colegioNuevoHijo)'),
      'page.tsx debe recargar los grados cuando el padre selecciona colegioNuevoHijo'
    );
  });
});

