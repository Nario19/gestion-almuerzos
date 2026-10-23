'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  GraduationCap,
  ShoppingBag,
  UtensilsCrossed,
  LogOut,
  Phone,
  CreditCard,
  Building2,
  ChevronRight,
  ShieldCheck,
  Receipt,
  Plus,
  LogIn,
  Pencil,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SkeletonPerfilPage } from '@/components/Skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PerfilPage() {
  const router = useRouter();
  const { usuario, cargando, esAdmin, esSuperAdmin, logout, actualizarPerfil } = useAuth();

  const [modalEditar, setModalEditar] = useState(false);
  const [nombreForm, setNombreForm] = useState('');
  const [telefonoForm, setTelefonoForm] = useState('');
  const [dniForm, setDniForm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setNombreForm(usuario.nombreCompleto || '');
      setTelefonoForm(usuario.telefono || '');
      setDniForm(usuario.dni || '');
    }
  }, [usuario]);

  const handleCerrarSesion = () => {
    logout();
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);
    setGuardando(true);
    try {
      const res = await actualizarPerfil({
        nombreCompleto: nombreForm,
        telefono: telefonoForm,
        dni: dniForm,
      });
      if (res.ok) {
        setMensajeExito('¡Tus datos han sido actualizados con éxito!');
        setModalEditar(false);
        setTimeout(() => setMensajeExito(null), 3500);
      } else {
        setMensajeError(res.error || 'Ocurrió un error al actualizar tus datos.');
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <SkeletonPerfilPage />;
  }

  // Si no está autenticado
  if (!usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 space-y-6">
        <Card className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="sr-only">Mi Perfil</h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Inicia sesión o regístrate para acceder al historial de pedidos, registrar a tus hijos y disfrutar de una experiencia ágil.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión / Registrarme</span>
            </Link>
          </div>
        </Card>

        {/* Accesos rápidos */}
        <Card className="p-4 space-y-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Accesos directos
          </h2>
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-900 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900">Ver Menú del Día</h3>
                  <p className="text-[11px] text-zinc-500">Revisa los platos escolares de hoy</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Vista para Administradores
  if (esAdmin || esSuperAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 space-y-6">
        <Card className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="outline" className="text-[10px] font-semibold text-zinc-800 bg-zinc-100 border-zinc-200">
              {esSuperAdmin ? 'Super Administrador' : 'Administrador de Colegio'}
            </Badge>
            <h1 className="text-lg font-bold text-zinc-950 mt-2">
              {usuario.nombreCompleto}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">DNI: {usuario.dni}</p>
            {usuario.colegioNombre && (
              <p className="text-xs font-semibold text-zinc-800 mt-1">
                Colegio: {usuario.colegioNombre}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/admin"
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2"
            >
              Panel de Administración
            </Link>
            <Button
              variant="outline"
              onClick={handleCerrarSesion}
              className="w-full text-zinc-700 hover:text-rose-600 hover:bg-zinc-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Vista para Padres de Familia
  const iniciales = usuario.nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const cantidadHijos = usuario.hijos?.length || 0;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-200">
      <h1 className="sr-only">Mi Perfil</h1>

      {/* Banner de Éxito al actualizar */}
      {mensajeExito && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* TARJETA PRINCIPAL DEL APODERADO */}
      <Card className="p-5 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#010101] text-yellow-400 flex items-center justify-center font-black text-base shadow-xs shrink-0">
              {iniciales || <User className="w-6 h-6 text-yellow-400" />}
            </div>
            <div className="min-w-0">
              <Badge variant="outline" className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 border-zinc-200">
                Apoderado
              </Badge>
              <h2 className="text-base font-bold text-zinc-950 truncate mt-1">
                {usuario.nombreCompleto}
              </h2>
              <p className="text-xs text-zinc-500">Cuenta de Padre de Familia</p>
            </div>
          </div>

          {/* Botón Editar Datos */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setNombreForm(usuario.nombreCompleto || '');
              setTelefonoForm(usuario.telefono || '');
              setDniForm(usuario.dni || '');
              setMensajeError(null);
              setModalEditar(true);
            }}
            title="Editar mis datos"
            className="shrink-0"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            <span>Editar</span>
          </Button>
        </div>

        {/* Datos de contacto */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 pt-4 border-t border-zinc-100 text-xs">
          <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 block">DNI</span>
              <span className="font-semibold text-zinc-900 truncate block">
                {usuario.dni || 'No registrado'}
              </span>
            </div>
          </div>
          <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-medium text-zinc-500 block">Teléfono</span>
              <span className="font-semibold text-zinc-900 truncate block">
                {usuario.telefono || 'No registrado'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* SECCIÓN: MIS HIJOS */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-zinc-700" />
            <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
              Mis Hijos ({cantidadHijos})
            </h2>
          </div>
          <Link
            href="/padres/hijos"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-0.5"
          >
            Gestionar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {cantidadHijos === 0 ? (
          <div className="bg-zinc-50 rounded-lg p-4 text-center border border-dashed border-zinc-200 space-y-2">
            <p className="text-xs font-medium text-zinc-600">
              Aún no tienes hijos registrados en tu cuenta.
            </p>
            <Link
              href="/padres/hijos"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar Hijo
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {usuario.hijos.map((hijo) => (
              <div
                key={hijo.id}
                className="p-2.5 bg-zinc-50 hover:bg-zinc-100/70 rounded-lg border border-zinc-200/80 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-zinc-950 truncate">
                    {hijo.nombreCompleto}
                  </h3>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{hijo.colegioNombre}</span> •{' '}
                    <span className="text-zinc-900 font-semibold">{hijo.gradoSeccion}</span>
                  </p>
                  {hijo.alergiasNotas && (
                    <p className="text-[10px] text-rose-600 font-medium mt-0.5 truncate">
                      Obs: {hijo.alergiasNotas}
                    </p>
                  )}
                </div>
                <div className="w-7 h-7 rounded-md bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {hijo.nombreCompleto.charAt(0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECCIÓN: ACCESOS RÁPIDOS MÓVILES */}
      <Card className="p-4 space-y-2">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
          Navegación Rápida
        </h2>

        <Link
          href="/"
          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-900 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900">Pedir Menú del Día</h3>
              <p className="text-[11px] text-zinc-500">Ver platos disponibles y pedir almuerzo</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        <Link
          href="/padres/pedidos"
          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-900 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900">Mis Pedidos</h3>
              <p className="text-[11px] text-zinc-500">Historial y estado de entrega de almuerzos</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        <Link
          href="/padres/deudas"
          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-900 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900">Mis Deudas y Fiados</h3>
              <p className="text-[11px] text-zinc-500">Consulta saldos pendientes y estados de liquidación</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        <Link
          href="/padres/hijos"
          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-900 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900">Mis Hijos</h3>
              <p className="text-[11px] text-zinc-500">Registrar y actualizar datos de tus hijos</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        <Link
          href="/padres/privacidad"
          className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-900 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-900">Política de Privacidad</h3>
              <p className="text-[11px] text-zinc-500">Protección de datos personales de menores</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>
      </Card>

      {/* CERRAR SESIÓN */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={handleCerrarSesion}
          className="w-full text-zinc-700 hover:text-rose-600 hover:bg-zinc-50 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>

      {/* MODAL PARA EDITAR DATOS DEL PERFIL */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950">
                  Editar Mis Datos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEditar(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mensajeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mensajeError}</span>
              </div>
            )}

            <form onSubmit={handleGuardarPerfil} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Nombres y Apellidos *
                </label>
                <input
                  type="text"
                  value={nombreForm}
                  onChange={(e) => setNombreForm(e.target.value)}
                  required
                  placeholder="Tu nombre completo"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={telefonoForm}
                  onChange={(e) => setTelefonoForm(e.target.value)}
                  required
                  placeholder="Ej. 999888777"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  DNI *
                </label>
                <input
                  type="text"
                  value={dniForm}
                  onChange={(e) => setDniForm(e.target.value)}
                  required
                  maxLength={8}
                  placeholder="DNI de 8 dígitos"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalEditar(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardando}
                  size="sm"
                  className="flex items-center gap-1.5 bg-[#010101] hover:bg-zinc-800 text-yellow-400 font-bold"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
