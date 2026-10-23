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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { SkeletonAnalyticsPage } from '@/components/Skeleton';

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
      `Colegio: ${colegioSeleccionado === 'todos' ? 'Todos los Colegios' : colegioSeleccionado}`,
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

  if (cargandoAuth) {
    return <SkeletonAnalyticsPage />;
  }

  if (!esSuperAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-zinc-400">
        Verificando permisos de Super Administrador...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28">
      {/* CABECERA SUPERIOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[11px] font-semibold text-zinc-700 bg-zinc-100 border-zinc-200">
              Super Admin • Business Intelligence
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-zinc-900" />
            Analítica y Toma de Decisiones
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Métricas estratégicas consolidadas para planificar compras de insumos, rotación de menús y cobranza.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            onClick={exportarReporteCSV}
            disabled={!metricas}
            variant="default"
            size="sm"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs"
            title="Descargar informe completo en Excel/CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </Button>

          <Button
            type="button"
            onClick={cargarMetricas}
            variant="outline"
            size="icon"
            title="Refrescar métricas"
          >
            <RotateCcw className="w-4 h-4 text-zinc-600" />
          </Button>
        </div>
      </div>

      {/* BARRA DE FILTROS: PERÍODO Y COLEGIOS */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Selector de Período */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-zinc-500 mr-1 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-zinc-700" /> Período:
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    activo
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Selector de Colegio */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1 shrink-0">
              <Building2 className="w-4 h-4 text-zinc-500" />
              Colegio:
            </label>
            <select
              value={colegioSeleccionado}
              onChange={(e) => setColegioSeleccionado(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 max-w-xs truncate"
            >
              <option value="todos">Todos los Colegios (Consolidado)</option>
              {listaColegios.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {cargando ? (
        <SkeletonAnalyticsPage />
      ) : !metricas ? (
        <div className="py-16 text-center text-xs text-zinc-500">No se pudieron cargar las métricas.</div>
      ) : (
        <div className="space-y-6">
          {/* 1. CUATRO KPIS PRINCIPALES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Ventas Totales */}
            <Card className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border-emerald-200/80 hover:border-emerald-300 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Ventas Totales
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-2xs flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-950 font-mono tracking-tight">
                  S/ {metricas.ventasTotales.toFixed(2)}
                </div>
                <p className="text-xs text-emerald-700/80 font-medium mt-1">
                  {metricas.totalPedidos} almuerzos activos
                </p>
              </CardContent>
            </Card>

            {/* Total Raciones */}
            <Card className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/30 border-blue-200/80 hover:border-blue-300 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Raciones Totales
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 border border-blue-200/60 shadow-2xs flex items-center justify-center">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-blue-950 tracking-tight">
                  {metricas.totalPedidos}
                </div>
                <p className="text-xs text-blue-700/80 font-medium mt-1">
                  {metricas.pedidosEntregados} entregadas ({metricas.totalPedidos > 0 ? Math.round((metricas.pedidosEntregados / metricas.totalPedidos) * 100) : 0}%)
                </p>
              </CardContent>
            </Card>

            {/* Tasa de Cobranza */}
            <Card className="bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/30 border-amber-200/80 hover:border-amber-300 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                    Tasa de Cobranza
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-200/60 shadow-2xs flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-950 tracking-tight">
                  {metricas.tasaCobranzaPorcentaje}%
                </div>
                <p className="text-xs text-amber-800/80 font-medium mt-1">
                  {metricas.pedidosPagados} pagados • {metricas.pedidosPendientesPago} por cobrar
                </p>
              </CardContent>
            </Card>

            {/* Ticket Promedio */}
            <Card className="bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/30 border-purple-200/80 hover:border-purple-300 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                    Ticket Promedio
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 border border-purple-200/60 shadow-2xs flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-purple-950 font-mono tracking-tight">
                  S/ {metricas.ticketPromedio.toFixed(2)}
                </div>
                <p className="text-xs text-purple-700/80 font-medium mt-1">Por ración de almuerzo</p>
              </CardContent>
            </Card>
          </div>

          {/* 2. PREFERENCIAS GASTRONÓMICAS: TOP PLATOS & MENOR DEMANDA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Platos Más Solicitados (Platos Estrella) */}
            <Card className="border-amber-200/80 bg-gradient-to-b from-amber-50/30 via-white to-white">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-amber-100/60">
                <CardTitle className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 border border-amber-200/60 flex items-center justify-center">
                    <Award className="w-4 h-4 text-amber-700" />
                  </div>
                  Platos Estrella (Mayor Demanda)
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200 font-semibold">Top 5</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {metricas.platosTop.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-6 text-center">Sin pedidos registrados en este período.</p>
                ) : (
                  <div className="space-y-3">
                    {metricas.platosTop.map((plato, idx) => {
                      return (
                        <div key={plato.nombre} className="p-3 bg-amber-50/40 rounded-lg border border-amber-200/60">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-md font-bold text-xs flex items-center justify-center shrink-0 bg-amber-200 text-amber-900">
                                {idx + 1}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                                {plato.nombre}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-amber-950 shrink-0 ml-2">
                              {plato.pedidos} pedidos ({plato.porcentaje}%)
                            </span>
                          </div>
                          <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(5, plato.porcentaje))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platos con Menor Demanda (Optimización de Menús) */}
            <Card className="border-rose-200/80 bg-gradient-to-b from-rose-50/30 via-white to-white">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-rose-100/60">
                <CardTitle className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-700 border border-rose-200/60 flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-rose-700" />
                  </div>
                  Optimización de Menú (Menor Salida)
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-rose-50 text-rose-800 border-rose-200 font-semibold">Evaluar reemplazo</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {metricas.platosMenorDemanda.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-6 text-center">Sin datos suficientes.</p>
                ) : (
                  <div className="space-y-2.5">
                    {metricas.platosMenorDemanda.map((plato) => (
                      <div
                        key={plato.nombre}
                        className="p-3 bg-rose-50/40 rounded-lg border border-rose-200/60 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="text-xs font-semibold text-zinc-900 truncate">{plato.nombre}</h4>
                          <span className="text-[11px] text-zinc-500">Baja rotación en el período</span>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0 font-medium bg-rose-100 text-rose-800 border-rose-200">
                          {plato.pedidos} pedidos
                        </Badge>
                      </div>
                    ))}
                    <p className="text-[11px] text-zinc-500 pt-2 leading-relaxed italic">
                      💡 Sugerencia: Reformular ingredientes o sustituir estas opciones en la carta escolar semanal para reducir mermas en cocina.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 3. MÉTODOS DE PAGO Y DEMANDA SEMANAL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Desglose por Método de Pago */}
            <Card className="border-indigo-200/80 bg-gradient-to-b from-indigo-50/30 via-white to-white">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-indigo-100/60">
                <CardTitle className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200/60 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-indigo-700" />
                  </div>
                  Métodos de Pago Utilizados
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold">Participación</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {Object.entries(metricas.metodosPago).map(([metodo, data]) => {
                    return (
                      <div key={metodo} className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-200/60">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-zinc-900">{metodo}</span>
                          <div className="text-right">
                            <span className="text-xs font-bold text-indigo-950">
                              {data.cantidad} ({data.porcentaje}%)
                            </span>
                            <span className="text-[11px] text-indigo-700 ml-1.5 font-mono font-medium">
                              S/ {data.totalMonto.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, data.porcentaje)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Demanda por Día de la Semana */}
            <Card className="border-sky-200/80 bg-gradient-to-b from-sky-50/30 via-white to-white">
              <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-sky-100/60">
                <CardTitle className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-sky-100 text-sky-700 border border-sky-200/60 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-sky-700" />
                  </div>
                  Demanda por Día de la Semana
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-sky-50 text-sky-800 border-sky-200 font-semibold">Planificación de compras</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {Object.entries(metricas.demandaPorDiaSemana).map(([dia, cantidad]) => {
                    const maxDemanda = Math.max(...Object.values(metricas.demandaPorDiaSemana), 1);
                    const pct = Math.round((cantidad / maxDemanda) * 100);

                    return (
                      <div key={dia} className="p-3 bg-sky-50/40 rounded-lg border border-sky-200/60">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-zinc-900">{dia}</span>
                          <span className="text-xs font-bold text-sky-950">
                            {cantidad} almuerzos
                          </span>
                        </div>
                        <div className="w-full bg-sky-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(cantidad > 0 ? 8 : 0, pct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-zinc-500 pt-1 leading-relaxed">
                    Permite predecir la carga de trabajo en cocina y adquirir insumos perecibles en el mercado mayorista en las cantidades exactas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. COMPARATIVA POR COLEGIO */}
          <Card className="border-purple-200/80 bg-gradient-to-b from-purple-50/20 via-white to-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-purple-100/60">
              <CardTitle className="text-sm font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 border border-purple-200/60 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-700" />
                </div>
                Desglose y Comparativa por Colegio
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-800 border-purple-200 font-semibold">
                {metricas.metricasPorColegio.length} colegios
              </Badge>
            </CardHeader>
            <CardContent>
              {metricas.metricasPorColegio.length === 0 ? (
                <p className="text-xs text-zinc-400 py-6 text-center">No hay colegios registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Institución Educativa</TableHead>
                        <TableHead className="text-center">Raciones</TableHead>
                        <TableHead className="text-right">Facturado (S/.)</TableHead>
                        <TableHead className="text-center">Entregados</TableHead>
                        <TableHead className="text-center">Cobranza</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metricas.metricasPorColegio.map((col) => {
                        const pctCobranza =
                          col.totalPedidos > 0 ? Math.round((col.pagados / col.totalPedidos) * 100) : 100;
                        return (
                          <TableRow key={col.colegioNombre}>
                            <TableCell className="font-semibold text-zinc-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-zinc-900 shrink-0" />
                              {col.colegioNombre}
                            </TableCell>
                            <TableCell className="text-center font-medium text-zinc-800">
                              {col.totalPedidos}
                            </TableCell>
                            <TableCell className="text-right font-bold text-zinc-950 font-mono">
                              S/ {col.totalVentas.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center text-zinc-600">
                              {col.entregados} / {col.totalPedidos}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={pctCobranza >= 85 ? 'success' : 'warning'}
                                className="text-[11px]"
                              >
                                {pctCobranza}% al día
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
