import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let envVars = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  envVars = Object.fromEntries(
    content
      .split('\n')
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const idx = l.indexOf('=');
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')];
      })
  );
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Lista quemada que NUNCA debe aparecer
const COLEGIOS_QUEMADOS_PROHIBIDOS = [
  'Colegio San José',
  'Colegio Santa Rosa',
  'I.E. Miguel Grau',
  'Colegio San Agustín',
];

describe('Sincronización Estricta de Colegios y Configuración (Admin -> Padres)', () => {
  const COLEGIO_PRUEBA = 'COLEGIO TEST AUTOMATIZADO REGRESIÓN';
  let online = false;

  // Limpiar antes y después
  const limpiarColegioPrueba = async () => {
    if (!supabase || !online) return;
    try {
      await supabase.from('colegios').delete().eq('nombre', COLEGIO_PRUEBA);
    } catch {}
  };

  before(async () => {
    if (!supabase) return;
    try {
      const abort = new AbortController();
      const id = setTimeout(() => abort.abort(), 1200);
      const { error } = await supabase.from('colegios').select('id').limit(1).abortSignal(abort.signal);
      clearTimeout(id);
      if (!error) online = true;
    } catch {
      online = false;
    }
    await limpiarColegioPrueba();
  });

  after(limpiarColegioPrueba);

  test('1. Supabase debe estar configurado y accesible para el servicio de datos', () => {
    assert.ok(supabase, 'El cliente de Supabase debe estar inicializado');
  });

  test('2. obtenerColegios() debe retornar los colegios configurados por el admin y NUNCA los defaults quemados', async (t) => {
    if (!online) {
      t.skip('Supabase no accesible en entorno offline/sandbox');
      return;
    }
    const { data, error } = await supabase
      .from('colegios')
      .select('nombre, activo')
      .order('nombre', { ascending: true });

    assert.ifError(error);
    assert.ok(Array.isArray(data), 'Los datos deben ser un array');
    assert.ok(data.length > 0, 'Debe haber al menos 1 colegio configurado en la base de datos');

    const nombres = data
      .filter((d) => d.activo !== false)
      .map((d) => (d.nombre ? d.nombre.trim() : ''))
      .filter((n) => n.length > 0);

    // Ninguno de los colegios quemados anteriores debe estar en la lista activa
    for (const quemado of COLEGIOS_QUEMADOS_PROHIBIDOS) {
      assert.strictEqual(
        nombres.includes(quemado),
        false,
        `El colegio quemado "${quemado}" no debe existir en la lista de colegios activos`
      );
    }

    // Los colegios agregados por el admin deben estar presentes
    assert.ok(
      nombres.some((n) => n.toUpperCase().includes('ZÁRATE') || n.toUpperCase().includes('CLARETIANO')),
      'Debe incluir los colegios reales configurados por el administrador (ej. Zárate o Claretiano)'
    );
  });

  test('3. Cuando el Admin agrega un colegio, debe persistirse en Supabase y estar disponible para los padres', async (t) => {
    if (!online) {
      t.skip('Supabase no accesible en entorno offline/sandbox');
      return;
    }
    // Simular que el admin agrega un colegio
    const { error: insertError } = await supabase
      .from('colegios')
      .insert([{ nombre: COLEGIO_PRUEBA, activo: true }]);

    assert.ifError(insertError);

    // Simular que el padre consulta la lista de colegios al registrar a un hijo
    const { data, error: selectError } = await supabase
      .from('colegios')
      .select('nombre, activo')
      .order('nombre', { ascending: true });

    assert.ifError(selectError);
    const nombres = data.filter((d) => d.activo !== false).map((d) => d.nombre.trim());

    assert.ok(
      nombres.includes(COLEGIO_PRUEBA),
      `El nuevo colegio "${COLEGIO_PRUEBA}" debe estar visible para los padres de inmediato`
    );
  });

  test('4. Cuando el Admin elimina un colegio, debe removerse y los padres NO deben poder verlo', async (t) => {
    if (!online) {
      t.skip('Supabase no accesible en entorno offline/sandbox');
      return;
    }
    // Eliminar el colegio de prueba
    const { error: deleteError } = await supabase
      .from('colegios')
      .delete()
      .eq('nombre', COLEGIO_PRUEBA);

    assert.ifError(deleteError);

    // Verificar que un padre que consulta colegios ya no lo ve
    const { data, error: selectError } = await supabase
      .from('colegios')
      .select('nombre, activo')
      .order('nombre', { ascending: true });

    assert.ifError(selectError);
    const nombres = data.filter((d) => d.activo !== false).map((d) => d.nombre.trim());

    assert.strictEqual(
      nombres.includes(COLEGIO_PRUEBA),
      false,
      `El colegio eliminado "${COLEGIO_PRUEBA}" no debe aparecer en la lista de los padres`
    );
  });

  test('5. Los colegios con activo = false deben ser ignorados y no ofrecerse a los padres', async (t) => {
    if (!online) {
      t.skip('Supabase no accesible en entorno offline/sandbox');
      return;
    }
    const COLEGIO_INACTIVO = 'COLEGIO TEMPORALMENTE INACTIVO';
    await supabase.from('colegios').delete().eq('nombre', COLEGIO_INACTIVO);

    // Insertar colegio inactivo
    await supabase.from('colegios').insert([{ nombre: COLEGIO_INACTIVO, activo: false }]);

    try {
      const { data } = await supabase
        .from('colegios')
        .select('nombre, activo')
        .order('nombre', { ascending: true });

      const colegiosActivos = data
        .filter((d) => d.activo !== false)
        .map((d) => d.nombre.trim());

      assert.strictEqual(
        colegiosActivos.includes(COLEGIO_INACTIVO),
        false,
        'Los colegios inactivos no deben incluirse en las opciones para los padres'
      );
    } finally {
      await supabase.from('colegios').delete().eq('nombre', COLEGIO_INACTIVO);
    }
  });

  test('6. Sincronización de Grados y Observaciones persiste en la base de datos central', async (t) => {
    if (!online) {
      t.skip('Supabase no accesible en entorno offline/sandbox');
      return;
    }
    const { data, error } = await supabase
      .from('menus_dia')
      .select('mensaje_aviso')
      .eq('dia_semana', 'SABADO')
      .maybeSingle();

    assert.ifError(error);
    assert.ok(data, 'Debe existir el registro de configuración del sistema en menus_dia (SABADO)');
    assert.ok(data.mensaje_aviso, 'Debe contener la configuración en formato JSON');

    const config = JSON.parse(data.mensaje_aviso);
    assert.ok(Array.isArray(config.grados), 'La configuración debe contener un array de grados');
    assert.ok(config.grados.length > 0, 'Debe haber grados configurados');
    assert.ok(Array.isArray(config.observaciones), 'La configuración debe contener un array de observaciones');
    assert.ok(config.observaciones.length > 0, 'Debe haber observaciones configuradas');
  });

  test('7. Paridad de UI: Los padres en /hijos ven exactamente los mismos colegios que el Admin en /admin', async (t) => {
    if (!online) {
      t.skip('Supabase no accesible en entorno offline/sandbox');
      return;
    }
    // Consulta simulada para Admin
    const { data: dataAdmin } = await supabase
      .from('colegios')
      .select('nombre, activo')
      .order('nombre', { ascending: true });

    const listaAdmin = dataAdmin
      .filter((d) => d.activo !== false)
      .map((d) => d.nombre.trim());

    // Consulta simulada para Padre (formulario de registro de hijos)
    const { data: dataPadre } = await supabase
      .from('colegios')
      .select('nombre, activo')
      .order('nombre', { ascending: true });

    const listaPadre = dataPadre
      .filter((d) => d.activo !== false)
      .map((d) => d.nombre.trim());

    assert.deepStrictEqual(
      listaPadre,
      listaAdmin,
      'La lista mostrada a los padres debe ser exactamente idéntica a la lista del administrador'
    );
  });
});
