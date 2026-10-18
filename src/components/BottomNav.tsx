'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  ShoppingBag,
  GraduationCap,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { usuario, esAdmin, esSuperAdmin } = useAuth();

  // El navbar inferior móvil es exclusivo para la experiencia de los padres y usuarios generales
  // Los administradores y superadmin tienen su propia barra de herramientas de gestión arriba
  if (esAdmin || esSuperAdmin) {
    return null;
  }

  const cantidadHijos = usuario?.hijos?.length || 0;

  return (
    <nav
      aria-label="Navegación Móvil para Padres"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Pestaña: Pedidos */}
        <Link
          href="/pedidos"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            pathname === '/pedidos'
              ? 'text-orange-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Pedidos</span>
        </Link>

        {/* Pestaña: Hijos */}
        <Link
          href="/hijos"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            pathname === '/hijos'
              ? 'text-orange-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <GraduationCap className="w-5 h-5" />
            {cantidadHijos > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cantidadHijos}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Hijos</span>
        </Link>

        {/* Pestaña Central Prominente: Pedir Menú */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Link
            href="/"
            aria-label="Pedir Menú"
            className={`-mt-6 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-orange-600 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/40 border-4 border-white active:scale-95 hover:scale-105 transition-all ${
              pathname === '/' ? 'ring-2 ring-orange-400 ring-offset-2' : ''
            }`}
          >
            <UtensilsCrossed className="w-6 h-6 drop-shadow-xs" />
          </Link>
          <span
            className={`text-[10px] mt-1 tracking-tight font-black ${
              pathname === '/' ? 'text-orange-600' : 'text-slate-600'
            }`}
          >
            Pedir Menú
          </span>
        </div>

        {/* Pestaña: Perfil */}
        <Link
          href="/perfil"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            pathname === '/perfil'
              ? 'text-orange-600 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
