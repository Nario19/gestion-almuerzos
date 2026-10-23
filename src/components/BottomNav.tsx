'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  ShoppingBag,
  GraduationCap,
  User,
  Receipt,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { usuario, esAdmin, esSuperAdmin } = useAuth();

  // El navbar inferior móvil tipo app es EXCLUSIVO para cuando el usuario ha iniciado sesión como PADRE
  // No debe aparecer si no está autenticado (visitantes) ni para administradores
  if (!usuario || esAdmin || esSuperAdmin || usuario.rol !== 'PADRE') {
    return null;
  }

  const cantidadHijos = usuario?.hijos?.length || 0;

  return (
    <nav
      aria-label="Navegación Móvil para Padres"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Pestaña: Pedidos */}
        <Link
          href="/padres/pedidos"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            pathname === '/padres/pedidos' || pathname === '/pedidos'
              ? 'text-zinc-950 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Pedidos</span>
        </Link>

        {/* Pestaña: Deudas / Fiados */}
        <Link
          href="/padres/deudas"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            pathname === '/padres/deudas' || pathname === '/deudas'
              ? 'text-zinc-950 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 font-medium'
          }`}
        >
          <div className="relative">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Deudas</span>
        </Link>

        {/* Pestaña Central Prominente: Pedir Menú */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Link
            href="/"
            aria-label="Pedir Menú"
            className={`-mt-6 w-13 h-13 rounded-full bg-zinc-950 text-white flex flex-col items-center justify-center shadow-lg border-4 border-white active:scale-95 hover:scale-105 transition-all ${
              pathname === '/' || pathname === '/padres' ? 'ring-2 ring-zinc-900 ring-offset-2' : ''
            }`}
          >
            <UtensilsCrossed className="w-6 h-6" />
          </Link>
          <span
            className={`text-[10px] mt-1 tracking-tight font-bold ${
              pathname === '/' || pathname === '/padres' ? 'text-zinc-950' : 'text-zinc-500'
            }`}
          >
            Pedir Menú
          </span>
        </div>

        {/* Pestaña: Hijos */}
        <Link
          href="/padres/hijos"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            pathname === '/padres/hijos' || pathname === '/hijos'
              ? 'text-zinc-950 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 font-medium'
          }`}
        >
          <div className="relative">
            <GraduationCap className="w-5 h-5" />
            {cantidadHijos > 0 && (
              <span className="absolute -top-1 -right-2 bg-zinc-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cantidadHijos}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Hijos</span>
        </Link>

        {/* Pestaña: Perfil */}
        <Link
          href="/padres/perfil"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            pathname === '/padres/perfil' || pathname === '/perfil'
              ? 'text-zinc-950 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 font-medium'
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
