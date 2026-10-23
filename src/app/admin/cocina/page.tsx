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
  School,
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
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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

  if (cargandoAuth || (cargando && pedidos.length === 0)) {
    return <SkeletonDashboardPage />;
  }

  if (!esAdmin) {
    return <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el personal de cocina de Placeres Culinarios." />;
  }

  if (!esSuperAdmin && !usuario?.colegioNombre) {
    return <AccesoRestringido mensaje="Tu cuenta de administrador no tiene un colegio activo asignado. Contacta al Super Administrador." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Barra de Estado y Sincronización (el título ya se muestra en la barra superior blanca del navbar) */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-medium border-emerald-200 bg-emerald-50/50 text-emerald-800">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>TIEMPO REAL ACTIVO</span>
            <span className="text-zinc-400 font-normal">| {ultimaActualizacion || '--:--'}</span>
          </Badge>

          {!esSuperAdmin && usuario?.colegioNombre && (
            <span className="hidden">
              🏫 Colegio: {usuario.colegioNombre}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={cargarDatos}
          disabled={cargando}
          className="gap-1.5 h-8 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          Refrescar
        </Button>
      </div>

      {/* Barra de Filtros y Navegación de Fechas Unificada */}
      <Card className="mb-6">
        <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-700" /> Menú de Cocina:
            </span>
            <span className="font-bold text-zinc-950 capitalize">
              {formatearFechaLegible(fechaFiltro)}
            </span>
            {fechaFiltro === fechaHoy && (
              <Badge variant="success" className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold">
                Hoy
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Navegación Día Anterior */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => cambiarDia(-1)}
              title="Ver día anterior (ayer)"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Input nativo de Calendario */}
            <input
              type="date"
              value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
              onChange={(e) => {
                setFechaFiltro(e.target.value || fechaHoy);
                setPaginaObs(1);
              }}
              className="h-8 bg-white border border-zinc-200 text-zinc-800 text-xs font-medium rounded-md px-2.5 focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 focus:outline-hidden cursor-pointer shadow-2xs"
              title="Seleccionar fecha para consultar cocina"
            />

            {/* Navegación Día Siguiente */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => cambiarDia(1)}
              title="Ver día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Botón rápido HOY */}
            <Button
              type="button"
              variant={fechaFiltro === fechaHoy ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => {
                setFechaFiltro(fechaHoy);
                setPaginaObs(1);
              }}
            >
              Hoy
            </Button>

            {/* Botón Ver Histórico */}
            <Button
              type="button"
              variant={fechaFiltro === 'TODAS' ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => {
                setFechaFiltro('TODAS');
                setPaginaObs(1);
              }}
            >
              Histórico
            </Button>
          </div>
        </div>

        {/* Filtro por Institución Educativa: Exclusivo Superadmin */}
        {esSuperAdmin && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar por Colegio:
            </span>
            {['TODOS', ...colegios].map((c) => (
              <Button
                key={c}
                type="button"
                variant={colegioActivo === c ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => {
                  setColegioFiltro(c);
                  setPaginaObs(1);
                }}
              >
                {c}
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Aviso de pedidos pendientes de pago o validación */}
      {pedidosPendientesPago.length > 0 && (
        <div className="mb-6 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Hay <strong>{pedidosPendientesPago.length} pedido(s) con pago por cobrar o validar</strong>. Ya están incluidos en el consolidado de cocina para su preparación.
          </span>
        </div>
      )}

      {/* KPI Cards de Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Almuerzos a Cocinar"
          value={resumen.totalPedidos}
          subtext="Órdenes confirmadas"
          icon={Utensils}
          variant="default"
        />

        <StatCard
          label="Con Observaciones"
          value={resumen.pedidosConObservacion}
          subtext="Dietas o preferencias"
          icon={AlertTriangle}
          variant={resumen.pedidosConObservacion > 0 ? "warning" : "default"}
        />

        <StatCard
          label="Pagos Verificados"
          value={resumen.pedidosPagados}
          subtext={fechaFiltro === fechaHoy ? "Pagados para hoy" : `Para ${formatearFechaLegible(fechaFiltro)}`}
          icon={CheckCircle}
          variant="success"
        />

        <StatCard
          label="Pendientes de Pago"
          value={resumen.pedidosPendientesPago}
          subtext="Por cobrar o validar"
          icon={Clock}
          variant={resumen.pedidosPendientesPago > 0 ? "destructive" : "default"}
        />
      </div>

      {/* SECCIÓN 1: CONSOLIDADO DE ENTRADAS Y SEGUNDOS */}
      <div className={`grid grid-cols-1 ${resumen.ensaladas && resumen.ensaladas.length > 0 ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'} gap-6 mb-8`}>
        {/* PANEL ENTRADAS */}
        <Card className="flex flex-col justify-between border-amber-200/80 bg-gradient-to-b from-amber-50/25 via-white to-white shadow-xs">
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-amber-100/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 border border-orange-200/60 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-zinc-950">
                    Consolidado de Sopas o Postres
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Raciones de entrada requeridas
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="font-semibold text-xs bg-amber-100 text-amber-800 border-amber-200">
                {resumen.entradas.reduce((acc, curr) => acc + curr.cantidad, 0)} porciones
              </Badge>
            </CardHeader>

            <CardContent className="pt-4">
              {resumen.entradas.length === 0 ? (
                <EmptyState
                  title="Sin raciones de entrada"
                  description={`No hay pedidos de sopas o postres para ${formatearFechaLegible(fechaFiltro)}.`}
                  className="py-8 border-none bg-transparent"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-zinc-500">Plato / Descripción</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-zinc-500 w-24">Raciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumen.entradas.map((item) => (
                      <TableRow key={item.plato} className="border-b border-zinc-100/70 hover:bg-zinc-50/50">
                        <TableCell className="font-semibold text-zinc-900 py-3 text-sm">
                          {item.plato}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Badge variant="outline" className="font-bold text-sm px-2.5 py-0.5 bg-zinc-50 text-zinc-950 border-zinc-200">
                            {item.cantidad}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </div>
        </Card>

        {/* PANEL SEGUNDOS / PLATOS DE FONDO */}
        <Card className="flex flex-col justify-between border-rose-200/80 bg-gradient-to-b from-rose-50/25 via-white to-white shadow-xs">
          <div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-rose-100/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 border border-rose-200/60 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-zinc-950">
                    Consolidado de Segundos
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Platos de fondo a preparar
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="font-semibold text-xs bg-rose-100 text-rose-800 border-rose-200">
                {resumen.segundos.reduce((acc, curr) => acc + curr.cantidad, 0)} porciones
              </Badge>
            </CardHeader>

            <CardContent className="pt-4">
              {resumen.segundos.length === 0 ? (
                <EmptyState
                  title="Sin platos de fondo"
                  description={`No hay pedidos de segundo para ${formatearFechaLegible(fechaFiltro)}.`}
                  className="py-8 border-none bg-transparent"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-zinc-500">Plato / Descripción</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-zinc-500 w-24">Raciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumen.segundos.map((item) => (
                      <TableRow key={item.plato} className="border-b border-zinc-100/70 hover:bg-zinc-50/50">
                        <TableCell className="font-semibold text-zinc-900 py-3 text-sm">
                          {item.plato}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Badge variant="outline" className="font-bold text-sm px-2.5 py-0.5 bg-zinc-50 text-zinc-950 border-zinc-200">
                            {item.cantidad}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </div>
        </Card>

        {/* PANEL ENSALADAS */}
        {resumen.ensaladas && resumen.ensaladas.length > 0 && (
          <Card className="flex flex-col justify-between border-emerald-200/80 bg-gradient-to-b from-emerald-50/25 via-white to-white shadow-xs">
            <div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-emerald-100/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                    <Salad className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-zinc-950">
                      Consolidado de Ensaladas
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                      Porciones frescas solicitadas
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="font-semibold text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
                  {resumen.ensaladas.reduce((acc, curr) => acc + curr.cantidad, 0)} porciones
                </Badge>
              </CardHeader>

              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-zinc-500">Ensalada</TableHead>
                      <TableHead className="text-right text-xs font-semibold text-zinc-500 w-24">Raciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumen.ensaladas.map((item) => (
                      <TableRow key={item.plato} className="border-b border-zinc-100/70 hover:bg-zinc-50/50">
                        <TableCell className="font-semibold text-zinc-900 py-3 text-sm">
                          {item.plato}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Badge variant="outline" className="font-bold text-sm px-2.5 py-0.5 bg-zinc-50 text-zinc-950 border-zinc-200">
                            {item.cantidad}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </div>
          </Card>
        )}
      </div>

      {/* SECCIÓN 1.5: DESGLOSE INDEPENDIENTE DE ALMUERZOS POR CADA COLEGIO (Exclusivo Superadmin) */}
      {esSuperAdmin && resumen.porColegio && resumen.porColegio.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-zinc-950 flex items-center gap-2">
              <School className="w-5 h-5 text-zinc-700" />
              Almuerzos Independientes por Colegio
            </h2>
            <Badge variant="outline" className="text-xs font-semibold">
              {resumen.porColegio.length} colegios con pedidos
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumen.porColegio.map((col) => (
              <Card key={col.colegioNombre} className="flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono font-bold text-xs">
                          {col.identificador}
                        </Badge>
                        <span className="font-bold text-zinc-950 text-sm">{col.colegioNombre}</span>
                      </div>
                      <Badge variant="success" className="text-xs font-bold">
                        {col.totalPedidos} almuerzos
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-3 space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider block mb-1.5">
                        Platos de Fondo (Segundos):
                      </span>
                      <div className="space-y-1.5">
                        {col.segundos.map((s) => (
                          <div
                            key={s.plato}
                            className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100"
                          >
                            <span className="font-medium text-zinc-800">{s.plato}</span>
                            <Badge variant="outline" className="bg-white font-bold text-xs">
                              {s.cantidad}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {col.entradas.length > 0 && (
                      <div className="pt-2 border-t border-zinc-100">
                        <span className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider block mb-1.5">
                          Sopas o Postres:
                        </span>
                        <div className="space-y-1.5">
                          {col.entradas.map((e) => (
                            <div
                              key={e.plato}
                              className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100"
                            >
                              <span className="font-medium text-zinc-800">{e.plato}</span>
                              <Badge variant="outline" className="bg-white font-bold text-xs">
                                {e.cantidad}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: ALERTA DE OBSERVACIONES CRÍTICAS (NO MÁS FONDOS AMARILLOS GIGANTES) */}
      <Card className="mb-8 border-amber-200/80 bg-gradient-to-b from-amber-50/20 via-white to-white shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-200/60 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-zinc-950">
                Observaciones y Dietas Especiales
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Alergias, restricciones alimenticias y notas personalizadas de los alumnos
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant={totalObs > 0 ? "warning" : "secondary"} className="font-semibold">
              {totalObs} Alertas
            </Badge>
            {totalPaginasObs > 1 && (
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1">
                <span className="text-xs font-medium text-zinc-600 mr-1">
                  Pág. {paginaValidaObs} de {totalPaginasObs}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setPaginaObs((prev) => Math.max(1, prev - 1))}
                  disabled={paginaValidaObs <= 1}
                  title="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setPaginaObs((prev) => Math.min(totalPaginasObs, prev + 1))}
                  disabled={paginaValidaObs >= totalPaginasObs}
                  title="Página siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          {totalObs === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Sin alertas ni dietas especiales"
              description="No hay observaciones médicas o dietas especiales registradas para esta fecha."
              className="py-8 border-none bg-zinc-50/50"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {obsPaginadas.map((p) => {
                const matchNum = (p.codigoPedido || '').match(/-(\d+)$/);
                const numAlm = matchNum ? parseInt(matchNum[1], 10) : undefined;
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-zinc-200/90 border-l-4 border-l-amber-500 bg-white p-4 shadow-2xs space-y-2.5 hover:border-zinc-300 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          #{p.codigoPedido}
                        </span>
                        {numAlm && (
                          <span className="text-[10px] font-medium text-zinc-500">
                            Almuerzo #{numAlm}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-medium text-zinc-600 bg-zinc-50">
                        {p.gradoSeccion}
                      </Badge>
                    </div>

                    <div>
                      <div className="font-bold text-zinc-950 text-sm leading-tight">{p.estudianteNombre}</div>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">🏫 {p.colegioNombre}</p>
                    </div>

                    <div className="text-xs text-zinc-700 bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100 space-y-1">
                      <div>
                        <span className="text-zinc-500 text-[11px] block">Menú seleccionado:</span>
                        <span className="text-orange-700 font-semibold">{p.entradaNombre}</span> +{' '}
                        <span className="text-zinc-900 font-semibold">{p.segundoNombre}</span>
                        {p.ensaladaNombre && p.ensaladaNombre !== 'Sin ensalada' && (
                          <> + <span className="text-emerald-700 font-semibold">{p.ensaladaNombre}</span></>
                        )}
                      </div>
                      {p.refrigerioNombre && (
                        <div className="text-emerald-700 font-semibold text-[11px] pt-1 border-t border-zinc-200/60">
                          Extras: {p.refrigerioNombre}
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-lg text-xs font-semibold text-amber-950 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{p.observacion}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
