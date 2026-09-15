'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { dataService, COLEGIOS_DEFAULT } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import { Pedido, ResumenCocina } from '@/types';

export default function CocinaPage() {
  const { esAdmin, cargando: cargandoAuth } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [colegioFiltro, setColegioFiltro] = useState<string>('TODOS');
  const [cargando, setCargando] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const data = await dataService.obtenerPedidos();
      setPedidos(data);
      setUltimaActualizacion(new Date().toLocaleTimeString());
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

  // Filtrar pedidos si se seleccionó un colegio específico
  const pedidosFiltrados = colegioFiltro === 'TODOS'
    ? pedidos
    : pedidos.filter((p) => p.colegioNombre === colegioFiltro);

  const resumen: ResumenCocina = dataService.calcularResumenCocina(pedidosFiltrados);

  // Extraer todas las observaciones críticas
  const pedidosConObs = pedidosFiltrados.filter(
    (p) => p.observacion && p.observacion.trim().length > 0
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

        {/* Filtro por Institución Educativa */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar por:
          </span>
          {['TODOS', ...COLEGIOS_DEFAULT].map((c) => (
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
          ))}
        </div>
      </div>

      {/* KPI Cards de Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Almuerzos</span>
          <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">
            {resumen.totalPedidos}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Para el día de hoy</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">Con Observaciones</span>
          <span className="text-3xl font-black text-amber-600 tracking-tight block mt-1">
            {resumen.pedidosConObservacion}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Dietas o alergias</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Pagos Verificados</span>
          <span className="text-3xl font-black text-emerald-600 tracking-tight block mt-1">
            {resumen.pedidosPagados}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Yape / Plin confirmado</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">Pagos Pendientes</span>
          <span className="text-3xl font-black text-rose-600 tracking-tight block mt-1">
            {resumen.pedidosPendientesPago}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Por verificar en caja</span>
        </div>
      </div>

      {/* SECCIÓN 1: CONSOLIDADO DE ENTRADAS Y SEGUNDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* PANEL ENTRADAS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Consolidado de Entradas
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-xl">
              {resumen.entradas.reduce((acc, curr) => acc + curr.cantidad, 0)} porciones
            </span>
          </div>

          <div className="space-y-3">
            {resumen.entradas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No hay pedidos registrados aún.</p>
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
              <p className="text-xs text-slate-400 text-center py-6">No hay pedidos registrados aún.</p>
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
        <div className="flex items-center justify-between mb-4">
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
          <span className="text-xs font-black bg-amber-200 text-amber-900 px-3 py-1 rounded-full">
            {pedidosConObs.length} Alertas
          </span>
        </div>

        {pedidosConObs.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-xs text-slate-500">
            ✓ No hay observaciones especiales para los pedidos actuales.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pedidosConObs.map((p) => (
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
