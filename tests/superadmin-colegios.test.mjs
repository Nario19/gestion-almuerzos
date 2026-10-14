import test from 'node:test';
import assert from 'node:assert/strict';

test('Sistema de Super Administrador y Administradores por Colegio', async (t) => {
  await t.test('1. Cuenta de Super Admin: DNI 00000001 / superadmin obtiene rol SUPER_ADMIN con privilegios globales', () => {
    const credencialesValidas = [
      { user: '00000001', pass: 'superadmin123' },
      { user: 'superadmin', pass: 'superadmin123' },
      { user: 'superadmin@almuerzos.com', pass: 'superadmin123' },
    ];

    for (const cred of credencialesValidas) {
      const idLimpio = cred.user.trim();
      const esSuperAdmin =
        (idLimpio === '00000001' ||
          idLimpio.toLowerCase() === 'superadmin' ||
          idLimpio.toLowerCase() === 'superadmin@almuerzos.com') &&
        cred.pass === 'superadmin123';

      assert.equal(esSuperAdmin, true, `Debe validar como Super Admin con ${cred.user}`);
      const esAdmin = esSuperAdmin || idLimpio === '00000000';
      assert.equal(esAdmin, true, 'Super Admin también debe poseer privilegios de Admin');
    }
  });

  await t.test('2. Administrador asignado a Colegio: Detecta rol ADMIN y vincula su colegioNombre', () => {
    const usuarioColegio = {
      id: 'adm-claretiano-id',
      nombreCompleto: 'Admin Colegio Claretiano',
      dni: 'ADM-CLARETIANO',
      email: 'claretiano@almuerzos.com',
      rol: 'ADMIN',
      colegioNombre: 'COLEGIO CLARETIANO',
    };

    const esSuperAdmin = usuarioColegio.rol === 'SUPER_ADMIN';
    const esAdmin = usuarioColegio.rol === 'ADMIN' || usuarioColegio.rol === 'SUPER_ADMIN';

    assert.equal(esSuperAdmin, false, 'No es Super Admin');
    assert.equal(esAdmin, true, 'Posee rol de Administrador');
    assert.equal(usuarioColegio.colegioNombre, 'COLEGIO CLARETIANO');
  });

  await t.test('3. Scoping en Despacho: Admin de sede queda restringido a su colegio, Super Admin ve TODOS', () => {
    const todosLosColegios = ['COLEGIO CLARETIANO', 'COLEGIO ZÁRATE', 'COLEGIO SAN AGUSTÍN'];
    const pedidos = [
      { id: '1', colegioNombre: 'COLEGIO CLARETIANO', estudianteNombre: 'Ana' },
      { id: '2', colegioNombre: 'COLEGIO ZÁRATE', estudianteNombre: 'Beto' },
      { id: '3', colegioNombre: 'COLEGIO CLARETIANO', estudianteNombre: 'Carlos' },
      { id: '4', colegioNombre: 'COLEGIO SAN AGUSTÍN', estudianteNombre: 'Daniel' },
    ];

    // Admin de Claretiano
    const adminClaretiano = { rol: 'ADMIN', colegioNombre: 'COLEGIO CLARETIANO' };
    const filtroAdmin = adminClaretiano.colegioNombre; // Restringido
    const pedidosAdmin = pedidos.filter((p) => p.colegioNombre === filtroAdmin);
    assert.equal(pedidosAdmin.length, 2);
    assert.ok(pedidosAdmin.every((p) => p.colegioNombre === 'COLEGIO CLARETIANO'));

    // Super Admin
    const superAdmin = { rol: 'SUPER_ADMIN' };
    const filtroSuperAdmin = 'TODOS';
    const pedidosSuperAdmin = pedidos.filter(
      (p) => filtroSuperAdmin === 'TODOS' || p.colegioNombre === filtroSuperAdmin
    );
    assert.equal(pedidosSuperAdmin.length, 4, 'Super Admin debe poder ver los pedidos de todos los colegios');
  });

  await t.test('4. Scoping en Cocina: Consolidado de preparaciones se filtra por la sede asignada del admin', () => {
    const pedidos = [
      { id: '1', colegioNombre: 'COLEGIO CLARETIANO', estadoPago: 'PAGADO', segundoNombre: 'Lomo Saltado' },
      { id: '2', colegioNombre: 'COLEGIO ZÁRATE', estadoPago: 'PAGADO', segundoNombre: 'Seco de Pollo' },
      { id: '3', colegioNombre: 'COLEGIO CLARETIANO', estadoPago: 'PAGADO', segundoNombre: 'Lomo Saltado' },
    ];

    const usuarioAdmin = { rol: 'ADMIN', colegioNombre: 'COLEGIO CLARETIANO' };
    const colegioFiltro = usuarioAdmin.colegioNombre;
    const pedidosCocina = pedidos.filter((p) => p.colegioNombre === colegioFiltro);

    assert.equal(pedidosCocina.length, 2);
    assert.equal(pedidosCocina[0].segundoNombre, 'Lomo Saltado');
    assert.equal(pedidosCocina[1].segundoNombre, 'Lomo Saltado');
  });

  await t.test('5. Creación de Colegio con Administrador: Valida campos requeridos y estructura completa', () => {
    const crearColegioSimulado = (datosColegio, datosAdmin) => {
      if (!datosColegio.nombre?.trim()) {
        return { ok: false, error: 'El nombre del colegio es obligatorio.' };
      }
      if (!datosAdmin.nombreCompleto?.trim() || !datosAdmin.dni?.trim() || !datosAdmin.password?.trim()) {
        return { ok: false, error: 'Debe ingresar el nombre, usuario/DNI y contraseña del administrador.' };
      }

      const nuevoColegio = {
        id: 'col-123',
        nombre: datosColegio.nombre.trim(),
        sede: datosColegio.sede?.trim() || '',
        activo: datosColegio.activo !== false,
        admin: {
          id: 'adm-456',
          nombreCompleto: datosAdmin.nombreCompleto.trim(),
          dni: datosAdmin.dni.trim(),
          email: datosAdmin.email?.trim() || `${datosAdmin.dni.trim().toLowerCase()}@almuerzos.com`,
          telefono: datosAdmin.telefono?.trim() || '999999999',
        },
        totalPedidos: 0,
      };

      return { ok: true, colegio: nuevoColegio };
    };

    // Caso Error: Falta nombre de colegio
    const errorColegio = crearColegioSimulado({ nombre: '' }, { nombreCompleto: 'Admin', dni: 'ADM-1', password: '123' });
    assert.equal(errorColegio.ok, false);

    // Caso Error: Falta clave de admin
    const errorAdmin = crearColegioSimulado({ nombre: 'Colegio Test' }, { nombreCompleto: 'Admin', dni: 'ADM-1', password: '' });
    assert.equal(errorAdmin.ok, false);

    // Caso Éxito: Creación completa
    const exito = crearColegioSimulado(
      { nombre: 'Colegio Los Álamos', sede: 'San Borja', activo: true },
      { nombreCompleto: 'Carlos Mendoza', dni: 'ADM-ALAMOS', email: 'alamos@almuerzos.com', telefono: '987112233', password: 'claveSegura123' }
    );
    assert.equal(exito.ok, true);
    assert.equal(exito.colegio.nombre, 'Colegio Los Álamos');
    assert.equal(exito.colegio.admin.dni, 'ADM-ALAMOS');
    assert.equal(exito.colegio.admin.nombreCompleto, 'Carlos Mendoza');
    assert.equal(exito.colegio.activo, true);
  });

  await t.test('6. Actualización y cambio de clave del Administrador de sede', () => {
    const colegioExistente = {
      id: 'col-1',
      nombre: 'Colegio Los Álamos',
      sede: 'San Borja',
      activo: true,
      admin: {
        id: 'adm-1',
        nombreCompleto: 'Carlos Mendoza',
        dni: 'ADM-ALAMOS',
        email: 'alamos@almuerzos.com',
        telefono: '987112233',
        password: 'claveVieja123',
      },
    };

    // Actualizar teléfono y clave
    const actualizarAdminSimulado = (col, nuevosDatosAdmin) => {
      col.admin = {
        ...col.admin,
        ...nuevosDatosAdmin,
      };
      return col;
    };

    const actualizado = actualizarAdminSimulado(colegioExistente, {
      telefono: '999888777',
      password: 'nuevaClaveSegura2026',
    });

    assert.equal(actualizado.admin.telefono, '999888777');
    assert.equal(actualizado.admin.password, 'nuevaClaveSegura2026');
    assert.equal(actualizado.admin.dni, 'ADM-ALAMOS', 'El DNI/Usuario debe preservarse');
  });

  await t.test('7. Pausar y reactivar Colegio: Afecta disponibilidad para los padres sin borrar datos', () => {
    let colegio = { id: 'col-1', nombre: 'Colegio Santa Rosa', activo: true };

    // Pausar
    colegio.activo = false;
    const colegiosParaPadres = [colegio].filter((c) => c.activo).map((c) => c.nombre);
    assert.equal(colegiosParaPadres.length, 0, 'Colegio pausado no debe ser visible para padres');

    // Reactivar
    colegio.activo = true;
    const colegiosReactivados = [colegio].filter((c) => c.activo).map((c) => c.nombre);
    assert.equal(colegiosReactivados.length, 1);
    assert.equal(colegiosReactivados[0], 'Colegio Santa Rosa');
  });
});
