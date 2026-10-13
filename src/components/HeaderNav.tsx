'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  ChefHat,
  PackageCheck,
  Settings,
  Sparkles,
  GraduationCap,
  LogOut,
  LogIn,
  ShieldCheck,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, esAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const adminNavItems = [
    { href: '/admin', label: 'Admin', icon: BarChart3 },
    { href: '/despacho', label: 'Despacho', icon: PackageCheck },
    { href: '/cocina', label: 'Cocina', icon: ChefHat },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md bg-white/90">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca (Siempre visible) */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-800 hover:opacity-90 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base tracking-tight font-black text-slate-900 block leading-none">
                Placeres Culinarios
              </span>
            </div>
          </Link>

          {/* Menú Operativo (SOLO VISIBLE PARA ADMINISTRADORES) */}
          {esAdmin && (
            <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-100 px-2 py-0.5 rounded-lg mr-1 hidden sm:inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Área de Usuario / Autenticación */}
          <div className="flex items-center gap-2">
            {usuario ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Si es Padre, muestra accesos a "Mis Pedidos" y "Mis Hijos" */}
                {!esAdmin && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Link
                      href="/pedidos"
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        pathname === '/pedidos'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Historial de Pedidos"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="hidden sm:inline">Mis Pedidos</span>
                    </Link>

                    <Link
                      href="/hijos"
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        pathname === '/hijos'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Gestionar mis hijos"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="hidden sm:inline">Hijos</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-black">
                        {usuario.hijos.length}
                      </span>
                    </Link>
                  </div>
                )}

                {/* Si es Admin, muestra indicador de Admin */}
                {esAdmin && (
                  <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                    Admin ({usuario.nombreCompleto.split(' ')[0]})
                  </span>
                )}

                {/* Botón Cerrar Sesión */}
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
