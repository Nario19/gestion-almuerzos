-- ==============================================================================
-- SISTEMA DE GESTIÓN DE ALMUERZOS ESCOLARES
-- Esquema de Base de Datos para Supabase (PostgreSQL)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE COLEGIOS
CREATE TABLE IF NOT EXISTS colegios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    sede VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    grados JSONB DEFAULT '[]'::jsonb,
    observaciones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERFILES DE PADRES / TUTORES Y ADMINISTRADORES
CREATE TABLE IF NOT EXISTS perfiles_padres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(200) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    password_hash VARCHAR(255),
    rol VARCHAR(20) NOT NULL DEFAULT 'PADRE', -- 'PADRE' o 'ADMIN'
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HIJOS / ESTUDIANTES VINCULADOS A CADA PADRE
CREATE TABLE IF NOT EXISTS hijos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    padre_id UUID REFERENCES perfiles_padres(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(200) NOT NULL,
    colegio_id UUID REFERENCES colegios(id) ON DELETE SET NULL,
    colegio_nombre VARCHAR(150) NOT NULL,
    grado_seccion VARCHAR(80) NOT NULL,
    alergias_notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE MENÚS POR DÍA
CREATE TABLE IF NOT EXISTS menus_dia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO')),
    fecha DATE,
    activo BOOLEAN DEFAULT true,
    hora_cierre TIME DEFAULT '09:30:00',
    mensaje_aviso TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE PLATOS (Entradas y Segundos con Fotografía)
CREATE TABLE IF NOT EXISTS platos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES menus_dia(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO')),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SEGUNDO', 'BEBIDA', 'POSTRE')),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) DEFAULT 12.00,
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT true,
    orden INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_pedido VARCHAR(20) NOT NULL UNIQUE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    dia_semana VARCHAR(20) DEFAULT 'HOY',
    padre_id UUID REFERENCES perfiles_padres(id) ON DELETE SET NULL,
    hijo_id UUID REFERENCES hijos(id) ON DELETE SET NULL,
    estudiante_nombre VARCHAR(200) NOT NULL,
    colegio_nombre VARCHAR(150) NOT NULL,
    grado_seccion VARCHAR(80) NOT NULL,
    telefono_contacto VARCHAR(30),
    entrada_nombre VARCHAR(150) NOT NULL,
    segundo_nombre VARCHAR(150) NOT NULL,
    observacion TEXT,
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Yape', -- 'Yape', 'Plin', 'Efectivo', 'Mensual'
    estado_pago VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'VERIFICANDO', 'PAGADO'
    estado_pedido VARCHAR(50) NOT NULL DEFAULT 'REGISTRADO', -- 'REGISTRADO', 'EN_COCINA', 'EMPACADO', 'ENTREGADO'
    comprobante_url TEXT,
    monto NUMERIC(10, 2) DEFAULT 12.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX IF NOT EXISTS idx_pedidos_colegio ON pedidos(colegio_nombre);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado_pedido);
CREATE INDEX IF NOT EXISTS idx_platos_dia ON platos(dia_semana);
CREATE INDEX IF NOT EXISTS idx_hijos_padre ON hijos(padre_id);

-- 9. HABILITAR TIEMPO REAL (Supabase Realtime)
-- Permite que la pantalla de cocina y despacho reciban eventos en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE platos;

