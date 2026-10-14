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
  Radio,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
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
    setCargando(true);
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
    if (!esSuperAdmin && usuario?.colegioNombre) {
      setColegioFiltro(usuario.colegioNombre);
    }
  }, [usuario, esSuperAdmin]);

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
    if (fechaFiltro === 'TODAS') {
      setFechaFiltro(fechaHoy);
      return;
    }
    setFechaFiltro(calcularOffsetFechaPeru(fechaFiltro, offset));
  };

  // 1. Filtrar por fecha seleccionada (por defecto HOY)
  const pedidosFecha = pedidos.filter((p) => {
    const f = (p.fecha || '').slice(0, 10);
    return fechaFiltro === 'TODAS' || f === fechaFiltro;
  });

  // 2. En cocina solo se preparan pedidos aceptados (pago verificado o estado avanzado por administración)
  const pedidosAceptados = pedidosFecha.filter(
    (p) => p.estadoPago === 'PAGADO' || p.estadoPedido !== 'REGISTRADO'
  );

  // 3. Pedidos de esta fecha que aún no han sido aceptados/pagados en Despacho
  const pedidosPendientesDespacho = pedidosFecha.filter(
    (p) => p.estadoPago !== 'PAGADO' && p.estadoPedido === 'REGISTRADO'
  );

  // 4. Filtrar pedidos listos para cocina según el colegio seleccionado
  const pedidosFiltrados = colegioFiltro === 'TODOS'
    ? pedidosAceptados
    : pedidosAceptados.filter((p) => p.colegioNombre === colegioFiltro);

  const resumen: ResumenCocina = dataService.calcularResumenCocina(pedidosFiltrados);

  // Reiniciar página de observaciones al cambiar filtros
  useEffect(() => {
    setPaginaObs(1);
  }, [fechaFiltro, colegioFiltro]);

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
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verificando credenciales de cocina...</p>
      </div>
    );
  }

  if (!esAdmin) {
    return <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el personal de cocina de Placeres Culinarios." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Barra superior de estado de cocina */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                <Radio className="w-3 h-3 animate-pulse" /> TIEMPO REAL ACTIVO
              </span>
              <span className="text-xs text-slate-400">
                Actualizado: {ultimaActualizacion || '--:--'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <ChefHat className="w-8 h-8 text-orange-500" />
              Consolidado de Cocina
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cargarDatos}
              disabled={cargando}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </div>
        </div>

        {/* Selector de Calendario y Fechas (Hoy, Ayer, etc.) */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-400" /> Menú de Cocina:
            </span>
            <span className="font-black text-amber-300 capitalize text-sm">
              {formatearFechaLegible(fechaFiltro)}
              {fechaFiltro === fechaHoy && (
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/30">
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Ver día anterior (ayer)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Input nativo de Calendario */}
            <input
              type="date"
              value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value || fechaHoy)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden cursor-pointer"
              title="Seleccionar fecha para consultar cocina"
            />

            {/* Botón Día Siguiente */}
            <button
              type="button"
              onClick={() => cambiarDia(1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Ver día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Botón rápido HOY */}
            <button
              type="button"
              onClick={() => setFechaFiltro(fechaHoy)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                fechaFiltro === fechaHoy
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Hoy
            </button>

            {/* Botón Ver Todas las Fechas */}
            <button
              type="button"
              onClick={() => setFechaFiltro('TODAS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                fechaFiltro === 'TODAS'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Filtro por Institución Educativa */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar por:
          </span>
          {!esSuperAdmin && usuario?.colegioNombre ? (
            <span className="px-3 py-1.5 rounded-xl font-black bg-orange-500 text-white shadow-sm flex items-center gap-1.5">
              🏫 Sede Asignada: {usuario.colegioNombre}
            </span>
          ) : (
            ['TODOS', ...colegios].map((c) => (
              <button
                key={c}
                onClick={() => setColegioFiltro(c)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  colegioFiltro === c
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Aviso de pedidos pendientes de validación en Despacho */}
      {pedidosPendientesDespacho.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⏳</span>
            <span>
              Hay <strong>{pedidosPendientesDespacho.length} pedido(s) pendiente(s) de verificación en Despacho</strong>. Pasarán automáticamente a Cocina en cuanto el administrador valide el pago.
            </span>
          </div>
          <Link
            href="/despacho"
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
            {fechaFiltro === fechaHoy ? 'Aceptados para hoy' : `Para ${formatearFechaLegible(fechaFiltro)}`}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">Pendientes en Despacho</span>
          <span className="text-3xl font-black text-rose-600 tracking-tight block mt-1">
            {pedidosPendientesDespacho.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Esperando confirmación</span>
        </div>
      </div>

      {/* SECCIÓN 1: CONSOLIDADO DE ENTRADAS Y SEGUNDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
      </div>

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
            {obsPaginadas.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3.5 border border-amber-300 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-900">{p.estudianteNombre}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                    {p.gradoSeccion}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{p.colegioNombre}</p>
                <div className="text-xs text-slate-700">
                  <span className="text-orange-600 font-semibold">{p.entradaNombre}</span> +{' '}
                  <span className="text-slate-800 font-semibold">{p.segundoNombre}</span>
                </div>
                <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-1.5">
                  <span className="shrink-0">⚠️</span>
                  <span>{p.observacion}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
