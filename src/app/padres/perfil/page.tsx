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
    router.push('/login');
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="sr-only">Mi Perfil</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Inicia sesión o regístrate para acceder al historial de pedidos, registrar a tus hijos y disfrutar de una experiencia ágil.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión / Registrarme</span>
            </Link>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Accesos directos
          </h2>
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Ver Menú del Día</h3>
                  <p className="text-[11px] text-slate-400">Revisa los platos escolares de hoy</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vista para Administradores
  if (esAdmin || esSuperAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {esSuperAdmin ? 'Super Administrador' : 'Administrador de Sede'}
            </span>
            <h1 className="text-lg font-black text-slate-900 mt-2">
              {usuario.nombreCompleto}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">DNI: {usuario.dni}</p>
            {usuario.colegioNombre && (
              <p className="text-xs font-bold text-slate-700 mt-1">
                Sede: {usuario.colegioNombre}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/admin"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2"
            >
              Panel de Administración
            </Link>
            <button
              onClick={handleCerrarSesion}
              className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-xs transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
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
    <div className="max-w-md mx-auto px-4 py-8 space-y-5 animate-in fade-in duration-200">
      {/* Banner de Éxito al actualizar */}
      {mensajeExito && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* TARJETA PRINCIPAL DEL APODERADO */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/60 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/20 shrink-0">
              {iniciales || <User className="w-7 h-7" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Apoderado
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate mt-1">
                {usuario.nombreCompleto}
              </h2>
              <p className="text-xs text-slate-500">Cuenta de Padre de Familia</p>
            </div>
          </div>

          {/* Botón Editar Datos */}
          <button
            type="button"
            onClick={() => {
              setNombreForm(usuario.nombreCompleto || '');
              setTelefonoForm(usuario.telefono || '');
              setDniForm(usuario.dni || '');
              setMensajeError(null);
              setModalEditar(true);
            }}
            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 active:scale-95 text-orange-700 border border-orange-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            title="Editar mis datos"
          >
            <Pencil className="w-3.5 h-3.5 text-orange-600" />
            <span>Editar</span>
          </button>
        </div>

        {/* Datos de contacto */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 block">DNI</span>
              <span className="font-bold text-slate-800 truncate block">
                {usuario.dni || 'No registrado'}
              </span>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-slate-400 block">Teléfono</span>
              <span className="font-bold text-slate-800 truncate block">
                {usuario.telefono || 'No registrado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: MIS HIJOS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-orange-500" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Mis Hijos ({cantidadHijos})
            </h2>
          </div>
          <Link
            href="/padres/hijos"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
          >
            Gestionar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {cantidadHijos === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-4 text-center border border-dashed border-slate-200 space-y-2">
            <p className="text-xs font-medium text-slate-600">
              Aún no tienes hijos registrados en tu cuenta.
            </p>
            <Link
              href="/padres/hijos"
              className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition"
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
                className="p-3 bg-slate-50 hover:bg-orange-50/50 rounded-2xl border border-slate-200/80 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 truncate">
                    {hijo.nombreCompleto}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{hijo.colegioNombre}</span> •{' '}
                    <span className="text-orange-600 font-bold">{hijo.gradoSeccion}</span>
                  </p>
                  {hijo.alergiasNotas && (
                    <p className="text-[10px] text-rose-600 font-medium mt-0.5 truncate">
                      Obs: {hijo.alergiasNotas}
                    </p>
                  )}
                </div>
                <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {hijo.nombreCompleto.charAt(0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN: ACCESOS RÁPIDOS MÓVILES */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2.5">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
          Navegación Rápida
        </h2>

        <Link
          href="/"
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Pedir Menú del Día</h3>
              <p className="text-[11px] text-slate-400">Ver platos disponibles y pedir almuerzo</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/padres/pedidos"
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Mis Pedidos</h3>
              <p className="text-[11px] text-slate-400">Historial y estado de entrega de almuerzos</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/padres/deudas"
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Mis Deudas y Fiados</h3>
              <p className="text-[11px] text-slate-400">Consulta saldos pendientes y estados de liquidación</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/padres/hijos"
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Mis Hijos</h3>
              <p className="text-[11px] text-slate-400">Registrar y actualizar datos de tus hijos</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/padres/privacidad"
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">Política de Privacidad</h3>
              <p className="text-[11px] text-slate-400">Protección de datos personales de menores</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* CERRAR SESIÓN */}
      <div className="pt-2">
        <button
          onClick={handleCerrarSesion}
          className="w-full py-3.5 px-4 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* MODAL PARA EDITAR DATOS DEL PERFIL */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Editar Mis Datos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEditar(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {mensajeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mensajeError}</span>
              </div>
            )}

            <form onSubmit={handleGuardarPerfil} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombres y Apellidos *
                </label>
                <input
                  type="text"
                  value={nombreForm}
                  onChange={(e) => setNombreForm(e.target.value)}
                  required
                  placeholder="Tu nombre completo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  value={telefonoForm}
                  onChange={(e) => setTelefonoForm(e.target.value)}
                  required
                  placeholder="Ej. 999888777"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  DNI *
                </label>
                <input
                  type="text"
                  value={dniForm}
                  onChange={(e) => setDniForm(e.target.value)}
                  required
                  maxLength={8}
                  placeholder="DNI de 8 dígitos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
