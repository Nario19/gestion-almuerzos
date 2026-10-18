'use client';

import React from 'react';
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
  Plus,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function PerfilPage() {
  const router = useRouter();
  const { usuario, cargando, esAdmin, esSuperAdmin, logout } = useAuth();

  const handleCerrarSesion = () => {
    logout();
    router.push('/login');
  };

  if (cargando) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Cargando perfil...</p>
      </div>
    );
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
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Mi Perfil
            </h1>
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
      {/* TARJETA PRINCIPAL DEL APODERADO */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/60 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center gap-4 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/20 shrink-0">
            {iniciales || <User className="w-7 h-7" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              Apoderado
            </span>
            <h1 className="text-base sm:text-lg font-black text-slate-900 truncate mt-1">
              {usuario.nombreCompleto}
            </h1>
            <p className="text-xs text-slate-500">Cuenta de Padre de Familia</p>
          </div>
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
            href="/hijos"
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
              href="/hijos"
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
          href="/pedidos"
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
          href="/hijos"
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
    </div>
  );
}