-- 10. BUCKETS DE ALMACENAMIENTO (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('comprobantes', 'comprobantes', true),
    ('platos', 'platos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de lectura y subida pública para las imágenes
DROP POLICY IF EXISTS "Acceso publico comprobantes" ON storage.objects;
CREATE POLICY "Acceso publico comprobantes" ON storage.objects FOR SELECT USING (bucket_id = 'comprobantes');

DROP POLICY IF EXISTS "Acceso publico platos" ON storage.objects;
CREATE POLICY "Acceso publico platos" ON storage.objects FOR SELECT USING (bucket_id = 'platos');

DROP POLICY IF EXISTS "Permitir subida comprobantes" ON storage.objects;
CREATE POLICY "Permitir subida comprobantes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comprobantes');

DROP POLICY IF EXISTS "Permitir subida platos" ON storage.objects;
CREATE POLICY "Permitir subida platos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'platos');

-- 11. DATOS INICIALES (Colegios)
INSERT INTO colegios (nombre, sede) VALUES
('Colegio San José', 'Sede Principal'),
('Colegio Santa Rosa', 'Pabellón Primaria y Secundaria'),
('I.E. Miguel Grau', 'Sede Central'),
('Colegio San Agustín', 'Sede Los Olivos')
ON CONFLICT DO NOTHING;

-- 12. MENÚS DE LA SEMANA (Lunes a Viernes)
INSERT INTO menus_dia (dia_semana, activo, hora_cierre, mensaje_aviso) VALUES
('LUNES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('MARTES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('MIERCOLES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('JUEVES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.'),
('VIERNES', true, '09:30:00', 'Pedidos hasta las 09:30 AM para entrega puntual.')
ON CONFLICT DO NOTHING;

-- 13. PLATOS CON FOTOGRAFÍAS DE EJEMPLO
-- LUNES
INSERT INTO platos (dia_semana, tipo, nombre, descripcion, precio, imagen_url, orden) VALUES
('LUNES', 'ENTRADA', 'Crema rosada', 'Deliciosa crema de beterraga con queso fresco y galletas', 0.00, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80', 1),
('LUNES', 'ENTRADA', 'Crema de huancaína tradicional', 'Clásica salsa huancaína con papa sancochada y huevo duro', 0.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80', 2),
('LUNES', 'SEGUNDO', 'Seco de pollo con frijoles y arroz', 'Jugosa presa de pollo al culantro acompañada de frijoles canarios', 12.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80', 1),
('LUNES', 'SEGUNDO', 'Tallarines rojos con pollo', 'Spaghetti con salsa de tomate casera y presa de pollo dorada', 12.00, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80', 2);

-- MARTES
INSERT INTO platos (dia_semana, tipo, nombre, descripcion, precio, imagen_url, orden) VALUES
('MARTES', 'ENTRADA', 'Sopa de verduras y pollo', 'Caldo reconfortante con verduras frescas y trozos de pollo', 0.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', 1),
('MARTES', 'ENTRADA', 'Ensalada fresca con palta', 'Lechuga orgánica, tomate, choclo y palta en láminas', 0.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', 2),
('MARTES', 'SEGUNDO', 'Pescado frito con arroz y ensalada', 'Filete de pescado fresco dorado con salsa criolla y arroz', 12.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', 1),
('MARTES', 'SEGUNDO', 'Milanesa de pollo con puré de papa', 'Milanesa crocante con suave puré de papa amarilla y arroz', 12.00, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80', 2);

-- MIERCOLES
INSERT INTO platos (dia_semana, tipo, nombre, descripcion, precio, imagen_url, orden) VALUES
('MIERCOLES', 'ENTRADA', 'Tequeños de queso con guacamole', '4 tequeños crujientes rellenos de queso andino', 0.00, 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80', 1),
('MIERCOLES', 'SEGUNDO', 'Lomo saltado criollo con papas fritas', 'Trozos tiernos salteados al wok con cebolla, tomate y papas fritas', 13.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 1),
('MIERCOLES', 'SEGUNDO', 'Ají de gallina con huevo y aceituna', 'Crema suave de ají amarillo con pollo deshilachado y arroz', 12.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80', 2)
ON CONFLICT DO NOTHING;

-- 14. POLÍTICAS DE ACCESO RLS (Row Level Security)
-- Permitir lectura y escritura desde la aplicación web
ALTER TABLE colegios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico colegios" ON colegios;
CREATE POLICY "Acceso publico colegios" ON colegios FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE menus_dia ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico menus_dia" ON menus_dia;
CREATE POLICY "Acceso publico menus_dia" ON menus_dia FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE platos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico platos_tabla" ON platos;
CREATE POLICY "Acceso publico platos_tabla" ON platos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE perfiles_padres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico perfiles_padres" ON perfiles_padres;
CREATE POLICY "Acceso publico perfiles_padres" ON perfiles_padres FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE hijos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico hijos" ON hijos;
CREATE POLICY "Acceso publico hijos" ON hijos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso publico pedidos" ON pedidos;
CREATE POLICY "Acceso publico pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);

