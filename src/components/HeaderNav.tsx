'use client';

import { useState } from 'react';
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
  Building2,
  Receipt,
  UserPlus,
  User,
  TrendingUp,
} from 'lucide-react';
import { useAuth, sincronizarCookieSesion } from '@/lib/authContext';
import { obtenerInfoPantalla } from '@/lib/navUtils';
import { esRutaAdministrativa } from '@/lib/navUtils';

const ICONOS_PANTALLA: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  ShoppingBag,
  GraduationCap,
  User,
  LogIn,
  Building2,
  BarChart3,
  ChefHat,
  Receipt,
  PackageCheck,
  ShieldCheck,
};

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, esAdmin, esSuperAdmin, logout } = useAuth();

  const esRutaAdmin = esRutaAdministrativa(pathname);
  const infoPantalla = obtenerInfoPantalla(pathname, !!usuario);
  const IconoPantalla = ICONOS_PANTALLA[infoPantalla.iconoNombre] || UtensilsCrossed;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  const prefix = esSuperAdmin && pathname.startsWith('/superadmin') ? '/superadmin' : '/admin';
  const adminNavItems = [
    ...(esSuperAdmin ? [{ href: '/superadmin', label: 'Colegios', icon: Building2 }] : []),
    { href: prefix === '/superadmin' ? '/superadmin' : '/admin', label: 'Admin', icon: BarChart3 },
    { href: `${prefix}/cocina`, label: 'Cocina', icon: ChefHat },
    { href: `${prefix}/fiado`, label: 'Fiado', icon: Receipt },
    { href: `${prefix}/despacho`, label: 'Despacho', icon: PackageCheck },
    ...(esSuperAdmin
      ? [{ href: '/superadmin/pedido-manual', label: 'Pedido Manual', icon: UtensilsCrossed }]
      : [{ href: '/admin/pedido-manual', label: 'Pedido Manual', icon: UtensilsCrossed }]),
    ...(esSuperAdmin ? [{ href: '/superadmin/analytics', label: 'Analítica', icon: TrendingUp }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md bg-white/90">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Lado Izquierdo del Navbar:
              - En la pantalla pública (sin sesión): El título dice "Placeres Culinarios"
              - En la interfaz del padre: El título de la pantalla sube al navbar
              - En la interfaz de admin y superadmin: YA NO VA EL TÍTULO, se muestra la marca */}
          <Link
            href={esRutaAdmin ? (esSuperAdmin ? '/superadmin' : '/admin') : '/'}
            onPointerDown={() => sincronizarCookieSesion(usuario)}
            onClick={() => sincronizarCookieSesion(usuario)}
            className="flex items-center gap-2.5 font-bold text-slate-800 hover:opacity-90 transition min-w-0"
            title={esRutaAdmin ? 'Ir al Panel' : 'Ir al inicio'}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 shrink-0">
              {esRutaAdmin || !usuario ? <UtensilsCrossed className="w-5 h-5" /> : <IconoPantalla className="w-5 h-5" />}
            </div>
            {esRutaAdmin ? null : (
              <div className="min-w-0">
                <span className="text-base sm:text-lg tracking-tight font-black text-slate-900 block leading-tight truncate">
                  {!usuario ? 'Placeres Culinarios' : <span>{infoPantalla.titulo}</span>}
                </span>
                {usuario && (
                  <span className="text-[10px] text-slate-400 font-semibold hidden xs:block sm:block leading-none truncate">
                    {infoPantalla.subtitulo}
                  </span>
                )}
              </div>
            )}
          </Link>

          {/* Menú Operativo (SOLO VISIBLE PARA ADMINISTRADORES Y SUPER ADMIN) */}
          {esAdmin && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href.endsWith('/pedido-manual') && pathname.endsWith('/pedido-manual'));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onPointerDown={() => sincronizarCookieSesion(usuario)}
                      onClick={() => sincronizarCookieSesion(usuario)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        isActive
                          ? item.href.includes('/superadmin') && !item.href.includes('/pedido-manual')
                            ? 'bg-purple-600 text-white shadow-xs'
                            : item.href.includes('/pedido-manual')
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Área de Usuario / Autenticación */}
          <div className="flex items-center gap-2">
            {usuario ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Si es Padre, muestra accesos a "Mis Pedidos" y "Mis Hijos" */}
                {!esAdmin && (
                  <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
                    <Link
                      href="/padres/pedidos"
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        pathname === '/padres/pedidos' || pathname === '/pedidos'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Historial de Pedidos"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="hidden sm:inline">Mis Pedidos</span>
                    </Link>

                    <Link
                      href="/padres/deudas"
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        pathname === '/padres/deudas' || pathname === '/deudas'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Mis Deudas y Fiados"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="hidden sm:inline">Mis Deudas</span>
                    </Link>

                    <Link
                      href="/padres/hijos"
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        pathname === '/padres/hijos' || pathname === '/hijos'
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

                {/* Si es Super Admin o Admin */}
                {esSuperAdmin && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 hidden sm:inline">
                    Super Admin
                  </span>
                )}
                {esAdmin && !esSuperAdmin && (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 hidden sm:inline">
                    Admin ({usuario.colegioNombre ? usuario.colegioNombre : usuario.nombreCompleto.split(' ')[0]})
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  title="Ingresar a la plataforma"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                  <span className="sr-only">Ingresar</span>
                </Link>

                <Link
                  href="/login?modo=registro"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  title="Registrarme en la plataforma"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarme</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
