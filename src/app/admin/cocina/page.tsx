'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
  Filter,
  Flame,
  Utensils,
  Salad,
  Radio,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { SkeletonDashboardPage } from '@/components/Skeleton';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  calcularOffsetFechaPeru,
  obtenerHoraActualPeru,
} from '@/lib/dateUtils';
import { Pedido, ResumenCocina } from '@/types';

// Formateador legible en español para la fecha
const formatearFechaLegible = (fechaStr: string) => {
  if (fechaStr === 'TODAS') return 'Todas las fechas';
  return formatearFechaLegiblePeru(fechaStr);
};

export default function CocinaPage() {
  const { usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth } = useAuth();
  const fechaHoy = obtenerFechaHoyPeru();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [colegios, setColegios] = useState<string[]>([]);
  const [colegioFiltro, setColegioFiltro] = useState<string>(
    !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : 'TODOS'
  );
  // Por defecto Cocina muestra los pedidos de HOY
  const [fechaFiltro, setFechaFiltro] = useState<string>(fechaHoy);
  const [cargando, setCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');

  // Paginación para observaciones y dietas especiales
  const [paginaObs, setPaginaObs] = useState(1);
  const obsPorPagina = 6;

  const cargarDatos = async () => {
    try {
      const [data, cols] = await Promise.all([
        dataService.obtenerPedidos(),
        dataService.obtenerColegios(),
      ]);
      setPedidos(data);
      if (cols) setColegios(cols);
      setUltimaActualizacion(obtenerHoraActualPeru());
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!esAdmin) return;
    cargarDatos();

    // Suscribirse a cambios en tiempo real
    const desuscribir = dataService.suscribirCambios(() => {
      cargarDatos();
    });

    return () => desuscribir();
  }, [esAdmin]);

  // Navegar día anterior o siguiente (para ver ayer, mañana, etc.)
  const cambiarDia = (offset: number) => {
    setPaginaObs(1);
    if (fechaFiltro === 'TODAS') {
      setFechaFiltro(fechaHoy);
      return;
    }
    setFechaFiltro(calcularOffsetFechaPeru(fechaFiltro, offset));
  };

  // 1. Filtrar por fecha seleccionada (por defecto HOY)
  // Ignorar pedidos cancelados: cocina SOLO prepara y lista pedidos activos
  const pedidosFecha = pedidos.filter((p) => {
    const f = (p.fecha || '').slice(0, 10);
    const matchFecha = fechaFiltro === 'TODAS' || f === fechaFiltro;
    return matchFecha && p.estadoPedido !== 'CANCELADO';
  });

  // 2. Scoping por colegio: Super Admin puede ver 'TODOS' o elegir uno; Admin de colegio ve exclusivamente el suyo
  const colegioActivo = !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : colegioFiltro;

  // 3. En cocina se contabilizan y preparan TODOS los pedidos registrados (se hayan pagado o no,
  // con método digital Yape/Plin, en efectivo o con p.metodoPago === 'Pagar luego')
  const pedidosFiltrados = colegioActivo === 'TODOS'
    ? pedidosFecha
    : pedidosFecha.filter((p) => p.colegioNombre === colegioActivo);

  // Pedidos con pago aún pendiente de validación o cobro
  const pedidosPendientesPago = pedidosFiltrados.filter(
    (p) => p.estadoPago !== 'PAGADO'
  );

  const resumen: ResumenCocina = dataService.calcularResumenCocina(pedidosFiltrados);

  // Extraer todas las observaciones críticas de los pedidos aceptados
  const pedidosConObs = pedidosFiltrados.filter(
    (p) => p.observacion && p.observacion.trim().length > 0
  );

  const totalObs = pedidosConObs.length;
  const totalPaginasObs = Math.ceil(totalObs / obsPorPagina) || 1;
  const paginaValidaObs = Math.min(Math.max(1, paginaObs), totalPaginasObs);
  const obsPaginadas = pedidosConObs.slice(
    (paginaValidaObs - 1) * obsPorPagina,
    paginaValidaObs * obsPorPagina
  );

  if (cargandoAuth) {
    return <SkeletonDashboardPage />;
  }

  if (!esAdmin) {
    return <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el personal de cocina de Placeres Culinarios." />;
  }

  if (!esSuperAdmin && !usuario?.colegioNombre) {
    return <AccesoRestringido mensaje="Tu cuenta de administrador no tiene un colegio activo asignado. Contacta al Super Administrador." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Barra superior de estado de cocina */}
      <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> TIEMPO REAL ACTIVO
              </span>
              <span className="text-xs text-slate-400">
                Actualizado: {ultimaActualizacion || '--:--'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <ChefHat className="w-8 h-8 text-orange-500" />
              Consolidado de Cocina
            </h1>
            {!esSuperAdmin && usuario?.colegioNombre && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 font-bold text-orange-900 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200 text-xs shadow-2xs">
                  🏫 Colegio: {usuario.colegioNombre}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cargarDatos}
              disabled={cargando}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl border border-slate-200 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${cargando ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </div>
        </div>

        {/* Selector de Calendario y Fechas (Hoy, Ayer, etc.) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-500" /> Menú de Cocina:
            </span>
            <span className="font-black text-slate-900 capitalize text-sm">
              {formatearFechaLegible(fechaFiltro)}
              {fechaFiltro === fechaHoy && (
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider border border-emerald-200">
                  Hoy
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Botón Día Anterior (Ayer) */}
            <button
              type="button"
              onClick={() => cambiarDia(-1)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
              title="Ver día anterior (ayer)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Input nativo de Calendario */}
            <input
              type="date"
              value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
              onChange={(e) => {
                setFechaFiltro(e.target.value || fechaHoy);
                setPaginaObs(1);
              }}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden cursor-pointer"
              title="Seleccionar fecha para consultar cocina"
            />

            {/* Botón Día Siguiente */}
            <button
              type="button"
              onClick={() => cambiarDia(1)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
              title="Ver día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Botón rápido HOY */}
            <button
              type="button"
              onClick={() => {
                setFechaFiltro(fechaHoy);
                setPaginaObs(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                fechaFiltro === fechaHoy
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Hoy
            </button>

            {/* Botón Ver Todas las Fechas */}
            <button
              type="button"
              onClick={() => {
                setFechaFiltro('TODAS');
                setPaginaObs(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                fechaFiltro === 'TODAS'
                  ? 'bg-slate-900 text-white font-black shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Filtro por Institución Educativa: Exclusivo Superadmin */}
        {esSuperAdmin && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar por Colegio:
            </span>
            {['TODOS', ...colegios].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColegioFiltro(c);
                  setPaginaObs(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  colegioActivo === c
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aviso de pedidos pendientes de pago o validación */}
      {pedidosPendientesPago.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">ℹ️</span>
            <span>
              Hay <strong>{pedidosPendientesPago.length} pedido(s) con pago por cobrar o validar</strong>. Ya están incluidos en el consolidado de cocina para su preparación.
            </span>
          </div>
          <Link
            href="/admin/despacho"
            className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl shrink-0 transition text-center"
          >
            Ir a Despacho y Pagos →
          </Link>
        </div>
      )}

      {/* KPI Cards de Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Almuerzos a Cocinar</span>
          <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">
            {resumen.totalPedidos}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Órdenes confirmadas</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">Con Observaciones</span>
          <span className="text-3xl font-black text-amber-600 tracking-tight block mt-1">
            {resumen.pedidosConObservacion}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Dietas o preferencias</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Pagos Verificados</span>
          <span className="text-3xl font-black text-emerald-600 tracking-tight block mt-1">
            {resumen.pedidosPagados}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {fechaFiltro === fechaHoy ? 'Pagados para hoy' : `Para ${formatearFechaLegible(fechaFiltro)}`}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">Pendientes de Pago</span>
          <span className="text-3xl font-black text-rose-600 tracking-tight block mt-1">
            {resumen.pedidosPendientesPago}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Por cobrar o validar</span>
        </div>
      </div>

      {/* SECCIÓN 1: CONSOLIDADO DE ENTRADAS Y SEGUNDOS */}
      <div className={`grid grid-cols-1 ${resumen.ensaladas && resumen.ensaladas.length > 0 ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'} gap-6 mb-8`}>
        {/* PANEL ENTRADAS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Consolidado de Sopas o Postres
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-xl">
              {resumen.entradas.reduce((acc, curr) => acc + curr.cantidad, 0)} porciones
            </span>
          </div>

          <div className="space-y-3">
            {resumen.entradas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No hay pedidos de sopas o postres para {formatearFechaLegible(fechaFiltro)}.
              </p>
            ) : (
              resumen.entradas.map((item) => (
                <div
                  key={item.plato}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80"
                >
                  <span className="text-sm font-bold text-slate-800">{item.plato}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200">
                      {item.cantidad}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL SEGUNDOS / PLATOS DE FONDO */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Consolidado de Segundos
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-xl">
              {resumen.segundos.reduce((acc, curr) => acc + curr.cantidad, 0)} porciones
            </span>
          </div>

          <div className="space-y-3">
            {resumen.segundos.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No hay pedidos de segundo para {formatearFechaLegible(fechaFiltro)}.
              </p>
            ) : (
              resumen.segundos.map((item) => (
                <div
                  key={item.plato}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80"
                >
                  <span className="text-sm font-bold text-slate-800 pr-2">{item.plato}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xl font-black text-slate-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200">
                      {item.cantidad}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL ENSALADAS */}
        {resumen.ensaladas && resumen.ensaladas.length > 0 && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Salad className="w-5 h-5 text-emerald-600" />
                Consolidado de Ensaladas
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl">
                {resumen.ensaladas.reduce((acc, curr) => acc + curr.cantidad, 0)} porciones
              </span>
            </div>

            <div className="space-y-3">
              {resumen.ensaladas.map((item) => (
                <div
                  key={item.plato}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80"
                >
                  <span className="text-sm font-bold text-slate-800 pr-2">{item.plato}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xl font-black text-slate-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-slate-200">
                      {item.cantidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 1.5: DESGLOSE INDEPENDIENTE DE ALMUERZOS POR CADA COLEGIO (Exclusivo Superadmin) */}
      {esSuperAdmin && resumen.porColegio && resumen.porColegio.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-xl">🏫</span>
              Almuerzos Independientes por Colegio
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl">
              {resumen.porColegio.length} colegios con pedidos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumen.porColegio.map((col) => (
              <div
                key={col.colegioNombre}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md font-mono font-black text-xs bg-orange-100 text-orange-900 border border-orange-200">
                        {col.identificador}
                      </span>
                      <h3 className="font-black text-slate-900 text-sm">{col.colegioNombre}</h3>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                      {col.totalPedidos} almuerzos
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-1.5">
                        Platos de Fondo (Segundos):
                      </span>
                      <div className="space-y-1.5">
                        {col.segundos.map((s) => (
                          <div
                            key={s.plato}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-xl"
                          >
                            <span className="font-medium text-slate-800">{s.plato}</span>
                            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                              {s.cantidad}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {col.entradas.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-1.5">
                          Sopas o Postres:
                        </span>
                        <div className="space-y-1.5">
                          {col.entradas.map((e) => (
                            <div
                              key={e.plato}
                              className="flex items-center justify-between p-2 bg-slate-50 rounded-xl"
                            >
                              <span className="font-medium text-slate-800">{e.plato}</span>
                              <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                                {e.cantidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: ALERTA DE OBSERVACIONES CRÍTICAS (NO MÁS OBSERVACIONES PERDIDAS) */}
      <div className="bg-amber-50/70 rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                Observaciones y Dietas Especiales
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-black bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
              {totalObs} Alertas
            </span>
            {totalPaginasObs > 1 && (
              <div className="flex items-center gap-1 bg-white border border-amber-200 rounded-xl px-2 py-1 shadow-xs">
                <span className="text-xs font-semibold text-slate-600 mr-1">
                  Pág. {paginaValidaObs} de {totalPaginasObs}
                </span>
                <button
                  type="button"
                  onClick={() => setPaginaObs((prev) => Math.max(1, prev - 1))}
                  disabled={paginaValidaObs <= 1}
                  className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaObs((prev) => Math.min(totalPaginasObs, prev + 1))}
                  disabled={paginaValidaObs >= totalPaginasObs}
                  className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {totalObs === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-xs text-slate-500">
            ✓ No hay observaciones especiales para los pedidos actuales.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {obsPaginadas.map((p) => {
              const matchNum = (p.codigoPedido || '').match(/-(\d+)$/);
              const numAlm = matchNum ? parseInt(matchNum[1], 10) : undefined;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-3.5 border border-amber-300 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                        #{p.codigoPedido}
                      </span>
                      {numAlm && (
                        <span className="text-[10px] font-bold text-slate-500">
                          Almuerzo #{numAlm}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                      {p.gradoSeccion}
                    </span>
                  </div>
                  <div className="font-black text-slate-900 text-sm">{p.estudianteNombre}</div>
                  <p className="text-xs text-slate-500 font-medium">🏫 {p.colegioNombre}</p>
                  <div className="text-xs text-slate-700">
                    <span className="text-orange-600 font-semibold">{p.entradaNombre}</span> +{' '}
                    <span className="text-slate-800 font-semibold">{p.segundoNombre}</span>
                    {p.ensaladaNombre && p.ensaladaNombre !== 'Sin ensalada' && (
                      <> + <span className="text-emerald-700 font-semibold">{p.ensaladaNombre}</span></>
                    )}
                    {p.refrigerioNombre && (
                      <span className="text-emerald-700 font-bold block mt-0.5">Extras: {p.refrigerioNombre}</span>
                    )}
                  </div>
                  <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-1.5">
                    <span className="shrink-0">⚠️</span>
                    <span>{p.observacion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
