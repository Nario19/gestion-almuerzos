'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  ChefHat,
  PackageCheck,
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
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth, sincronizarCookieSesion } from '@/lib/authContext';
import { obtenerInfoPantalla } from '@/lib/navUtils';
import { esRutaAdministrativa } from '@/lib/navUtils';
import { useSidebar } from '@/components/SidebarContext';

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
  const { usuario, esAdmin, esSuperAdmin, logout } = useAuth();
  const {
    sidebarColapsado,
    toggleSidebarColapsado,
    sidebarMovilAbierto,
    setSidebarMovilAbierto,
  } = useSidebar();

  const esRutaAdmin = esRutaAdministrativa(pathname);
  const infoPantalla = obtenerInfoPantalla(pathname, !!usuario);
  const IconoPantalla = ICONOS_PANTALLA[infoPantalla.iconoNombre] || UtensilsCrossed;

  const handleLogout = () => {
    logout();
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

  // Título administrativo visible en la barra superior blanca (App Shell)
  const obtenerTituloAdmin = () => {
    if (pathname.includes('/cocina')) return 'Control de Cocina';
    if (pathname.includes('/despacho')) return 'Despacho de Pedidos';
    if (pathname.includes('/fiado')) return 'Registro de Fiados';
    if (pathname.includes('/pedido-manual')) return 'Pedido Manual';
    if (pathname.includes('/analytics')) return 'Analítica General';
    if (pathname === '/superadmin') return 'Gestión de Colegios';
    return 'Panel de Administración';
  };

  return (
    <>
      {/* SIDEBAR PROFESIONAL Y COLAPSABLE PARA ADMINISTRACIÓN */}
      {esAdmin && esRutaAdmin && (
        <>
          {/* Backdrop para móviles */}
          {sidebarMovilAbierto && (
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
              onClick={() => setSidebarMovilAbierto(false)}
            />
          )}

          {/* Panel Lateral: Desktop (w-64 o w-16 colapsado) y Drawer en Móvil */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-zinc-200/90 flex flex-col justify-between transition-all duration-200 ease-in-out ${
              sidebarColapsado ? 'lg:w-16' : 'lg:w-64'
            } w-64 ${
              sidebarMovilAbierto
                ? 'translate-x-0 shadow-2xl'
                : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Cabecera del Sidebar */}
            <div>
              <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between">
                <Link
                  href={esSuperAdmin ? '/superadmin' : '/admin'}
                  className={`flex items-center gap-2.5 min-w-0 ${
                    sidebarColapsado ? 'lg:justify-center lg:w-full' : ''
                  }`}
                  onClick={() => setSidebarMovilAbierto(false)}
                  title="Placeres Culinarios"
                >
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div className={`min-w-0 ${sidebarColapsado ? 'lg:hidden' : ''}`}>
                    <span className="text-sm font-bold tracking-tight text-zinc-950 block truncate">
                      Placeres Culinarios
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium block truncate">
                      Panel Administrativo
                    </span>
                  </div>
                </Link>

                {/* Botón cerrar en móvil */}
                <button
                  type="button"
                  onClick={() => setSidebarMovilAbierto(false)}
                  className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
                  title="Cerrar menú"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Botón colapsar / expandir en desktop (cuando está expandido) */}
                {!sidebarColapsado && (
                  <button
                    type="button"
                    onClick={toggleSidebarColapsado}
                    className="hidden lg:flex p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
                    title="Colapsar barra lateral"
                    aria-label="Colapsar barra lateral"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón expandir en desktop cuando está colapsado */}
              {sidebarColapsado && (
                <div className="hidden lg:flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={toggleSidebarColapsado}
                    className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
                    title="Expandir barra lateral"
                    aria-label="Expandir barra lateral"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Insignia del Colegio / Rol (solo visible cuando está expandido) */}
              {!sidebarColapsado && (
                <div className="px-3 pt-3">
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="truncate">
                      {esSuperAdmin
                        ? 'Super Administrador'
                        : usuario?.colegioNombre
                        ? usuario.colegioNombre
                        : 'Colegio Asignado'}
                    </span>
                  </div>
                </div>
              )}

              {/* Enlaces de Navegación del Sidebar */}
              <nav className={`px-2 py-3 space-y-1 ${sidebarColapsado ? 'lg:px-2' : 'px-3'}`}>
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
                      onClick={() => {
                        sincronizarCookieSesion(usuario);
                        setSidebarMovilAbierto(false);
                      }}
                      title={item.label}
                      aria-label={item.label}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        sidebarColapsado ? 'lg:justify-center lg:px-2' : ''
                      } ${
                        isActive
                          ? 'bg-zinc-950 text-white shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className={sidebarColapsado ? 'lg:hidden' : ''}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Pie del Sidebar: Datos del Administrador y Cerrar Sesión */}
            <div className={`p-3 border-t border-zinc-100 space-y-2 ${sidebarColapsado ? 'lg:p-2' : ''}`}>
              {!sidebarColapsado ? (
                <>
                  <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50/70 border border-zinc-100">
                    <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(usuario?.nombreCompleto || usuario?.email || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {usuario?.nombreCompleto || 'Administrador'}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {usuario?.email || (esSuperAdmin ? 'Superadmin' : 'Admin')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-rose-600 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center"
                    title={usuario?.nombreCompleto || 'Administrador'}
                  >
                    {(usuario?.nombreCompleto || usuario?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition cursor-pointer"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* TOP HEADER / APP SHELL BARRA BLANCA SUPERIOR */}
      <header
        className={`sticky top-0 z-40 bg-white/95 border-b border-zinc-200/80 shadow-xs backdrop-blur-md transition-all duration-200 ease-in-out ${
          esRutaAdmin && esAdmin ? (sidebarColapsado ? 'lg:pl-16' : 'lg:pl-64') : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Botón de Menú Hamburguesa para Móvil en Admin */}
              {esAdmin && esRutaAdmin && (
                <button
                  type="button"
                  onClick={() => setSidebarMovilAbierto(true)}
                  className="lg:hidden p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition mr-1 cursor-pointer"
                  title="Abrir menú de navegación"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Botón de alternar colapso en desktop en rutas admin */}
              {esAdmin && esRutaAdmin && (
                <button
                  type="button"
                  onClick={toggleSidebarColapsado}
                  className="hidden lg:flex p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                  title={sidebarColapsado ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                  aria-label={sidebarColapsado ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                >
                  {sidebarColapsado ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Link de Marca o Título para Padres */}
              <Link
                href={esRutaAdmin ? (esSuperAdmin ? '/superadmin' : '/admin') : '/'}
                onPointerDown={() => sincronizarCookieSesion(usuario)}
                onClick={() => sincronizarCookieSesion(usuario)}
                className="flex items-center gap-2.5 font-bold text-slate-800 hover:opacity-90 transition min-w-0"
                title={esRutaAdmin ? 'Ir al Panel' : 'Ir al inicio'}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${
                    esRutaAdmin
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/20'
                  } flex items-center justify-center shrink-0`}
                >
                  {esRutaAdmin || !usuario ? <UtensilsCrossed className="w-5 h-5" /> : <IconoPantalla className="w-5 h-5" />}
                </div>

                {/* En admin/superadmin se omite el título redundante aquí, satisfaciendo el test esRutaAdmin ? null : */}
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

              {/* TÍTULO DE LA PANTALLA Y COLEGIO EN LA BARRA SUPERIOR BLANCA PARA ADMIN/SUPERADMIN */}
              {esRutaAdmin && esAdmin && (
                <div className="flex items-center gap-2.5 min-w-0 ml-1">
                  <div className="h-5 w-px bg-zinc-200 hidden sm:block shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-950 truncate">
                      {obtenerTituloAdmin()}
                    </h1>
                  </div>

                  {/* Insignia del Colegio en la Barra Superior */}
                  {usuario?.colegioNombre ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="truncate max-w-[180px]">{usuario.colegioNombre}</span>
                    </span>
                  ) : esSuperAdmin ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950 text-white text-[11px] font-semibold shrink-0 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Superadmin</span>
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Menú Operativo Superior (visible en pantallas móviles o cuando no hay sidebar abierto) */}
            {esAdmin && (
              <div className="hidden md:flex lg:hidden items-center gap-1.5">
                <nav className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80">
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-zinc-950 text-white shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
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

                  {/* Botón Cerrar Sesión en Header */}
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                    title="Cerrar sesión"
                    aria-label="Cerrar sesión"
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
    </>
  );
}
