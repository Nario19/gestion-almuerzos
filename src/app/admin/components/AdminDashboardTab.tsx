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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-xl border border-zinc-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-zinc-500" />
            Fecha:
          </span>

          {/* Navegación Día Anterior */}
          <button
            type="button"
            onClick={() => cambiarDia(-1)}
            className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition cursor-pointer shadow-2xs"
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
              className="bg-white border border-zinc-200 text-zinc-900 text-xs sm:text-sm font-semibold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 focus:outline-hidden cursor-pointer shadow-2xs"
              title="Haz clic para seleccionar cualquier fecha en el calendario"
            />
          </div>

          {/* Navegación Día Siguiente */}
          <button
            type="button"
            onClick={() => cambiarDia(1)}
            className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition cursor-pointer shadow-2xs"
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Botón rápido HOY */}
          <button
            type="button"
            onClick={() => setFechaFiltro(fechaHoy)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              fechaFiltro === fechaHoy
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Hoy
          </button>

          {/* Botón Últimos 7 días */}
          <button
            type="button"
            onClick={() => setFechaFiltro('SEMANA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              fechaFiltro === 'SEMANA'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Últimos 7 días
          </button>

          {/* Botón Ver Todas las Fechas */}
          <button
            type="button"
            onClick={() => setFechaFiltro('TODAS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              fechaFiltro === 'TODAS'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Todas las Fechas
          </button>
        </div>
      </div>

      {/* Tarjetas Principales de KPIs Financieros y Volumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Ventas Generadas */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Ventas Generadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            S/ {ventasTotales.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Ticket promedio: S/ {ticketPromedio}
          </p>
        </div>

        {/* KPI 2: Total Almuerzos */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Total Almuerzos
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            {totalAlmuerzos} <span className="text-xs text-zinc-400 font-normal">raciones</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {esSuperAdmin
              ? `${rankingColegios.length} colegios atendidos`
              : usuario?.colegioNombre
              ? `${pedidosActivos.length} raciones en preparación` /* Colegio: ${usuario.colegioNombre} */
              : `${pedidosActivos.length} raciones activas`}
          </p>
        </div>

        {/* KPI 3: Pagos Recaudados */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Cobrado ({porcentajeCobrado}%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            S/ {ingresosRecaudados.toFixed(2)}
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-zinc-950 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${porcentajeCobrado}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Por Cobrar */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
              Por Cobrar
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            S/ {montoPorCobrar.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-medium">
            {pedidosPendientes.length} pedidos sin confirmar
          </p>
        </div>
      </div>

      {/* Sección Operativa: Embudo de Despacho del Período */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 tracking-tight flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-zinc-700" />
              Estado Operativo de Almuerzos
            </h3>
            <p className="text-xs text-zinc-500">
              Progreso de preparación y entrega de loncheras
            </p>
          </div>
          <div className="text-xs font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200/80 px-3 py-1.5 rounded-lg self-start sm:self-auto flex items-center gap-1.5">
            <span className="font-bold text-zinc-950">{porcentajeEntrega}%</span>
            <span>completado ({entregados} de {totalParaEntrega})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 sm:p-5 bg-zinc-50/70 rounded-xl border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">
                Entregados
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-zinc-950 mt-1 block">
                {entregados}
              </span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Almuerzos entregados en colegios
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-50/70 rounded-xl border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider block">
                Falta Entregar
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-zinc-950 mt-1 block">
                {faltaEntregar}
              </span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Pago aceptado y preparados por entregar
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Demanda por Colegio (SuperAdmin) y Platos Más Solicitados */}
      <div className={`grid grid-cols-1 ${esSuperAdmin ? 'md:grid-cols-2' : ''} gap-4`}>
        {/* Demanda por Colegio: Exclusivo Superadmin */}
        {esSuperAdmin && (
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-700" />
                Demanda por Colegio
              </h3>
              <span className="text-xs text-zinc-500 font-semibold">
                {rankingColegios.length} colegios
              </span>
            </div>

            {rankingColegios.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No hay pedidos registrados en este período.
              </p>
            ) : (
              <div className="space-y-3">
                {rankingColegios.map(([col, cant]) => {
                  const pct = totalAlmuerzos > 0 ? Math.round((cant / totalAlmuerzos) * 100) : 0;
                  return (
                    <div key={col} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                        <span className="truncate pr-2">{col}</span>
                        <span className="shrink-0 text-zinc-950 font-bold">
                          {cant} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-zinc-950 h-2 rounded-full transition-all duration-500"
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
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight flex items-center gap-2">
                <Utensils className="w-4 h-4 text-zinc-700" />
                Platos Más Solicitados
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Top preferencias del período</p>
            </div>
            <span className="text-[11px] font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg">
              Ranking de Ventas
            </span>
          </div>

          <div className="space-y-5">
            {/* Platos de Fondo (Segundos) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  Platos de Fondo (Segundos)
                </span>
                <span className="text-[11px] text-slate-400 font-bold">
                  {topSegundos.length} variedades
                </span>
              </div>

              {topSegundos.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                  Sin pedidos de segundos registrados en esta fecha.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topSegundos.map(([plato, cant], idx) => {
                    const pct = totalAlmuerzos > 0 ? Math.round((cant / totalAlmuerzos) * 100) : 0;
                    const esTop1 = idx === 0;
                    const esTop2 = idx === 1;
                    const esTop3 = idx === 2;

                    return (
                      <div
                        key={plato}
                        className={`p-3 rounded-2xl border transition-all ${
                          esTop1
                            ? 'bg-amber-50/50 border-amber-200/80 shadow-2xs'
                            : 'bg-white border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                esTop1
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : esTop2
                                  ? 'bg-slate-300 text-slate-800'
                                  : esTop3
                                  ? 'bg-orange-300 text-orange-950'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="font-black text-xs text-slate-900 truncate">
                              {plato}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900">
                              {cant} {cant === 1 ? 'pedido' : 'pedidos'}
                            </span>
                            <span className="text-[10px] font-bold text-orange-600 ml-1.5 bg-orange-100/70 px-1.5 py-0.5 rounded-md">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              esTop1
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                                : 'bg-orange-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sopas y Entradas */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  Sopas / Entradas
                </span>
                <span className="text-[11px] text-slate-400 font-bold">
                  {topEntradas.length} variedades
                </span>
              </div>

              {topEntradas.length === 0 ? (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                  Sin opciones de entrada registradas en esta fecha.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {topEntradas.map(([entrada, cant], idx) => (
                    <div
                      key={entrada}
                      className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-4 h-4 rounded-md bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          {entrada}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0 text-[11px]">
                        {cant}
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
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-700" />
              Últimos Pedidos del Período
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Actividad reciente de los alumnos y familias ({pedidosPeriodo.length} pedidos totales)
            </p>
          </div>
          <Link
            href="/admin/despacho"
            className="text-xs font-semibold text-zinc-900 hover:text-black bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition self-start sm:self-auto shadow-2xs"
          >
            <span>Ver todos en despacho</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pedidosPeriodo.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 rounded-xl border border-zinc-100">
            <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-700">No hay pedidos en este período seleccionado.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Usa los botones superiores para cambiar de fecha.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
                  <th className="py-3 px-3.5">Código</th>
                  <th className="py-3 px-3.5">Estudiante</th>
                  <th className="py-3 px-3.5">Colegio / Grado</th>
                  <th className="py-3 px-3.5">Menú Elegido</th>
                  <th className="py-3 px-3.5 text-right">Monto</th>
                  <th className="py-3 px-3.5 text-center">Pago</th>
                  <th className="py-3 px-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {pedidosPeriodo.slice(0, 8).map((p) => {
                  const pagado = p.estadoPago === 'PAGADO';
                  const verificando = p.estadoPago === 'VERIFICANDO';
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Código */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-zinc-900 bg-zinc-100 text-[11px] px-2 py-0.5 rounded-md border border-zinc-200">
                          #{p.codigoPedido}
                        </span>
                      </td>

                      {/* Estudiante con avatar de inicial */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-950 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                            {(p.estudianteNombre || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-zinc-900 text-xs">
                            {p.estudianteNombre}
                          </span>
                        </div>
                      </td>

                      {/* Colegio / Grado */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-zinc-800 font-semibold text-xs">
                          {p.gradoSeccion}
                        </div>
                        {p.colegioNombre && (
                          <span className="text-[10px] text-zinc-400 font-medium block">
                            {p.colegioNombre}
                          </span>
                        )}
                      </td>

                      {/* Menú */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-zinc-900 line-clamp-1 max-w-[200px]" title={p.segundoNombre}>
                          {p.segundoNombre}
                        </div>
                        {p.entradaNombre && p.entradaNombre !== 'Sin entrada' && (
                          <span className="text-[10px] text-zinc-600 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                            + {p.entradaNombre}
                          </span>
                        )}
                      </td>

                      {/* Monto */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span className="font-bold text-zinc-950 text-xs">
                          S/ {(p.monto || 12).toFixed(2)}
                        </span>
                      </td>

                      {/* Estado Pago */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1 ${
                            pagado
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : verificando
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.estadoPago}
                        </span>
                      </td>

                      {/* Estado Pedido */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            p.estadoPedido === 'CANCELADO'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : p.estadoPedido === 'ENTREGADO'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {p.estadoPedido}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
