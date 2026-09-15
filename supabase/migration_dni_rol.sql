-- ==============================================================================
-- MIGRACIÓN Y SEEDER: DNI, ROL DE USUARIO Y CUENTA DE ADMINISTRADOR
-- ==============================================================================

-- 1. Agregar columna DNI único
ALTER TABLE perfiles_padres ADD COLUMN IF NOT EXISTS dni VARCHAR(20) UNIQUE;

-- 2. Hacer que el email sea opcional (NULL permitido)
ALTER TABLE perfiles_padres ALTER COLUMN email DROP NOT NULL;

-- 3. Agregar columna ROL ('PADRE' o 'ADMIN')
ALTER TABLE perfiles_padres ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'PADRE';

-- 4. SEEDER: Crear o actualizar cuenta del Administrador
INSERT INTO perfiles_padres (nombre_completo, dni, telefono, email, password_hash, rol)
VALUES (
    'Administrador General',
    '00000000',
    '999999999',
    'admin@almuerzos.com',
    'admin123',
    'ADMIN'
)
ON CONFLICT (dni) DO UPDATE SET 
    rol = 'ADMIN',
    password_hash = 'admin123';
