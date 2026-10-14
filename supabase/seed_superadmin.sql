-- ==============================================================================
-- LIMPIEZA TOTAL Y SEEDER DE SUPERADMINISTRADOR
-- Copia y pega este script en el SQL Editor de tu Dashboard de Supabase
-- ==============================================================================

-- 1. Vaciar pedidos y carritos históricos
DELETE FROM pedidos;

-- 2. Vaciar estudiantes/hijos
DELETE FROM hijos;

-- 3. Vaciar platos de todos los menús
DELETE FROM platos;

-- 4. Vaciar instituciones educativas (colegios)
DELETE FROM colegios;

-- 5. Vaciar usuarios y apoderados anteriores
DELETE FROM perfiles_padres;

-- 6. Reiniciar días de menú y configuración de colegios
DELETE FROM menus_dia;

INSERT INTO menus_dia (dia_semana, activo, hora_cierre, mensaje_aviso) VALUES
('LUNES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('MARTES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('MIERCOLES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('JUEVES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('VIERNES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('SABADO', false, '09:30:00', '{"adminsColegio":{}}');

-- 7. Crear la cuenta única de SUPER ADMINISTRADOR
INSERT INTO perfiles_padres (
    nombre_completo,
    dni,
    telefono,
    email,
    password_hash,
    rol
) VALUES (
    'Super Administrador',
    '00000001',
    '999999998',
    'superadmin@almuerzos.com',
    'superadmin123',
    'SUPER_ADMIN'
);

-- ==============================================================================
-- CREDENCIALES DE ACCESO:
-- • DNI / Usuario: 00000001 (o superadmin)
-- • Contraseña:    superadmin123
-- • Rol:           SUPER_ADMIN
-- • Ruta panel:    /superadmin
-- ==============================================================================
