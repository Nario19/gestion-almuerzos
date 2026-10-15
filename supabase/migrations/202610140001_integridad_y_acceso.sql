BEGIN;
-- Conserva IDs e históricos. No borra pedidos, alumnos ni perfiles.
ALTER TABLE public.colegios ADD COLUMN IF NOT EXISTS eliminado_at timestamptz;
ALTER TABLE public.perfiles_padres ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id);
ALTER TABLE public.perfiles_padres ADD COLUMN IF NOT EXISTS colegio_id uuid REFERENCES public.colegios(id);
ALTER TABLE public.perfiles_padres ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;
ALTER TABLE public.platos ADD COLUMN IF NOT EXISTS colegio_id uuid REFERENCES public.colegios(id);
ALTER TABLE public.platos ADD COLUMN IF NOT EXISTS tipo_original text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS colegio_id uuid REFERENCES public.colegios(id);
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS padre_nombre text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS hora_entrega text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS request_id uuid UNIQUE;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS entrada_id uuid REFERENCES public.platos(id) ON DELETE SET NULL;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS segundo_id uuid REFERENCES public.platos(id) ON DELETE SET NULL;
ALTER TABLE public.pedidos ALTER COLUMN codigo_pedido TYPE varchar(64);
ALTER TABLE public.perfiles_padres ALTER COLUMN dni TYPE varchar(40);

-- No escoger arbitrariamente una sede cuando hay nombres duplicados.
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.colegios WHERE eliminado_at IS NULL GROUP BY lower(btrim(nombre)) HAVING count(*)>1) THEN
  RAISE EXCEPTION 'Hay colegios con nombres duplicados. Resolverlos antes de aplicar la migración.';
 END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS colegios_nombre_activo_unico ON public.colegios(lower(btrim(nombre))) WHERE eliminado_at IS NULL;
UPDATE public.hijos h SET colegio_id=c.id FROM public.colegios c WHERE h.colegio_id IS NULL AND lower(btrim(h.colegio_nombre))=lower(btrim(c.nombre));
UPDATE public.pedidos p SET colegio_id=c.id FROM public.colegios c WHERE p.colegio_id IS NULL AND lower(btrim(p.colegio_nombre))=lower(btrim(c.nombre));
UPDATE public.platos p SET colegio_id=c.id FROM public.colegios c WHERE p.colegio_id IS NULL AND (
 substring(p.descripcion from '\[ColegioId:\s*([^\]]+)\]')=c.id::text OR
 lower(btrim(substring(p.descripcion from '\[Colegio:\s*([^\]]+)\]')))=lower(btrim(c.nombre)));
UPDATE public.platos SET tipo_original=coalesce(substring(descripcion from '\[TipoOriginal:\s*([^\]]+)\]'),tipo) WHERE tipo_original IS NULL;
UPDATE public.pedidos SET padre_nombre=substring(observacion from '\[Padre:\s*([^\]]+)\]') WHERE padre_nombre IS NULL;
UPDATE public.pedidos SET hora_entrega=substring(observacion from '\[Entregado:\s*([^\]]+)\]') WHERE hora_entrega IS NULL;
-- Mantener los textos originales para auditoría. La UI los limpia al leer.
UPDATE public.perfiles_padres p SET colegio_id=c.id FROM public.colegios c
 WHERE p.rol='ADMIN' AND p.colegio_id IS NULL AND btrim(regexp_replace(coalesce(c.sede,''),'^.*\|',''))=p.dni;
CREATE TABLE IF NOT EXISTS public.configuracion_sistema (
 id integer PRIMARY KEY CHECK(id=1), datos jsonb NOT NULL DEFAULT '{"grados":[],"observaciones":[]}'::jsonb
);
INSERT INTO public.configuracion_sistema(id) VALUES(1) ON CONFLICT DO NOTHING;
DO $$ DECLARE r record; cfg jsonb; entry record; BEGIN
 FOR r IN SELECT mensaje_aviso FROM public.menus_dia WHERE dia_semana='SABADO' ORDER BY created_at LOOP
  BEGIN cfg:=r.mensaje_aviso::jsonb; EXCEPTION WHEN invalid_text_representation THEN CONTINUE; END;
  IF jsonb_typeof(cfg) <> 'object' THEN CONTINUE; END IF;
  UPDATE public.configuracion_sistema SET datos=datos || (cfg-'adminsColegio') WHERE id=1;
  IF jsonb_typeof(cfg->'adminsColegio')='object' THEN
   FOR entry IN SELECT key,value FROM jsonb_each(cfg->'adminsColegio') LOOP
    UPDATE public.perfiles_padres p SET colegio_id=c.id FROM public.colegios c
     WHERE p.colegio_id IS NULL AND p.rol='ADMIN' AND p.dni=entry.value->>'dni' AND c.nombre=entry.key;
   END LOOP;
  END IF;
 END LOOP;
