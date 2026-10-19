'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  UtensilsCrossed,
  Receipt,
  Building2,
  Calendar,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  CreditCard,
  ChefHat,
  PackageCheck,
  ArrowLeft,
  PieChart,
  BarChart3,
  Layers,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';

type PeriodoFiltro = 'HOY' | 'SEMANA' | 'MES' | 'HISTORICO';

export default function SuperadminAnalyticsPage() {
  const router = useRouter();
  const { esSuperAdmin, cargando: cargandoAuth } = useAuth();

  const [periodo, setPeriodo] = useState<PeriodoFiltro>('HISTORICO');
  const [colegioSeleccionado, setColegioSeleccionado] = useState<string>('todos');
  const [listaColegios, setListaColegios] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  // Datos calculados de analítica
  const [metricas, setMetricas] = useState<{
    ventasTotales: number;
    totalPedidos: number;
    pedidosEntregados: number;
    pedidosCancelados: number;
    pedidosPagados: number;
    pedidosPendientesPago: number;
    tasaCobranzaPorcentaje: number;
    ticketPromedio: number;
    platosTop: Array<{ nombre: string; pedidos: number; porcentaje: number; tipo: string }>;
    platosMenorDemanda: Array<{ nombre: string; pedidos: number }>;
    metodosPago: Record<string, { cantidad: number; porcentaje: number; totalMonto: number }>;
    demandaPorDiaSemana: Record<string, number>;
    metricasPorColegio: Array<{
      colegioNombre: string;
      totalPedidos: number;
      totalVentas: number;
      entregados: number;
      pagados: number;
    }>;
  } | null>(null);

  // Proteger acceso: exclusivo para Super Administrador
  useEffect(() => {
    if (!cargandoAuth && !esSuperAdmin) {
      router.replace('/admin');
    }
  }, [esSuperAdmin, cargandoAuth, router]);

  // Cargar lista de colegios
  useEffect(() => {
    let montado = true;
    dataService.obtenerColegios().then((cols) => {
      if (!montado) return;
      setListaColegios(cols || []);
    });
    return () => {
      montado = false;
    };
  }, []);

  // Cargar métricas según filtros
  const cargarMetricas = async () => {
    setCargando(true);
    try {
      const data = await dataService.obtenerMetricasAnalytics({
        periodo,
        colegioNombre: colegioSeleccionado === 'todos' ? undefined : colegioSeleccionado,
      });
      setMetricas(data);
    } catch (err) {
      console.error('Error cargando analítica:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (esSuperAdmin) {
      cargarMetricas();
    }
    const desuscribir = dataService.suscribirCambios(() => {
      cargarMetricas();
    });
    return () => desuscribir();
  }, [periodo, colegioSeleccionado, esSuperAdmin]);

  // Exportar datos a CSV
  const exportarReporteCSV = () => {
    if (!metricas) return;
    const lineas = [
      'REPORTE DE ANALITICA Y METRICAS - PLACERES CULINARIOS',
      `Fecha de Generacion: ${new Date().toLocaleString('es-PE')}`,
      `Periodo: ${periodo}`,
      `Sede: ${colegioSeleccionado === 'todos' ? 'Todas las Sedes' : colegioSeleccionado}`,
      '',
      'RESUMEN GENERAL',
      `Ventas Totales (S/.),${metricas.ventasTotales.toFixed(2)}`,
      `Total Raciones,${metricas.totalPedidos}`,
      `Raciones Entregadas,${metricas.pedidosEntregados}`,
      `Raciones Canceladas,${metricas.pedidosCancelados}`,
      `Pedidos Pagados,${metricas.pedidosPagados}`,
      `Pedidos Pendientes de Pago,${metricas.pedidosPendientesPago}`,
      `Tasa de Cobranza,${metricas.tasaCobranzaPorcentaje}%`,
      `Ticket Promedio (S/.),${metricas.ticketPromedio.toFixed(2)}`,
      '',
      'PLATOS MAS SOLICITADOS',
      'Plato,Tipo,Pedidos,Porcentaje',
      ...metricas.platosTop.map((p) => `"${p.nombre}","${p.tipo}",${p.pedidos},${p.porcentaje}%`),
      '',
      'METODOS DE PAGO',
      'Metodo,Cantidad,Porcentaje,Total (S/.)',
      ...Object.entries(metricas.metodosPago).map(
        ([metodo, info]) => `"${metodo}",${info.cantidad},${info.porcentaje}%,${info.totalMonto.toFixed(2)}`
      ),
      '',
      'DEMANDA SEMANAL',
      'Dia,Raciones',
      ...Object.entries(metricas.demandaPorDiaSemana).map(([dia, cant]) => `"${dia}",${cant}`),
      '',
      'DESGLOSE POR COLEGIO',
      'Colegio,Raciones Totales,Ventas Totales (S/.),Entregados,Pagados',
      ...metricas.metricasPorColegio.map(
        (c) => `"${c.colegioNombre}",${c.totalPedidos},${c.totalVentas.toFixed(2)},${c.entregados},${c.pagados}`
      ),
    ];

    const blob = new Blob(['\uFEFF' + lineas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analitica_Placeres_Culinarios_${periodo}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cargandoAuth || !esSuperAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
        Verificando permisos de Super Administrador...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* CABECERA SUPERIOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
              Super Admin • Business Intelligence
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Analítica y Toma de Decisiones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Métricas estratégicas consolidadas para planificar compras de insumos, rotación de menús y cobranza.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={exportarReporteCSV}
            disabled={!metricas}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Descargar informe completo en Excel/CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={cargarMetricas}
            className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 shadow-xs transition cursor-pointer"
            title="Refrescar métricas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS: PERÍODO Y COLEGIOS */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Selector de Período */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-purple-600" /> Período:
          </span>
          {(
            [
              { key: 'HOY', label: 'Hoy' },
              { key: 'SEMANA', label: 'Últimos 7 días' },
              { key: 'MES', label: 'Últimos 30 días' },
              { key: 'HISTORICO', label: 'Histórico Total' },
            ] as const
          ).map((item) => {
            const activo = periodo === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriodo(item.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  activo
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Selector de Colegio */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1 shrink-0">
            <Building2 className="w-4 h-4 text-purple-600" />
            Sede:
          </label>
          <select
            value={colegioSeleccionado}
            onChange={(e) => setColegioSeleccionado(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-hidden max-w-xs truncate"
          >
            <option value="todos">Todas las Sedes (Consolidado)</option>
            {listaColegios.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-medium">Analizando datos y métricas del sistema...</p>
        </div>
      ) : !metricas ? (
        <div className="py-16 text-center text-xs text-slate-400">No se pudieron cargar las métricas.</div>
      ) : (
        <div className="space-y-6">
          {/* 1. CUATRO KPIS PRINCIPALES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Ventas Totales */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ventas Totales
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
                S/ {metricas.ventasTotales.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {metricas.totalPedidos} almuerzos activos
              </p>
            </div>

            {/* Total Raciones */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Raciones Totales
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {metricas.totalPedidos}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {metricas.pedidosEntregados} entregadas ({metricas.totalPedidos > 0 ? Math.round((metricas.pedidosEntregados / metricas.totalPedidos) * 100) : 0}%)
              </p>
            </div>

            {/* Tasa de Cobranza */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tasa de Cobranza
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight">
                {metricas.tasaCobranzaPorcentaje}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {metricas.pedidosPagados} pagados • {metricas.pedidosPendientesPago} por cobrar
              </p>
            </div>

            {/* Ticket Promedio */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ticket Promedio
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                S/ {metricas.ticketPromedio.toFixed(2)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Por ración de almuerzo</p>
            </div>
          </div>

          {/* 2. PREFERENCIAS GASTRONÓMICAS: TOP PLATOS & MENOR DEMANDA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Platos Más Solicitados (Platos Estrella) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Platos Estrella (Mayor Demanda)
                </h3>
                <span className="text-[11px] font-bold text-slate-400">Top 5</span>
              </div>

              {metricas.platosTop.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Sin pedidos registrados en este período.</p>
              ) : (
                <div className="space-y-3">
                  {metricas.platosTop.map((plato, idx) => {
                    const coloresMedalla = [
                      'from-amber-400 to-yellow-500 text-white',
                      'from-slate-300 to-slate-400 text-slate-800',
                      'from-amber-700 to-orange-800 text-white',
                    ];
                    return (
                      <div key={plato.nombre} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                                idx < 3
                                  ? `bg-gradient-to-tr ${coloresMedalla[idx]} shadow-xs`
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm font-black text-slate-800 truncate">
                              {plato.nombre}
                            </span>
                          </div>
                          <span className="text-xs font-black text-purple-700 shrink-0 ml-2">
                            {plato.pedidos} pedidos ({plato.porcentaje}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, plato.porcentaje))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platos con Menor Demanda (Optimización de Menús) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-orange-500" />
                  Optimización de Menú (Menor Salida)
                </h3>
                <span className="text-[11px] font-bold text-slate-400">Evaluar reemplazo</span>
              </div>

              {metricas.platosMenorDemanda.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Sin datos suficientes.</p>
              ) : (
                <div className="space-y-2.5">
                  {metricas.platosMenorDemanda.map((plato) => (
                    <div
                      key={plato.nombre}
                      className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{plato.nombre}</h4>
                        <span className="text-[10px] text-slate-400">Baja rotación en el período</span>
                      </div>
                      <span className="text-xs font-bold text-slate-600 px-2.5 py-1 bg-white rounded-xl border border-slate-200 shrink-0">
                        {plato.pedidos} pedidos
                      </span>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400 pt-2 leading-relaxed italic">
                    💡 Sugerencia: Reformular ingredientes o sustituir estas opciones en la carta escolar semanal para reducir mermas en cocina.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. MÉTODOS DE PAGO Y DEMANDA SEMANAL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Desglose por Método de Pago */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  Métodos de Pago Utilizados
                </h3>
                <span className="text-[11px] font-bold text-slate-400">Participación</span>
              </div>

              <div className="space-y-3">
                {Object.entries(metricas.metodosPago).map(([metodo, data]) => {
                  const estilos = {
                    Yape: 'bg-purple-50 border-purple-200 text-purple-900 bar:from-purple-500 bar:to-purple-600',
                    Plin: 'bg-sky-50 border-sky-200 text-sky-900 bar:from-sky-500 bar:to-sky-600',
                    'Pagar luego': 'bg-amber-50 border-amber-200 text-amber-900 bar:from-amber-500 bar:to-amber-600',
                    Efectivo: 'bg-emerald-50 border-emerald-200 text-emerald-900 bar:from-emerald-500 bar:to-emerald-600',
                  }[metodo] || 'bg-slate-50 border-slate-200 text-slate-900';

                  return (
                    <div key={metodo} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-800">{metodo}</span>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900">
                            {data.cantidad} ({data.porcentaje}%)
                          </span>
                          <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                            S/ {data.totalMonto.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, data.porcentaje)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demanda por Día de la Semana */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Demanda por Día de la Semana
                </h3>
                <span className="text-[11px] font-bold text-slate-400">Planificación de compras</span>
              </div>

              <div className="space-y-3">
                {Object.entries(metricas.demandaPorDiaSemana).map(([dia, cantidad]) => {
                  const maxDemanda = Math.max(...Object.values(metricas.demandaPorDiaSemana), 1);
                  const pct = Math.round((cantidad / maxDemanda) * 100);

                  return (
                    <div key={dia} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-800">{dia}</span>
                        <span className="text-xs font-black text-emerald-700">
                          {cantidad} almuerzos
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(cantidad > 0 ? 8 : 0, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                  Permite predecir la carga de trabajo en cocina y adquirir insumos perecibles en el mercado mayorista en las cantidades exactas.
                </p>
              </div>
            </div>
          </div>

          {/* 4. COMPARATIVA POR COLEGIO */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                Desglose y Comparativa por Colegio
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                {metricas.metricasPorColegio.length} sedes
              </span>
            </div>

            {metricas.metricasPorColegio.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No hay colegios registrados.</p>
            ) : (
              <div className="overflow-x-auto -mx-5 sm:mx-0">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-4 font-bold">Institución Educativa</th>
                      <th className="py-2.5 px-4 font-bold text-center">Raciones</th>
                      <th className="py-2.5 px-4 font-bold text-right">Facturado (S/.)</th>
                      <th className="py-2.5 px-4 font-bold text-center">Entregados</th>
                      <th className="py-2.5 px-4 font-bold text-center">Cobranza</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metricas.metricasPorColegio.map((col) => {
                      const pctCobranza =
                        col.totalPedidos > 0 ? Math.round((col.pagados / col.totalPedidos) * 100) : 100;
                      return (
                        <tr key={col.colegioNombre} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            {col.colegioNombre}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {col.totalPedidos}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-emerald-700 font-mono">
                            S/ {col.totalVentas.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-600">
                            {col.entregados} / {col.totalPedidos}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                pctCobranza >= 85
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {pctCobranza}% al día
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
      )}
    </div>
  );
}
