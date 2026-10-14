import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpautcrhfdsktnutrzpt.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_o_XWReg7fOg-zkZcnWlhVw_QrbuGXwb';

const supabase = createClient(url, key);

async function runSeedSuperAdmin() {
  console.log('🧹 ============================================================');
  console.log('🧹 LIMPIEZA TOTAL DE BASE DE DATOS Y SEEDER DE SUPERADMIN');
  console.log('🧹 ============================================================\n');
  console.log(`📡 Conectando a Supabase: ${url}...\n`);

  try {
    // 1. Limpiar pedidos
    console.log('1️⃣  Eliminando pedidos anteriores...');
    const { error: errPedidos } = await supabase
      .from('pedidos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errPedidos) {
      console.warn('   ⚠️ Error eliminando pedidos:', errPedidos.message);
    } else {
      console.log('   ✅ Tabla "pedidos" vaciada.');
    }

    // 2. Limpiar hijos
    console.log('2️⃣  Eliminando registros de estudiantes (hijos)...');
    const { error: errHijos } = await supabase
      .from('hijos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errHijos) {
      console.warn('   ⚠️ Error eliminando hijos:', errHijos.message);
    } else {
      console.log('   ✅ Tabla "hijos" vaciada.');
    }

    // 3. Limpiar platos
    console.log('3️⃣  Eliminando platos de menú...');
    const { error: errPlatos } = await supabase
      .from('platos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errPlatos) {
      console.warn('   ⚠️ Error eliminando platos:', errPlatos.message);
    } else {
      console.log('   ✅ Tabla "platos" vaciada.');
    }

    // 4. Limpiar colegios
    console.log('4️⃣  Eliminando sedes escolares (colegios)...');
    const { error: errColegios } = await supabase
      .from('colegios')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errColegios) {
      console.warn('   ⚠️ Error eliminando colegios:', errColegios.message);
    } else {
      console.log('   ✅ Tabla "colegios" vaciada.');
    }

    // 5. Limpiar usuarios y apoderados
    console.log('5️⃣  Eliminando cuentas de usuarios y administradores anteriores...');
    const { error: errPadres } = await supabase
      .from('perfiles_padres')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (errPadres) {
      console.warn('   ⚠️ Error eliminando perfiles_padres:', errPadres.message);
    } else {
      console.log('   ✅ Tabla "perfiles_padres" vaciada.');
    }

    // 6. Resetear configuración de menus_dia
    console.log('6️⃣  Inicializando configuración de menús semanales...');
    await supabase.from('menus_dia').delete().neq('dia_semana', '___DUMMY___');

    const diasSemana = [
      { dia_semana: 'LUNES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'MARTES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'MIERCOLES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'JUEVES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'VIERNES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'SABADO', activo: false, hora_cierre: '09:30:00', mensaje_aviso: JSON.stringify({ adminsColegio: {} }) },
    ];

    const { error: errMenus } = await supabase.from('menus_dia').insert(diasSemana);
    if (errMenus) {
      console.warn('   ⚠️ Nota al insertar menus_dia:', errMenus.message);
    } else {
      console.log('   ✅ Tabla "menus_dia" inicializada.');
    }

    // 7. Crear la cuenta de SUPER ADMINISTRADOR
    console.log('7️⃣  Creando cuenta única de Super Administrador...');
    const superAdminData = {
      nombre_completo: 'Super Administrador',
      dni: '00000001',
      telefono: '999999998',
      email: 'superadmin@almuerzos.com',
      password_hash: 'superadmin123',
      rol: 'SUPER_ADMIN',
    };

    const { data: usuarioCreado, error: errSuperAdmin } = await supabase
      .from('perfiles_padres')
      .insert([superAdminData])
      .select()
      .single();

    if (errSuperAdmin) {
      console.error('❌ Error creando Super Administrador:', errSuperAdmin.message);
      process.exit(1);
    }

    console.log('\n============================================================');
    console.log('🎉 BASE DE DATOS LIMPIA Y SEEDER COMPLETADO CON ÉXITO');
    console.log('============================================================');
    console.log('👤 Cuenta creada:');
    console.log('   • Rol:           SUPER_ADMIN');
    console.log('   • Nombre:        Super Administrador');
    console.log('   • DNI / Usuario: 00000001 (o "superadmin")');
    console.log('   • Contraseña:    superadmin123');
    console.log('   • Email:         superadmin@almuerzos.com');
    console.log('------------------------------------------------------------');
    console.log('🏫 Estado de Colegios:');
    console.log('   • 0 colegios registrados.');
    console.log('   • Ingresa como Super Administrador a /superadmin');
    console.log('     para crear cada colegio y su propio usuario de administrador.');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Error fatal en la ejecución del seeder:', error);
    process.exit(1);
  }
}

runSeedSuperAdmin();
