import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpautcrhfdsktnutrzpt.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_o_XWReg7fOg-zkZcnWlhVw_QrbuGXwb';

const supabase = createClient(url, key);

async function runSeed() {
  console.log('🌱 Ejecutando Seeder en Supabase...');

  // Intentar crear/actualizar el usuario administrador
  const { data, error } = await supabase
    .from('perfiles_padres')
    .upsert(
      [
        {
          nombre_completo: 'Administrador General',
          dni: '00000000',
          telefono: '999999999',
          email: 'admin@almuerzos.com',
          password_hash: 'admin123',
          rol: 'ADMIN',
        },
      ],
      { onConflict: 'dni' }
    )
    .select();

  if (error) {
    console.log('Nota sobre el Seeder:', error.message);
    console.log('Asegúrate de haber ejecutado la migración supabase/migration_dni_rol.sql en Supabase SQL Editor.');
  } else {
    console.log('✅ Seeder completado exitosamente:');
    console.log('   Usuario Admin DNI: 00000000');
    console.log('   Contraseña: admin123');
    console.log('   Rol: ADMIN');
  }
}

runSeed();