END $$;
-- Padres y admins sin vínculo inequívoco no reciben permisos globales por defecto.
UPDATE public.perfiles_padres SET activo=false WHERE rol='ADMIN' AND colegio_id IS NULL;
INSERT INTO public.menus_dia(dia_semana,activo,hora_cierre)
 SELECT d,true,'09:30'::time FROM unnest(ARRAY['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES']) d
 WHERE NOT EXISTS(SELECT 1 FROM public.menus_dia m WHERE m.dia_semana=d);
CREATE INDEX IF NOT EXISTS pedidos_colegio_fecha_idx ON public.pedidos(colegio_id,fecha);
CREATE INDEX IF NOT EXISTS pedidos_padre_idx ON public.pedidos(padre_id);
CREATE INDEX IF NOT EXISTS hijos_padre_idx ON public.hijos(padre_id);
CREATE INDEX IF NOT EXISTS platos_colegio_dia_idx ON public.platos(colegio_id,dia_semana);

-- Helpers SECURITY DEFINER de solo lectura para evitar recursión en las políticas.
CREATE OR REPLACE FUNCTION public.mi_perfil_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT id FROM public.perfiles_padres WHERE auth_user_id=auth.uid() AND activo LIMIT 1
$$;
CREATE OR REPLACE FUNCTION public.es_superadmin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT EXISTS(SELECT 1 FROM public.perfiles_padres WHERE auth_user_id=auth.uid() AND activo AND rol='SUPER_ADMIN')
$$;
CREATE OR REPLACE FUNCTION public.admin_de_colegio(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT public.es_superadmin() OR EXISTS(SELECT 1 FROM public.perfiles_padres p JOIN public.colegios c ON c.id=p.colegio_id
 WHERE p.auth_user_id=auth.uid() AND p.activo AND p.rol='ADMIN' AND p.colegio_id=p_id AND c.activo AND c.eliminado_at IS NULL)
$$;
CREATE OR REPLACE FUNCTION public.puede_leer_perfil(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT public.es_superadmin() OR p_id=public.mi_perfil_id() OR EXISTS(SELECT 1 FROM public.hijos h WHERE h.padre_id=p_id AND public.admin_de_colegio(h.colegio_id))
$$;
CREATE OR REPLACE FUNCTION public.puede_ver_colegio(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT public.es_superadmin() OR EXISTS(SELECT 1 FROM public.colegios c WHERE c.id=p_id AND c.activo AND c.eliminado_at IS NULL)
 OR EXISTS(SELECT 1 FROM public.hijos h WHERE h.colegio_id=p_id AND h.padre_id=public.mi_perfil_id())
 OR EXISTS(SELECT 1 FROM public.pedidos p WHERE p.colegio_id=p_id AND p.padre_id=public.mi_perfil_id())
$$;

-- Eliminar también las políticas amplias heredadas; las nuevas políticas son la única fuente.
DO $$ DECLARE p record; BEGIN
 FOR p IN SELECT schemaname,tablename,policyname FROM pg_policies WHERE schemaname='public'
 AND tablename IN ('colegios','perfiles_padres','hijos','menus_dia','platos','pedidos','configuracion_sistema') LOOP
  EXECUTE format('DROP POLICY %I ON %I.%I',p.policyname,p.schemaname,p.tablename);
 END LOOP;
END $$;
ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colegios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_padres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus_dia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.colegios,public.perfiles_padres,public.hijos,public.menus_dia,public.platos,public.pedidos,public.configuracion_sistema FROM anon,authenticated;
GRANT SELECT ON public.colegios,public.menus_dia,public.platos,public.configuracion_sistema TO anon,authenticated;
GRANT SELECT ON public.pedidos,public.hijos TO authenticated;
GRANT SELECT(id,auth_user_id,nombre_completo,dni,telefono,email,rol,colegio_id,activo,created_at) ON public.perfiles_padres TO authenticated;
GRANT INSERT,DELETE ON public.hijos,public.platos TO authenticated;
GRANT ALL ON public.colegios,public.perfiles_padres,public.hijos,public.menus_dia,public.platos,public.pedidos,public.configuracion_sistema TO service_role;
CREATE POLICY colegios_lectura ON public.colegios FOR SELECT TO anon,authenticated USING(public.puede_ver_colegio(id));
CREATE POLICY perfil_lectura ON public.perfiles_padres FOR SELECT TO authenticated USING(auth_user_id=auth.uid() OR public.puede_leer_perfil(id));
CREATE POLICY hijos_lectura ON public.hijos FOR SELECT TO authenticated USING(padre_id=public.mi_perfil_id() OR public.admin_de_colegio(colegio_id));
CREATE POLICY hijos_alta ON public.hijos FOR INSERT TO authenticated WITH CHECK(padre_id=public.mi_perfil_id()
 AND EXISTS(SELECT 1 FROM public.perfiles_padres p WHERE p.id=padre_id AND p.rol='PADRE')
 AND EXISTS(SELECT 1 FROM public.colegios c WHERE c.id=colegio_id AND c.activo AND c.eliminado_at IS NULL));
CREATE POLICY hijos_baja ON public.hijos FOR DELETE TO authenticated USING(padre_id=public.mi_perfil_id());
CREATE POLICY menus_lectura ON public.menus_dia FOR SELECT TO anon,authenticated USING(dia_semana<>'SABADO');
CREATE POLICY config_lectura ON public.configuracion_sistema FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY platos_publicos ON public.platos FOR SELECT TO anon USING(disponible AND EXISTS(SELECT 1 FROM public.colegios c WHERE c.id=colegio_id AND c.activo AND c.eliminado_at IS NULL));
CREATE POLICY platos_lectura ON public.platos FOR SELECT TO authenticated USING(public.admin_de_colegio(colegio_id) OR
 (disponible AND EXISTS(SELECT 1 FROM public.perfiles_padres p WHERE p.id=public.mi_perfil_id() AND p.rol='PADRE')
 AND EXISTS(SELECT 1 FROM public.colegios c WHERE c.id=colegio_id AND c.activo AND c.eliminado_at IS NULL)));
CREATE POLICY platos_alta ON public.platos FOR INSERT TO authenticated WITH CHECK(public.admin_de_colegio(colegio_id) AND colegio_id IS NOT NULL AND precio>=0);
CREATE POLICY platos_baja ON public.platos FOR DELETE TO authenticated USING(public.admin_de_colegio(colegio_id));
CREATE POLICY pedidos_lectura ON public.pedidos FOR SELECT TO authenticated USING(padre_id=public.mi_perfil_id() OR public.admin_de_colegio(colegio_id));

CREATE OR REPLACE FUNCTION public.crear_pedido(p_hijo_id uuid,p_entrada_id uuid,p_segundo_id uuid,p_fecha date,p_metodo_pago text,p_observacion text,p_comprobante text,p_request_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE h public.hijos; padre public.perfiles_padres; c public.colegios; e public.platos; s public.platos; m public.menus_dia; result public.pedidos;
 hoy date := (now() AT TIME ZONE 'America/Lima')::date; dia text; notas text;
BEGIN
 SELECT * INTO padre FROM public.perfiles_padres WHERE id=public.mi_perfil_id() AND rol='PADRE';
 IF padre.id IS NULL THEN RAISE EXCEPTION 'Inicia sesión como padre'; END IF;
 IF p_request_id IS NULL THEN RAISE EXCEPTION 'Falta identificador de solicitud'; END IF;
 -- Serializar reintentos: una misma intención de compra nunca genera dos pedidos.
 PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 SELECT * INTO result FROM public.pedidos WHERE request_id=p_request_id AND padre_id=padre.id;
 IF FOUND THEN RETURN to_jsonb(result); END IF;
 IF p_fecha IS NULL OR p_fecha<hoy OR p_fecha>date_trunc('week',hoy)::date+4 OR extract(isodow FROM p_fecha)>5 THEN
  RAISE EXCEPTION 'Solo se puede reservar hoy o los siguientes días de esta semana'; END IF;
 dia:=(ARRAY['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'])[extract(isodow FROM p_fecha)::integer];
 SELECT * INTO m FROM public.menus_dia WHERE dia_semana=dia ORDER BY created_at DESC,id LIMIT 1;
 IF m.id IS NULL OR NOT m.activo OR (p_fecha=hoy AND (now() AT TIME ZONE 'America/Lima')::time>=m.hora_cierre) THEN
  RAISE EXCEPTION 'El horario de pedidos para ese día está cerrado'; END IF;
 SELECT * INTO h FROM public.hijos WHERE id=p_hijo_id AND padre_id=padre.id FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'El estudiante no pertenece a tu cuenta'; END IF;
 SELECT * INTO c FROM public.colegios WHERE id=h.colegio_id AND activo AND eliminado_at IS NULL FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'El colegio no está disponible'; END IF;
 SELECT * INTO e FROM public.platos WHERE id=p_entrada_id AND colegio_id=c.id AND dia_semana=dia AND disponible FOR SHARE;
 IF NOT FOUND OR e.tipo NOT IN ('ENTRADA','POSTRE') THEN RAISE EXCEPTION 'Selecciona una entrada disponible'; END IF;
 SELECT * INTO s FROM public.platos WHERE id=p_segundo_id AND colegio_id=c.id AND dia_semana=dia AND disponible FOR SHARE;
 IF NOT FOUND OR s.tipo<>'SEGUNDO' THEN RAISE EXCEPTION 'Selecciona un segundo disponible'; END IF;
 IF p_metodo_pago IS NULL OR p_metodo_pago NOT IN ('Yape','Plin','Pagar luego','Efectivo','Mensual') THEN RAISE EXCEPTION 'Método de pago inválido'; END IF;
 IF e.precio IS NULL OR s.precio IS NULL OR e.precio<0 OR s.precio<0 THEN RAISE EXCEPTION 'El menú tiene un precio inválido'; END IF;
 IF length(coalesce(p_comprobante,''))>400000 THEN RAISE EXCEPTION 'El comprobante excede el tamaño permitido'; END IF;
 IF p_comprobante IS NOT NULL AND p_comprobante !~ '^data:image/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$' THEN RAISE EXCEPTION 'Comprobante inválido'; END IF;
 notas:=nullif(btrim(concat_ws(' • ',nullif(btrim(p_observacion),''),CASE WHEN nullif(btrim(h.alergias_notas),'') IS NOT NULL THEN 'Alergias: '||h.alergias_notas END)), '');
 INSERT INTO public.pedidos(codigo_pedido,request_id,fecha,dia_semana,padre_id,padre_nombre,hijo_id,colegio_id,colegio_nombre,grado_seccion,estudiante_nombre,telefono_contacto,
 entrada_id,segundo_id,entrada_nombre,segundo_nombre,observacion,metodo_pago,estado_pago,estado_pedido,comprobante_url,monto)
 VALUES('ALM-'||gen_random_uuid()::text,p_request_id,p_fecha,dia,padre.id,padre.nombre_completo,h.id,c.id,c.nombre,h.grado_seccion,h.nombre_completo,padre.telefono,
 e.id,s.id,e.nombre,s.nombre,notas,p_metodo_pago,CASE WHEN p_comprobante IS NOT NULL AND p_metodo_pago IN ('Yape','Plin') THEN 'VERIFICANDO' ELSE 'PENDIENTE' END,'REGISTRADO',
 CASE WHEN p_metodo_pago IN ('Yape','Plin') THEN p_comprobante END,e.precio+s.precio) RETURNING * INTO result;
 RETURN to_jsonb(result);
END $$;

CREATE OR REPLACE FUNCTION public.actualizar_pedido(p_id uuid,p_estado text,p_pago text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE p public.pedidos; BEGIN
 SELECT * INTO p FROM public.pedidos WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR NOT public.admin_de_colegio(p.colegio_id) THEN RAISE EXCEPTION 'Pedido no disponible'; END IF;
 IF p_estado IS NOT NULL AND p_estado NOT IN ('REGISTRADO','EN_COCINA','EMPACADO','ENTREGADO') THEN RAISE EXCEPTION 'Estado inválido'; END IF;
 IF p_pago IS NOT NULL AND p_pago NOT IN ('PENDIENTE','VERIFICANDO','PAGADO') THEN RAISE EXCEPTION 'Pago inválido'; END IF;
 IF p.estado_pedido='ENTREGADO' AND p.estado_pago='PAGADO' AND p_pago IS NOT NULL AND p_pago<>'PAGADO' THEN RAISE EXCEPTION 'No se puede revertir el pago de una entrega'; END IF;
 IF coalesce(p_estado,p.estado_pedido)='ENTREGADO' AND p.metodo_pago IN ('Yape','Plin') AND coalesce(p_pago,p.estado_pago)<>'PAGADO' THEN RAISE EXCEPTION 'Confirma el pago antes de entregar'; END IF;
 UPDATE public.pedidos SET estado_pedido=coalesce(p_estado,estado_pedido),estado_pago=coalesce(p_pago,estado_pago),
 hora_entrega=CASE WHEN p_estado IS NULL THEN hora_entrega WHEN p_estado='ENTREGADO' THEN coalesce(hora_entrega,to_char(now() AT TIME ZONE 'America/Lima','HH24:MI')) ELSE NULL END WHERE id=p_id;
 -- observacion nunca se modifica al entregar o cobrar.
END $$;
CREATE OR REPLACE FUNCTION public.liquidar_pedidos(p_ids uuid[]) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE n integer; requested integer; BEGIN
 SELECT count(DISTINCT x) INTO requested FROM unnest(p_ids) x;
 IF requested=0 OR requested IS NULL THEN RAISE EXCEPTION 'Selecciona pedidos pendientes'; END IF;
 PERFORM 1 FROM public.pedidos WHERE id=ANY(p_ids) ORDER BY id FOR UPDATE;
 SELECT count(*) INTO n FROM public.pedidos WHERE id=ANY(p_ids) AND public.admin_de_colegio(colegio_id) AND metodo_pago IN ('Pagar luego','Efectivo','Mensual');
 IF n<>requested THEN RAISE EXCEPTION 'Hay pedidos sin autorización o que no son fiados'; END IF;
 UPDATE public.pedidos SET estado_pago='PAGADO' WHERE id=ANY(p_ids) AND estado_pago<>'PAGADO';
 GET DIAGNOSTICS n=ROW_COUNT; RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.guardar_colegio_admin(p_colegio_id uuid,p_nombre text,p_sede text,p_activo boolean,p_auth_id uuid,p_dni text,p_admin_nombre text,p_email text,p_telefono text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE col_id uuid:=p_colegio_id; previous public.perfiles_padres; BEGIN
 IF NOT public.es_superadmin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
 IF nullif(btrim(p_nombre),'') IS NULL OR nullif(btrim(p_dni),'') IS NULL OR nullif(btrim(p_admin_nombre),'') IS NULL THEN RAISE EXCEPTION 'Completa los datos'; END IF;
 IF col_id IS NULL THEN
  INSERT INTO public.colegios(nombre,sede,activo) VALUES(btrim(p_nombre),p_sede,coalesce(p_activo,true)) RETURNING id INTO col_id;
 ELSE
  PERFORM 1 FROM public.colegios WHERE id=col_id AND eliminado_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Colegio no disponible'; END IF;
  UPDATE public.colegios SET nombre=btrim(p_nombre),sede=p_sede,activo=coalesce(p_activo,true) WHERE id=col_id;
 END IF;
 SELECT * INTO previous FROM public.perfiles_padres WHERE dni=p_dni FOR UPDATE;
 IF FOUND AND (previous.rol<>'ADMIN' OR previous.colegio_id IS DISTINCT FROM col_id OR previous.auth_user_id IS DISTINCT FROM p_auth_id) THEN
  RAISE EXCEPTION 'El usuario ya pertenece a otra cuenta'; END IF;
 -- Deshabilitar al anterior sin borrar su identidad/histórico. RLS consulta activo en cada operación.
 UPDATE public.perfiles_padres SET activo=false WHERE colegio_id=col_id AND rol='ADMIN' AND dni<>p_dni;
 INSERT INTO public.perfiles_padres(auth_user_id,nombre_completo,dni,email,telefono,rol,colegio_id,activo)
 VALUES(p_auth_id,p_admin_nombre,p_dni,p_email,p_telefono,'ADMIN',col_id,true)
 ON CONFLICT(dni) DO UPDATE SET nombre_completo=excluded.nombre_completo,email=excluded.email,telefono=excluded.telefono,activo=true;
 -- Nombres de hijos son presentación actual; pedidos mantienen su snapshot histórico. Las consultas usan colegio_id.
 UPDATE public.hijos SET colegio_nombre=btrim(p_nombre) WHERE colegio_id=col_id;
 RETURN col_id;
END $$;
CREATE OR REPLACE FUNCTION public.archivar_colegio(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 IF NOT public.es_superadmin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
 UPDATE public.colegios SET activo=false,eliminado_at=now() WHERE id=p_id AND eliminado_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Colegio no disponible'; END IF;
 UPDATE public.perfiles_padres SET activo=false WHERE colegio_id=p_id AND rol='ADMIN';
END $$;
CREATE OR REPLACE FUNCTION public.cambiar_estado_colegio(p_id uuid,p_activo boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 IF NOT public.es_superadmin() THEN RAISE EXCEPTION 'No autorizado'; END IF;
 UPDATE public.colegios SET activo=p_activo WHERE id=p_id AND eliminado_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Colegio no disponible'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.actualizar_configuracion(p_grados jsonb,p_observaciones jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 IF NOT public.es_superadmin() THEN RAISE EXCEPTION 'Solo el superadministrador configura las listas compartidas'; END IF;
 IF (p_grados IS NOT NULL AND jsonb_typeof(p_grados)<>'array') OR (p_observaciones IS NOT NULL AND jsonb_typeof(p_observaciones)<>'array') THEN RAISE EXCEPTION 'Configuración inválida'; END IF;
 INSERT INTO public.configuracion_sistema(id) VALUES(1) ON CONFLICT DO NOTHING;
 UPDATE public.configuracion_sistema SET datos=datos ||
 CASE WHEN p_grados IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('grados',p_grados) END ||
 CASE WHEN p_observaciones IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('observaciones',p_observaciones) END WHERE id=1;
END $$;
CREATE OR REPLACE FUNCTION public.editar_lista_configuracion(p_lista text,p_valor text,p_eliminar boolean) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE cfg jsonb; items jsonb; BEGIN
 IF NOT public.es_superadmin() THEN RAISE EXCEPTION 'Solo el superadministrador configura las listas compartidas'; END IF;
 IF p_lista NOT IN ('grados','observaciones') OR nullif(btrim(p_valor),'') IS NULL THEN RAISE EXCEPTION 'Valor inválido'; END IF;
 INSERT INTO public.configuracion_sistema(id) VALUES(1) ON CONFLICT DO NOTHING;
 SELECT datos INTO cfg FROM public.configuracion_sistema WHERE id=1 FOR UPDATE;
 SELECT coalesce(jsonb_agg(value),'[]'::jsonb) INTO items FROM jsonb_array_elements_text(coalesce(cfg->p_lista,'[]'::jsonb)) value
 WHERE NOT p_eliminar OR lower(value)<>lower(btrim(p_valor));
 IF NOT p_eliminar AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(items) v WHERE lower(v)=lower(btrim(p_valor))) THEN items:=items || jsonb_build_array(btrim(p_valor)); END IF;
 UPDATE public.configuracion_sistema SET datos=jsonb_set(cfg,ARRAY[p_lista],items) WHERE id=1;
 RETURN items;
END $$;

-- Evitar exposición por EXECUTE implícito a PUBLIC.
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('mi_perfil_id','es_superadmin','admin_de_colegio','puede_leer_perfil','puede_ver_colegio','crear_pedido','actualizar_pedido','liquidar_pedidos','guardar_colegio_admin','archivar_colegio','cambiar_estado_colegio','actualizar_configuracion','editar_lista_configuracion') LOOP
 EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated',f.signature);
 EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated,service_role',f.signature);
 END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.puede_ver_colegio(uuid),public.mi_perfil_id(),public.es_superadmin() TO anon;

-- Realtime: agregar solo tablas ausentes, sin fallar al reaplicar.
DO $$ DECLARE t text; BEGIN
 IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
  FOREACH t IN ARRAY ARRAY['pedidos','platos','colegios','hijos','perfiles_padres','configuracion_sistema','menus_dia'] LOOP
   IF NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
    EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',t);
   END IF;
  END LOOP;
 END IF;
END $$;
-- Los comprobantes actuales son datos del pedido protegidos por RLS. Cerrar el bucket antiguo si existe.
DO $$ BEGIN
 IF to_regclass('storage.buckets') IS NOT NULL THEN
  UPDATE storage.buckets SET public=false WHERE id='comprobantes';
 END IF;
 IF to_regclass('storage.objects') IS NOT NULL THEN
  DROP POLICY IF EXISTS "Acceso publico comprobantes" ON storage.objects;
  DROP POLICY IF EXISTS "Permitir subida comprobantes" ON storage.objects;
  DROP POLICY IF EXISTS "Permitir subida platos" ON storage.objects;
 END IF;
END $$;
COMMIT;
