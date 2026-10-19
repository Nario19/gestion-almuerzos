'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  ChefHat,
  DollarSign,
  Utensils,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Pedido } from '@/types';

interface AdminDashboardTabProps {
  pedidosPeriodo: Pedido[];
  pedidosActivos: Pedido[];
  ventasTotales: number;
  ticketPromedio: string;
  totalAlmuerzos: number;
  porcentajeCobrado: number;
  ingresosRecaudados: number;
  montoPorCobrar: number;
  pedidosPendientes: Pedido[];
  entregados: number;
  faltaEntregar: number;
  totalParaEntrega: number;
  porcentajeEntrega: number;
  rankingColegios: [string, number][];
  topSegundos: [string, number][];
  topEntradas: [string, number][];
  fechaFiltro: string;
  setFechaFiltro: (fecha: string) => void;
  cambiarDia: (dias: number) => void;
  fechaHoy: string;
  esSuperAdmin: boolean;
  colegioNombre?: string;
  usuario?: { colegioNombre?: string } | null;
}

export default function AdminDashboardTab({
  pedidosPeriodo,
  pedidosActivos,
  ventasTotales,
  ticketPromedio,
  totalAlmuerzos,
  porcentajeCobrado,
  ingresosRecaudados,
  montoPorCobrar,
  pedidosPendientes,
  entregados,
  faltaEntregar,
  totalParaEntrega,
  porcentajeEntrega,
  rankingColegios,
  topSegundos,
  topEntradas,
  fechaFiltro,
  setFechaFiltro,
  cambiarDia,
  fechaHoy,
  esSuperAdmin,
  colegioNombre,
  usuario,
}: AdminDashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Selector de Fecha / Período y Enlaces Operativos */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-orange-500" />
            Fecha:
          </span>

          {/* Navegación Día Anterior */}
          <button
            type="button"
            onClick={() => cambiarDia(-1)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
            title="Día anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Input nativo de Calendario */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={fechaFiltro === 'TODAS' || fechaFiltro === 'SEMANA' ? '' : fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value || fechaHoy)}
              className="bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-hidden cursor-pointer shadow-2xs"
              title="Haz clic para seleccionar cualquier fecha en el calendario"
            />
          </div>

          {/* Navegación Día Siguiente */}
          <button
            type="button"
            onClick={() => cambiarDia(1)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Botón rápido HOY */}
          <button
            type="button"
            onClick={() => setFechaFiltro(fechaHoy)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              fechaFiltro === fechaHoy
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Hoy
          </button>

          {/* Botón Últimos 7 días */}
          <button
            type="button"
            onClick={() => setFechaFiltro('SEMANA')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              fechaFiltro === 'SEMANA'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Últimos 7 días
          </button>

          {/* Botón Ver Todas las Fechas */}
          <button
            type="button"
            onClick={() => setFechaFiltro('TODAS')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              fechaFiltro === 'TODAS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Todas las Fechas
          </button>
        </div>

        {/* Accesos directos a Despacho y Cocina */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/despacho"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Despacho & Excel</span>
          </Link>
          <Link
            href="/admin/cocina"
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Panel Cocina</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas Principales de KPIs Financieros y Volumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Ventas Generadas */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ventas Generadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            S/ {ventasTotales.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ticket promedio: S/ {ticketPromedio}
          </p>
        </div>

        {/* KPI 2: Total Almuerzos */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Almuerzos
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {totalAlmuerzos} <span className="text-xs text-slate-400 font-normal">raciones</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {esSuperAdmin
              ? `${rankingColegios.length} colegios atendidos`
              : usuario?.colegioNombre
              ? `Sede: ${usuario.colegioNombre}`
              : `${pedidosActivos.length} raciones activas`}
          </p>
        </div>

        {/* KPI 3: Pagos Recaudados */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Cobrado ({porcentajeCobrado}%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            S/ {ingresosRecaudados.toFixed(2)}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${porcentajeCobrado}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Por Cobrar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              Por Cobrar
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600">
            S/ {montoPorCobrar.toFixed(2)}
          </div>
          <p className="text-[11px] text-rose-500 mt-1 font-semibold">
            {pedidosPendientes.length} pedidos sin confirmar
          </p>
        </div>
      </div>

      {/* Sección Operativa: Embudo de Despacho del Período */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-orange-500" />
              Estado Operativo de Almuerzos
            </h3>
            <p className="text-xs text-slate-500">
              Progreso de preparación y entrega de loncheras
            </p>
          </div>
          <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-1.5">
            <span className="font-black text-orange-600">{porcentajeEntrega}%</span>
            <span>completado ({entregados} de {totalParaEntrega})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Entregados
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1 block">
                {entregados}
              </span>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Almuerzos entregados en colegios
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Falta Entregar
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-900 mt-1 block">
                {faltaEntregar}
              </span>
              <p className="text-[11px] text-amber-600 mt-0.5">
                Pago aceptado y preparados por entregar
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Demanda por Colegio (SuperAdmin) y Platos Más Solicitados */}
      <div className={`grid grid-cols-1 ${esSuperAdmin ? 'md:grid-cols-2' : ''} gap-4`}>
        {/* Demanda por Colegio: Exclusivo Superadmin */}
        {esSuperAdmin && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" />
                Demanda por Colegio
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                {rankingColegios.length} colegios
              </span>
            </div>

            {rankingColegios.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No hay pedidos registrados en este período.
              </p>
            ) : (
              <div className="space-y-3">
                {rankingColegios.map(([col, cant]) => {
                  const pct = totalAlmuerzos > 0 ? Math.round((cant / totalAlmuerzos) * 100) : 0;
                  return (
                    <div key={col} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="truncate pr-2">{col}</span>
                        <span className="shrink-0 text-slate-900">
                          {cant} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Platos Favoritos (Preferencias) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-500" />
              Platos Más Solicitados
            </h3>
            <span className="text-xs text-slate-400 font-bold">Top Preferencias</span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                Platos de Fondo (Segundos)
              </span>
              {topSegundos.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Sin datos disponibles.</p>
              ) : (
                <div className="space-y-2">
                  {topSegundos.map(([plato, cant], idx) => {
                    const pct = totalAlmuerzos > 0 ? Math.round((cant / totalAlmuerzos) * 100) : 0;
                    return (
                      <div key={plato} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate pr-2">
                          {idx + 1}. {plato}
                        </span>
                        <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                          {cant} pedidos ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                Entradas
              </span>
              {topEntradas.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Sin datos disponibles.</p>
              ) : (
                <div className="space-y-2">
                  {topEntradas.map(([entrada, cant], idx) => (
                    <div key={entrada} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate pr-2">
                        {idx + 1}. {entrada}
                      </span>
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                        {cant} pedidos
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Últimos Pedidos Recientes */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Últimos Pedidos del Período
            </h3>
            <p className="text-xs text-slate-500">
              Actividad reciente de los padres de familia
            </p>
          </div>
          <Link
            href="/admin/despacho"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
          >
            Ver todos en despacho <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pedidosPeriodo.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No hay pedidos en este período seleccionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Código</th>
                  <th className="pb-2">Estudiante</th>
                  <th className="pb-2">Colegio / Grado</th>
                  <th className="pb-2">Menú</th>
                  <th className="pb-2 text-right">Monto</th>
                  <th className="pb-2 text-center">Pago</th>
                  <th className="pb-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidosPeriodo.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 font-mono font-black text-slate-800">
                      #{p.codigoPedido}
                    </td>
                    <td className="py-2.5 font-bold text-slate-800">
                      {p.estudianteNombre}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {p.colegioNombre} <span className="font-semibold text-slate-700">({p.gradoSeccion})</span>
                    </td>
                    <td className="py-2.5 text-slate-700 truncate max-w-[160px]">
                      {p.segundoNombre}
                    </td>
                    <td className="py-2.5 font-bold text-slate-900 text-right">
                      S/ {(p.monto || 12).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          p.estadoPago === 'PAGADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.estadoPago}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          p.estadoPedido === 'CANCELADO'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : p.estadoPedido === 'ENTREGADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.estadoPedido}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
