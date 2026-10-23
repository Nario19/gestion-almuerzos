import React from 'react';

/**
 * Componente base de Skeleton con efecto shimmer / pulso para estados de carga elegantes.
 */
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-slate-200/90 animate-pulse rounded-2xl ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton para la pantalla principal (Home / Carta Semanal y Pedidos de Padres).
 */
export function SkeletonHomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200" aria-busy="true" aria-label="Cargando menú...">
      {/* Saludo y selector de hijo */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Skeleton className="h-12 rounded-2xl" />
          <Skeleton className="h-12 rounded-2xl" />
        </div>
      </div>

      {/* Selector de días (Lunes a Viernes) */}
      <div className="grid grid-cols-5 gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-11 rounded-xl" />
        ))}
      </div>

      {/* Sección de Entradas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      </div>

      {/* Sección de Segundos / Platos de fondo */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>

      {/* Botón de confirmar */}
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}

/**
 * Skeleton para la pantalla de Historial de Pedidos (/pedidos).
 */
export function SkeletonPedidosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-200" aria-busy="true" aria-label="Cargando historial de pedidos...">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      {/* Filtro de Fecha y Calendario */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-16 rounded-xl" />
            <Skeleton className="h-7 w-16 rounded-xl" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* Lista de Tarjetas de Pedidos */}
      <div className="space-y-3.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para la pantalla de Gestión de Hijos (/hijos).
 */
export function SkeletonHijosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200" aria-busy="true" aria-label="Cargando información de hijos...">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>

      {/* Lista de Hijos Registrados */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para la pantalla de Perfil (/perfil).
 */
export function SkeletonPerfilPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-200" aria-busy="true" aria-label="Cargando perfil...">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>

      {/* Tarjeta Apoderado */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Tarjeta Hijos */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>

      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}

/**
 * Skeleton para paneles de administración, cocina, despacho y superadmin.
 */
export function SkeletonDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200" aria-busy="true" aria-label="Cargando panel...">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* KPIs superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-slate-200 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-2 w-28" />
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap gap-2 justify-between">
        <Skeleton className="h-8 w-44 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>

      {/* Tabla o Tarjetas Principales */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para la pantalla de inicio de sesión (/login).
 */
export function SkeletonLoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-5 animate-in fade-in duration-200" aria-busy="true" aria-label="Cargando acceso...">
      <div className="text-center space-y-2">
        <Skeleton className="w-14 h-14 rounded-2xl mx-auto" />
        <Skeleton className="h-6 w-44 mx-auto" />
        <Skeleton className="h-3 w-60 mx-auto" />
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <Skeleton className="h-8 rounded-xl" />
          <Skeleton className="h-8 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para la pantalla de Analítica y Business Intelligence (/superadmin/analytics).
 */
export function SkeletonAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 animate-in fade-in duration-200" aria-busy="true" aria-label="Cargando analítica...">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200/90 shadow-xs flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>

      {/* Grids de análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparativa por Colegio */}
      <div className="bg-white p-5 rounded-xl border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
          <Skeleton className="h-5 w-56 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
