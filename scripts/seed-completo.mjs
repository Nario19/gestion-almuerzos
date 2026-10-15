import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpautcrhfdsktnutrzpt.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_o_XWReg7fOg-zkZcnWlhVw_QrbuGXwb';

const supabase = createClient(url, key);

// Utilidad para generar fechas en Perú (YYYY-MM-DD)
function obtenerFechaHoyPeru() {
  const ahora = new Date();
  const formatoPeru = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatoPeru.format(ahora);
}

function calcularOffsetFecha(fechaBase, offsetDias) {
  const [anio, mes, dia] = fechaBase.split('-').map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  d.setUTCDate(d.getUTCDate() + offsetDias);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const fechaHoy = obtenerFechaHoyPeru();
const fechaAyer = calcularOffsetFecha(fechaHoy, -1);
const fechaAnteayer = calcularOffsetFecha(fechaHoy, -2);

const GRADOS = [
  '1.° Primaria A',
  '1.° Primaria B',
  '2.° Primaria A',
  '2.° Primaria B',
  '3.° Primaria A',
  '4.° Primaria B',
  '5.° Primaria A',
  '5.° Primaria B',
  '6.° Primaria A',
  '1.° Secundaria A',
  '2.° Secundaria B',
  '3.° Secundaria (9no C)',
  '4.° Secundaria A',
  '5.° Secundaria B',
];

const ALERGIAS_EJEMPLOS = [
  null,
  null,
  null,
  null,
  'Alérgico al maní y frutos secos',
  'Intolerante a la lactosa',
  'Sin mariscos ni pescados',
  'Evitar condimentos fuertes',
  'Diabético - bajo en azúcar',
];

const APELLIDOS = [
  'Quispe', 'Flores', 'Rodríguez', 'Sánchez', 'García', 'Rojas', 'Díaz', 'Torres',
  'Ramírez', 'Vargas', 'Castro', 'Morales', 'Romero', 'Gutiérrez', 'Navarro', 'Mendoza',
  'Silva', 'Vega', 'Reyes', 'Campos', 'Paredes', 'Espinoza', 'Medina', 'Castillo',
  'Salazar', 'Guzmán', 'Cruz', 'Fernández', 'Pérez', 'Herrera', 'Valencia', 'Córdova'
];

const NOMBRES_PADRES_HOMBRES = [
  'Carlos', 'Juan', 'Luis', 'Jorge', 'Miguel', 'Víctor', 'Fernando', 'Diego', 'Javier', 'Pedro',
  'Manuel', 'Ricardo', 'Eduardo', 'Alejandro', 'Gabriel', 'Raúl', 'César', 'Andrés', 'Hugo', 'Renato'
];

const NOMBRES_PADRES_MUJERES = [
  'María', 'Rosa', 'Ana', 'Patricia', 'Carmen', 'Lucía', 'Elena', 'Gabriela', 'Sofía', 'Claudia',
  'Teresa', 'Milagros', 'Cecilia', 'Beatriz', 'Vanessa', 'Silvia', 'Verónica', 'Lorena', 'Rocío', 'Natalia'
];

const NOMBRES_HIJOS = [
  'Matías', 'Valentina', 'Thiago', 'Camila', 'Lucas', 'Luciana', 'Mateo', 'Isabella',
  'Joaquín', 'Emma', 'Santiago', 'Mia', 'Nicolás', 'Antonella', 'Benjamín', 'Zoe',
  'Gabriel', 'Paula', 'Liam', 'Martina', 'Sebastián', 'Renata', 'Emiliano', 'Abril',
  'Alonso', 'Valeria', 'Daniel', 'Victoria', 'Rodrigo', 'Lucía', 'Fabrizio', 'Ariana'
];

async function ejecutarSeederCompleto() {
  console.log('🚀 ============================================================');
  console.log('🚀 SEEDER INTEGRAL DE PRUEBAS — PLACERES CULINARIOS');
  console.log('🚀 ============================================================');
  console.log(`📡 Conectando a Supabase: ${url}\n`);

  try {
    // --------------------------------------------------------------------------
    // 1. LIMPIEZA TOTAL PREVIA
    // --------------------------------------------------------------------------
    console.log('🧹 1. Vaciando tablas anteriores...');
    await supabase.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hijos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('platos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('colegios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('perfiles_padres').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('menus_dia').delete().neq('dia_semana', '___DUMMY___');
    console.log('   ✅ Tablas vaciadas exitosamente.\n');

    // --------------------------------------------------------------------------
    // 2. CREAR CUENTA DE SUPERADMINISTRADOR
    // --------------------------------------------------------------------------
    console.log('👑 2. Creando cuenta de Super Administrador...');
    const superAdminData = {
      nombre_completo: 'Super Administrador del Sistema',
      dni: '00000001',
      telefono: '999999998',
      email: 'superadmin@almuerzos.com',
      password_hash: 'superadmin123',
      rol: 'SUPER_ADMIN',
    };
    const { data: superAdminCreado, error: errSuperAdmin } = await supabase
      .from('perfiles_padres')
      .insert([superAdminData])
      .select()
      .single();

    if (errSuperAdmin) throw new Error(`Error creando superadmin: ${errSuperAdmin.message}`);
    console.log(`   ✅ Super Admin creado: DNI ${superAdminCreado.dni} / Clave: superadmin123\n`);

    // --------------------------------------------------------------------------
    // 3. DEFINIR 3 COLEGIOS Y SUS ADMINISTRADORES
    // --------------------------------------------------------------------------
    console.log('🏫 3. Creando 3 Colegios con sus Administradores de Sede...');
    const configColegios = [
      {
        nombre: 'Colegio Claretiano',
        sede: 'Sede Principal',
        adminNombre: 'Carlos Mendoza (Admin Claretiano)',
        adminDni: '10000001',
        adminTel: '987000001',
        adminEmail: 'admin.claretiano@almuerzos.com',
        adminClave: 'admin123',
        dniPrefijo: '7100',
      },
      {
        nombre: 'Colegio San Agustín',
        sede: 'Sede Los Olivos',
        adminNombre: 'Mariana Flores (Admin San Agustín)',
        adminDni: '10000002',
        adminTel: '987000002',
        adminEmail: 'admin.sanagustin@almuerzos.com',
        adminClave: 'admin123',
        dniPrefijo: '7200',
      },
      {
        nombre: 'Colegio Santa Rosa',
        sede: 'Pabellón Central',
        adminNombre: 'Roberto Benítez (Admin Santa Rosa)',
        adminDni: '10000003',
        adminTel: '987000003',
        adminEmail: 'admin.santarosa@almuerzos.com',
        adminClave: 'admin123',
        dniPrefijo: '7300',
      },
    ];

    const adminsColegioMap = {};
    const colegiosCreados = [];

    for (const c of configColegios) {
      // A. Crear Admin en perfiles_padres
      const { data: adminUser, error: errAdm } = await supabase
        .from('perfiles_padres')
        .insert([
          {
            nombre_completo: c.adminNombre,
            dni: c.adminDni,
            telefono: c.adminTel,
            email: c.adminEmail,
            password_hash: c.adminClave,
            rol: 'ADMIN',
          },
        ])
        .select()
        .single();
      if (errAdm) throw new Error(`Error creando admin ${c.adminNombre}: ${errAdm.message}`);

      // B. Crear Colegio en colegios
      const sedeConAdmin = `${c.sede} | ${c.adminDni}`;
      const { data: colegioData, error: errCol } = await supabase
        .from('colegios')
        .insert([
          {
            nombre: c.nombre,
            sede: sedeConAdmin,
            activo: true,
          },
        ])
        .select()
        .single();
      if (errCol) throw new Error(`Error creando colegio ${c.nombre}: ${errCol.message}`);

      adminsColegioMap[c.nombre] = {
        dni: c.adminDni,
        email: c.adminEmail,
        nombreCompleto: c.adminNombre,
        adminId: adminUser.id,
      };

      colegiosCreados.push({
        ...colegioData,
        admin: c,
      });

      console.log(`   ✅ ${c.nombre} registrado con Admin DNI: ${c.adminDni} (Clave: admin123)`);
    }

    // Guardar configuración de sedes y admins en menus_dia (SABADO)
    const menusSemanales = [
      { dia_semana: 'LUNES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'MARTES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'MIERCOLES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'JUEVES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      { dia_semana: 'VIERNES', activo: true, hora_cierre: '09:30:00', mensaje_aviso: 'Pedidos hasta las 09:30 AM para entrega puntual.' },
      {
        dia_semana: 'SABADO',
        activo: false,
        hora_cierre: '09:30:00',
        mensaje_aviso: JSON.stringify({
          grados: GRADOS,
          observaciones: ['Sin cebolla', 'Poca crema', 'Sin ensalada', 'Presa sin piel', 'Solo segundo'],
          adminsColegio: adminsColegioMap,
        }),
      },
    ];
    await supabase.from('menus_dia').insert(menusSemanales);

    // --------------------------------------------------------------------------
    // 4. CREAR PLATOS DE MENÚ PARA LA SEMANA
    // --------------------------------------------------------------------------
    console.log('\n🍲 4. Creando catálogo de platos de menú escolar...');
    const platosBase = [
      { dia: 'LUNES', tipo: 'ENTRADA', nombre: 'Crema de zapallo y verduras', desc: 'Sopa casera calientita', orden: 1 },
      { dia: 'LUNES', tipo: 'ENTRADA', nombre: 'Ensalada fresca de lechuga y palta', desc: 'Ensalada con vinagreta de limón', orden: 2 },
      { dia: 'LUNES', tipo: 'SEGUNDO', nombre: 'Seco de pollo con frijoles y arroz', desc: 'Pollo al culantro con arroz blanco', orden: 1 },
      { dia: 'LUNES', tipo: 'SEGUNDO', nombre: 'Tallarines rojos con pollo', desc: 'Spaghetti en salsa de tomate y pollo', orden: 2 },

      { dia: 'MARTES', tipo: 'ENTRADA', nombre: 'Sopa de fideos y pollo', desc: 'Caldo de pollo con verduras', orden: 1 },
      { dia: 'MARTES', tipo: 'ENTRADA', nombre: 'Papa a la huancaína', desc: 'Papas sancochadas con salsa tradicional', orden: 2 },
      { dia: 'MARTES', tipo: 'SEGUNDO', nombre: 'Milanesa de pollo con puré de papa', desc: 'Pechuga crocante con puré y arroz', orden: 1 },
      { dia: 'MARTES', tipo: 'SEGUNDO', nombre: 'Pescado frito con salsa criolla', desc: 'Filete dorado con arroz y ensalada', orden: 2 },

      { dia: 'MIERCOLES', tipo: 'ENTRADA', nombre: 'Tequeños con crema de palta', desc: '4 tequeños rellenos de queso', orden: 1 },
      { dia: 'MIERCOLES', tipo: 'ENTRADA', nombre: 'Crema de espinaca', desc: 'Crema suave de espinacas', orden: 2 },
      { dia: 'MIERCOLES', tipo: 'SEGUNDO', nombre: 'Lomo saltado con papas fritas', desc: 'Trozos de lomo con cebolla y tomate', orden: 1 },
      { dia: 'MIERCOLES', tipo: 'SEGUNDO', nombre: 'Ají de gallina criollo', desc: 'Pollo deshilachado con crema de ají', orden: 2 },

      { dia: 'JUEVES', tipo: 'ENTRADA', nombre: 'Sopa wantán escolar', desc: 'Caldo con fideos y wantanes', orden: 1 },
      { dia: 'JUEVES', tipo: 'ENTRADA', nombre: 'Solterito de queso y choclo', desc: 'Ensalada de choclo, queso y habas', orden: 2 },
      { dia: 'JUEVES', tipo: 'SEGUNDO', nombre: 'Arroz chaufa con pollo y wantán', desc: 'Chaufa criollo bien sazonado', orden: 1 },
      { dia: 'JUEVES', tipo: 'SEGUNDO', nombre: 'Estofado de pollo con arvejas', desc: 'Pollo guisado en salsa de tomate', orden: 2 },

      { dia: 'VIERNES', tipo: 'ENTRADA', nombre: 'Crema de maíz tierno', desc: 'Sopa cremosa con choclo dulce', orden: 1 },
      { dia: 'VIERNES', tipo: 'ENTRADA', nombre: 'Causa rellena de pollo', desc: 'Masa de papa amarilla con pollo', orden: 2 },
      { dia: 'VIERNES', tipo: 'SEGUNDO', nombre: 'Carapulcra con sopa seca y cerdo', desc: 'Clásica carapulcra chinchana', orden: 1 },
      { dia: 'VIERNES', tipo: 'SEGUNDO', nombre: 'Pollo al horno con ensalada rusa', desc: 'Presa horneada con papas doradas', orden: 2 },
    ];

    const platosInsertar = [];
    for (const col of colegiosCreados) {
      for (const p of platosBase) {
        platosInsertar.push({
          dia_semana: p.dia,
          tipo: p.tipo,
          nombre: p.nombre,
          descripcion: `[ColegioId: ${col.id}] [Colegio: ${col.nombre}] ${p.desc}`,
          precio: 12.00,
          disponible: true,
          orden: p.orden,
        });
      }
    }
    const { error: errPlatosIns } = await supabase.from('platos').insert(platosInsertar);
    if (errPlatosIns) throw new Error(`Error insertando platos: ${errPlatosIns.message}`);
    console.log(`   ✅ ${platosInsertar.length} platos creados (distribuidos entre los 3 colegios).`);

    // --------------------------------------------------------------------------
    // 5. CREAR PADRES E HIJOS (EXACTAMENTE 60 HIJOS POR COLEGIO)
    // --------------------------------------------------------------------------
    console.log('\n👨‍👩‍👧‍👦 5. Creando Padres e Hijos (60 estudiantes por cada colegio)...');

    const todosLosPadres = [];
    const todosLosHijos = [];
    const todosLosPedidos = [];
    let pedidoContador = 100;

    for (let cIdx = 0; cIdx < colegiosCreados.length; cIdx++) {
      const col = colegiosCreados[cIdx];
      const dniPref = col.admin.dniPrefijo; // Ej: '7100', '7200', '7300'
      console.log(`   🏫 Generando estudiantes para "${col.nombre}"...`);

      // 40 padres en total:
      // - 20 padres con 2 hijos = 40 hijos
      // - 20 padres con 1 hijo  = 20 hijos
      // Total = exactamente 60 hijos por colegio
      const padresColegio = [];

      for (let pIdx = 1; pIdx <= 40; pIdx++) {
        const esHombre = pIdx % 2 === 1;
        const nombreBase = esHombre
          ? NOMBRES_PADRES_HOMBRES[(pIdx - 1) % NOMBRES_PADRES_HOMBRES.length]
          : NOMBRES_PADRES_MUJERES[(pIdx - 1) % NOMBRES_PADRES_MUJERES.length];
        const apPaterno = APELLIDOS[(cIdx * 10 + pIdx) % APELLIDOS.length];
        const apMaterno = APELLIDOS[(cIdx * 5 + pIdx * 2) % APELLIDOS.length];
        const nombreCompleto = `${nombreBase} ${apPaterno} ${apMaterno}`;

        const dni = `${dniPref}${String(pIdx).padStart(4, '0')}`; // Ej: 71000001
        const telefono = `9${String(80000000 + cIdx * 1000000 + pIdx * 1000).slice(0, 8)}`;
        const email = `padre.${dni}@almuerzos.com`;

        padresColegio.push({
          nombre_completo: nombreCompleto,
          dni,
          telefono,
          email,
          password_hash: 'padre123',
          rol: 'PADRE',
          numHijos: pIdx <= 20 ? 2 : 1, // Los primeros 20 tienen 2 hijos; los siguientes 20 tienen 1 hijo
          apPaterno,
        });
      }

      // Insertar los padres de este colegio en Supabase
      const { data: padresInsertados, error: errPadres } = await supabase
        .from('perfiles_padres')
        .insert(padresColegio.map(p => ({
          nombre_completo: p.nombre_completo,
          dni: p.dni,
          telefono: p.telefono,
          email: p.email,
          password_hash: p.password_hash,
          rol: p.rol,
        })))
        .select();

      if (errPadres) throw new Error(`Error insertando padres para ${col.nombre}: ${errPadres.message}`);
      todosLosPadres.push(...padresInsertados);

      // Crear los hijos correspondientes (exactamente 60)
      const hijosColegio = [];
      let totalHijosEsteColegio = 0;

      for (let i = 0; i < padresInsertados.length; i++) {
        const padreBd = padresInsertados[i];
        const metaPadre = padresColegio[i];

        for (let h = 1; h <= metaPadre.numHijos; h++) {
          totalHijosEsteColegio++;
          const nombreHijo = NOMBRES_HIJOS[(cIdx * 20 + totalHijosEsteColegio) % NOMBRES_HIJOS.length];
          const nombreCompletoHijo = `${nombreHijo} ${metaPadre.apPaterno} ${APELLIDOS[(totalHijosEsteColegio * 3) % APELLIDOS.length]}`;
          const grado = GRADOS[(totalHijosEsteColegio - 1) % GRADOS.length];
          const alergia = ALERGIAS_EJEMPLOS[(totalHijosEsteColegio + cIdx) % ALERGIAS_EJEMPLOS.length];

          hijosColegio.push({
            padre_id: padreBd.id,
            nombre_completo: nombreCompletoHijo,
            colegio_id: col.id,
            colegio_nombre: col.nombre,
            grado_seccion: grado,
            alergias_notas: alergia,
            padreDni: padreBd.dni,
            padreNombre: padreBd.nombre_completo,
            padreTel: padreBd.telefono,
          });
        }
      }

      const { data: hijosInsertados, error: errHijos } = await supabase
        .from('hijos')
        .insert(hijosColegio.map(h => ({
          padre_id: h.padre_id,
          nombre_completo: h.nombre_completo,
          colegio_id: h.colegio_id,
          colegio_nombre: h.colegio_nombre,
          grado_seccion: h.grado_seccion,
          alergias_notas: h.alergias_notas,
        })))
        .select();

      if (errHijos) throw new Error(`Error insertando hijos para ${col.nombre}: ${errHijos.message}`);
      todosLosHijos.push(...hijosInsertados);
      console.log(`      ✓ Creados ${padresInsertados.length} padres y ${hijosInsertados.length} estudiantes.`);

      // ------------------------------------------------------------------------
      // 6. GENERAR PEDIDOS DE MUESTRA (Fiados, Pagados, Entregados de Hoy y Ayer)
      // ------------------------------------------------------------------------
      // Para que /fiado tenga datos reales paginados con fiados de hoy y días anteriores
      for (let hIdx = 0; hIdx < hijosInsertados.length; hIdx++) {
        // Alrededor del 45% de los estudiantes tienen pedidos fiados o pagados
        if (hIdx % 2 === 0 || hIdx % 3 === 0) {
          const hijo = hijosInsertados[hIdx];
          const infoHijo = hijosColegio[hIdx];
          pedidoContador++;

          // Estado: 70% Fiados pendientes ("Pagar luego"), 30% Pagados
          const esFiadoPendiente = hIdx % 3 !== 0;
          const fechaPedido = hIdx % 4 === 0 ? fechaHoy : hIdx % 4 === 1 ? fechaAyer : fechaAnteayer;
          const estadoPedido = fechaPedido === fechaHoy ? (hIdx % 2 === 0 ? 'ENTREGADO' : 'REGISTRADO') : 'ENTREGADO';
          const horaEntrega = estadoPedido === 'ENTREGADO' ? (hIdx % 2 === 0 ? '12:45 p. m.' : '01:10 p. m.') : null;

          todosLosPedidos.push({
            codigo_pedido: `ALM-${String(pedidoContador).padStart(4, '0')}`,
            fecha: fechaPedido,
            dia_semana: fechaPedido === fechaHoy ? 'HOY' : 'ANTERIOR',
            padre_id: hijo.padre_id,
            hijo_id: hijo.id,
            colegio_nombre: col.nombre,
            estudiante_nombre: hijo.nombre_completo,
            grado_seccion: hijo.grado_seccion,
            telefono_contacto: infoHijo.padreTel,
            entrada_nombre: 'Crema de verduras casera',
            segundo_nombre: hIdx % 2 === 0 ? 'Seco de pollo con frijoles' : 'Milanesa de pollo con puré',
            observacion: `[Padre: ${infoHijo.padreNombre}] [ColegioId: ${col.id}]${horaEntrega ? ` [Entregado: ${horaEntrega}]` : ''}`,
            metodo_pago: 'Pagar luego',
            estado_pago: esFiadoPendiente ? 'PENDIENTE' : 'PAGADO',
            estado_pedido: estadoPedido,
            monto: 12.00,
          });
        }
      }
    }

    // Insertar pedidos en lotes
    if (todosLosPedidos.length > 0) {
      console.log(`\n📋 6. Registrando ${todosLosPedidos.length} pedidos de prueba para el módulo de Fiados...`);
      const { error: errPedidos } = await supabase.from('pedidos').insert(todosLosPedidos);
      if (errPedidos) throw new Error(`Error insertando pedidos: ${errPedidos.message}`);
      console.log('   ✅ Pedidos insertados exitosamente.');
    }

    console.log('\n🎉 ============================================================');
    console.log('🎉 SEEDER FINALIZADO CON ÉXITO');
    console.log('🎉 ============================================================');
    console.log(`📊 Resumen de registros creados en Supabase:`);
    console.log(`   • Super Administrador: 1`);
    console.log(`   • Colegios: 3 (${colegiosCreados.map(c => c.nombre).join(', ')})`);
    console.log(`   • Administradores de Sede: 3`);
    console.log(`   • Padres de Familia: ${todosLosPadres.length} (40 por colegio)`);
    console.log(`   • Estudiantes (Hijos): ${todosLosHijos.length} (exactamente 60 por colegio)`);
    console.log(`   • Pedidos de almuerzos: ${todosLosPedidos.length}`);

    return {
      ok: true,
      superAdmin: superAdminData,
      colegios: configColegios,
      totalPadres: todosLosPadres.length,
      totalHijos: todosLosHijos.length,
      totalPedidos: todosLosPedidos.length,
    };
  } catch (error) {
    console.error('❌ Error fatal ejecutando el seeder:', error);
    process.exit(1);
  }
}

ejecutarSeederCompleto();
