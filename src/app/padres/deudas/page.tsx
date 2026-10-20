'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  ArrowLeft,
  Calendar,
  Utensils,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  Building2,
  Phone,
  PackageCheck,
  Check,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Info,
  DollarSign,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SkeletonPedidosPage } from '@/components/Skeleton';
import { dataService, CONFIG_PAGOS_DEFAULT } from '@/lib/dataService';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  formatearFechaCortaPeru,
} from '@/lib/dateUtils';
import { Pedido, PadreFiadoResumen, ConfiguracionPagos } from '@/types';
import { descargarComprobanteFiadoPdf } from '@/lib/pdfComprobanteGenerator';

export default function DeudasPage() {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const fechaHoy = useMemo(() => obtenerFechaHoyPeru(), []);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [configPagos, setConfigPagos] = useState<ConfiguracionPagos>(CONFIG_PAGOS_DEFAULT);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<'PENDIENTES' | 'LIQUIDADOS' | 'TODOS'>('PENDIENTES');
  const [hijoFiltro, setHijoFiltro] = useState<string>('TODOS');
  const [descargandoPdf, setDescargandoPdf] = useState(false);

  // Cargar pedidos y configuración de pagos
  const cargarDatos = async () => {
    if (!usuario) return;
    try {
      const [pedidosData, configData] = await Promise.all([
        dataService.obtenerPedidosPorPadre(usuario.id, usuario.telefono),
        dataService.obtenerConfiguracionPagos(),
      ]);
      setPedidos(pedidosData);
      if (configData) setConfigPagos(configData);
    } catch (e) {
      console.error('Error cargando fiados y deudas del padre:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!usuario) return;
    let cancelado = false;

    Promise.all([
      dataService.obtenerPedidosPorPadre(usuario.id, usuario.telefono),
      dataService.obtenerConfiguracionPagos(),
    ]).then(([pedidosData, configData]) => {
      if (!cancelado) {
        setPedidos(pedidosData);
        if (configData) setConfigPagos(configData);
        setCargando(false);
      }
    });

    const desuscribir = dataService.suscribirCambios(() => {
      cargarDatos();
    });

    return () => {
      cancelado = true;
      desuscribir();
    };
  }, [usuario]);

  // Si está cargando la sesión
  if (cargandoAuth) {
    return <SkeletonPedidosPage />;
  }

  // Si no está autenticado
  if (!usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <Receipt className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Inicia sesión para ver tus deudas
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ingresa con tu cuenta de apoderado para consultar el estado de tus almuerzos bajo modalidad fiado o pagar luego.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login?redirigir=/padres/deudas"
              className="py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-xs"
            >
              Iniciar Sesión / Registrarme
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition"
            >
              Ver Carta Semanal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si es un administrador o super administrador, redirigir al panel de administración de fiados
  if (usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">
            Módulo de Administración de Fiados
          </h2>
          <p className="text-xs text-slate-500">
            Como administrador o super administrador, puedes gestionar las deudas de todos los colegios y liquidarlas en el panel central de fiados.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/admin/fiado"
              className="py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs transition text-center shadow-xs"
            >
              Ir a Control de Fiados (Admin)
            </Link>
            <Link
              href="/admin"
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition text-center"
            >
              Ir al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtro de pedidos fiados
  const esFiado = (metodo?: string) => {
    const m = String(metodo || '').trim().toLowerCase();
    return m === 'pagar luego' || m === 'pagar_luego' || m.includes('luego') || m.includes('efectivo');
  };

  const todosLosFiados = pedidos.filter(
    (p) => esFiado(p.metodoPago) && p.estadoPedido !== 'CANCELADO'
  );

  const fiadosPendientes = todosLosFiados.filter((p) => p.estadoPago !== 'PAGADO');
  const fiadosLiquidados = todosLosFiados.filter((p) => p.estadoPago === 'PAGADO');

  const totalDeudaPendiente = fiadosPendientes.reduce(
    (acc, p) => acc + (Number(p.monto) || 12.0),
    0
  );
  const totalHistoricoLiquidado = fiadosLiquidados.reduce(
    (acc, p) => acc + (Number(p.monto) || 12.0),
    0
  );

  // Lista de estudiantes únicos con fiados
  const nombresEstudiantes = Array.from(
    new Set(todosLosFiados.map((p) => p.estudianteNombre))
  );

  // Deuda agrupada por estudiante
  const deudaPorEstudiante = nombresEstudiantes.map((nombre) => {
    const pedidosDelHijo = fiadosPendientes.filter((p) => p.estudianteNombre === nombre);
    const monto = pedidosDelHijo.reduce((acc, p) => acc + (Number(p.monto) || 12.0), 0);
    const primerPedido = todosLosFiados.find((p) => p.estudianteNombre === nombre);
    return {
      nombre,
      gradoSeccion: primerPedido?.gradoSeccion || '',
      colegioNombre: primerPedido?.colegioNombre || '',
      cantidadPendientes: pedidosDelHijo.length,
      totalPendiente: monto,
    };
  });

  // Filtrado actual para renderizar
  const fiadosFiltrados = todosLosFiados.filter((p) => {
    if (filtroEstado === 'PENDIENTES' && p.estadoPago === 'PAGADO') return false;
    if (filtroEstado === 'LIQUIDADOS' && p.estadoPago !== 'PAGADO') return false;
    if (hijoFiltro !== 'TODOS' && p.estudianteNombre !== hijoFiltro) return false;
    return true;
  });

  // Descarga del comprobante en PDF
  const handleDescargarPdf = () => {
    try {
      setDescargandoPdf(true);
      const resumenPadre: PadreFiadoResumen = {
        padreId: usuario.id,
        nombrePadre: usuario.nombreCompleto,
        telefono: usuario.telefono,
        colegioNombre:
          todosLosFiados[0]?.colegioNombre ||
          usuario.hijos[0]?.colegioNombre ||
          'Colegio',
        hijosNombres:
          nombresEstudiantes.length > 0
            ? nombresEstudiantes
            : usuario.hijos.map((h) => h.nombreCompleto),
        totalDeuda: totalDeudaPendiente,
        totalPedidos: todosLosFiados.length,
        pedidosEntregados: todosLosFiados.filter((p) => p.estadoPedido === 'ENTREGADO').length,
        pedidos: todosLosFiados.map((p) => ({
          id: p.id,
          codigoPedido: p.codigoPedido,
          fecha: p.fecha,
          diaSemana: p.diaSemana,
          hijoId: p.hijoId,
          estudianteNombre: p.estudianteNombre,
          gradoSeccion: p.gradoSeccion,
          colegioNombre: p.colegioNombre,
          entradaNombre: p.entradaNombre,
          segundoNombre: p.segundoNombre,
          monto: Number(p.monto) || 12.0,
          estadoPedido: p.estadoPedido,
          horaEntrega: p.horaEntrega,
          estadoPago: p.estadoPago,
          createdAt: p.createdAt,
        })),
      };

      descargarComprobanteFiadoPdf(resumenPadre, configPagos);
    } catch (e) {
      console.error('Error al generar PDF de deudas:', e);
    } finally {
      setDescargandoPdf(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6 pb-28 space-y-5">
      {/* Barra de cabecera con navegación */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            href="/padres/pedidos"
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold"
            title="Ir a mis pedidos"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Mis Pedidos</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                Mis Deudas y Fiados
              </h1>
              <p className="text-[11px] text-slate-500">
                Almuerzos bajo modalidad pagar luego y estados de liquidación
              </p>
            </div>
          </div>
        </div>

        {todosLosFiados.length > 0 && (
          <button
            type="button"
            onClick={handleDescargarPdf}
            disabled={descargandoPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition shadow-2xs disabled:opacity-50"
            title="Descargar estado de cuenta en PDF"
          >
            <Download className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">
              {descargandoPdf ? 'Generando...' : 'Descargar PDF'}
            </span>
          </button>
        )}
      </div>

      {/* Banner Principal de Estado de Cuenta */}
      <div
        className={`rounded-3xl p-4 sm:p-5 border transition-all ${
          totalDeudaPendiente === 0
            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border-emerald-200 text-emerald-950'
            : 'bg-gradient-to-br from-amber-500/15 via-amber-50 to-white border-amber-300 text-amber-950 shadow-xs'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              totalDeudaPendiente === 0
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {totalDeudaPendiente === 0 ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                  totalDeudaPendiente === 0
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {totalDeudaPendiente === 0 ? 'Al Día • Sin Deudas' : 'Deuda Pendiente de Liquidación'}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono">
                S/ {totalDeudaPendiente.toFixed(2)}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-800 pt-0.5">
              {totalDeudaPendiente === 0
                ? '¡Felicitaciones! No tienes deudas de almuerzos escolares pendientes con la administración.'
                : `Tienes ${fiadosPendientes.length} ${
                    fiadosPendientes.length === 1 ? 'almuerzo fiado pendiente' : 'almuerzos fiados pendientes'
                  } por pagar.`}
            </p>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {totalDeudaPendiente === 0
                ? 'Todos tus almuerzos con modalidad fiado o pagar luego han sido liquidados y regularizados satisfactoriamente.'
                : 'Una vez transferido el monto a los medios oficiales, la administración de tu colegio confirmará la liquidación y tu saldo se actualizará automáticamente.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Deuda Pendiente
          </span>
          <span
            className={`text-base sm:text-lg font-black font-mono block ${
              totalDeudaPendiente > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            S/ {totalDeudaPendiente.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            {fiadosPendientes.length} por liquidar
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Almuerzos Fiados
          </span>
          <span className="text-base sm:text-lg font-black text-slate-800 font-mono block">
            {todosLosFiados.length}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Total histórico
          </span>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Liquidado
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-700 font-mono block">
            S/ {totalHistoricoLiquidado.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            {fiadosLiquidados.length} regularizados
          </span>
        </div>
      </div>

      {/* Desglose de Deuda por Hijo (si hay más de 1 o hay deuda activa) */}
      {deudaPorEstudiante.length > 0 && totalDeudaPendiente > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
            Saldos por Estudiante
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {deudaPorEstudiante.map((hijo) => (
              <div
                key={hijo.nombre}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{hijo.nombre}</h4>
                  <p className="text-[10px] text-slate-500">
                    {hijo.colegioNombre} {hijo.gradoSeccion && `• ${hijo.gradoSeccion}`}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-black font-mono block ${
                      hijo.totalPendiente > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    S/ {hijo.totalPendiente.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {hijo.cantidadPendientes} {hijo.cantidadPendientes === 1 ? 'almuerzo' : 'almuerzos'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones de Pago y Medios Oficiales (Yape / Plin) */}
      {totalDeudaPendiente > 0 && (
        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/90 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Medios de Pago para Liquidación</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Yape
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {configPagos.numeroYape || '999-999-999'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Titular: {configPagos.titularYape || 'Placeres Culinarios'}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">
                Yape
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Plin
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {configPagos.numeroPlin || configPagos.numeroYape || '999-999-999'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Titular: {configPagos.titularPlin || configPagos.titularYape || 'Placeres Culinarios'}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded-md">
                Plin
              </span>
            </div>
          </div>

          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            <Info className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
            Luego de realizar la transferencia por el total adeudado (<strong>S/ {totalDeudaPendiente.toFixed(2)}</strong>), comunica o envía tu comprobante al administrador del colegio para que marque tu cuenta como liquidada.
          </p>
        </div>
      )}

      {/* Pestañas de Filtro: Pendientes vs Liquidados vs Todos */}
      <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setFiltroEstado('PENDIENTES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filtroEstado === 'PENDIENTES'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pendientes ({fiadosPendientes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('LIQUIDADOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filtroEstado === 'LIQUIDADOS'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Liquidados ({fiadosLiquidados.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filtroEstado === 'TODOS'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Todos ({todosLosFiados.length})</span>
          </button>
        </div>

        {/* Filtro por Hijo (si tiene más de un hijo registrado) */}
        {nombresEstudiantes.length > 1 && (
          <select
            value={hijoFiltro}
            onChange={(e) => setHijoFiltro(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          >
            <option value="TODOS">Todos los hijos</option>
            {nombresEstudiantes.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lista de Pedidos Fiados */}
      {cargando ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Cargando registros de deudas...
        </div>
      ) : fiadosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {filtroEstado === 'PENDIENTES'
              ? 'No tienes almuerzos fiados pendientes de liquidación'
              : filtroEstado === 'LIQUIDADOS'
              ? 'No tienes almuerzos fiados liquidados'
              : 'No hay pedidos registrados bajo modalidad pagar luego'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filtroEstado === 'PENDIENTES'
              ? 'Tu cuenta está 100% al día. Puedes solicitar nuevos almuerzos desde la carta semanal.'
              : 'Los almuerzos fiados que solicites o liquides se listarán aquí para tu control.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition shadow-2xs"
            >
              <Utensils className="w-3.5 h-3.5" />
              Ver Carta Semanal
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {fiadosFiltrados.map((pedido) => {
            const liquidado = pedido.estadoPago === 'PAGADO';
            const entregado = pedido.estadoPedido === 'ENTREGADO';

            return (
              <div
                key={pedido.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-amber-200 transition space-y-3"
              >
                {/* Encabezado del Pedido Fiado */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl font-mono">
                      #{pedido.codigoPedido}
                    </span>
                    <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5 uppercase">
                      <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{formatearFechaCortaPeru(pedido.fecha?.slice(0, 10), pedido.diaSemana)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Badge Entrega */}
                    {entregado ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Entregado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> En preparación
                      </span>
                    )}

                    {/* Badge Estado de Liquidación */}
                    {liquidado ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Pago aceptado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold rounded-xl flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Pagar luego (Fiado)
                      </span>
                    )}
                  </div>
                </div>

                {/* Datos del Estudiante y Colegio */}
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{pedido.estudianteNombre}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {pedido.colegioNombre} {pedido.gradoSeccion && `• ${pedido.gradoSeccion}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Monto
                    </span>
                    <span
                      className={`text-base font-black font-mono block ${
                        liquidado ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      S/ {(Number(pedido.monto) || 12.0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Detalle del Plato */}
                <div className="bg-slate-50 rounded-2xl p-2.5 text-xs text-slate-700 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="font-bold text-slate-900">
                      {pedido.segundoNombre || 'Segundo del día'}
                    </span>
                  </div>
                  {pedido.entradaNombre && (
                    <p className="text-[11px] text-slate-500 pl-5">
                      Entrada: {pedido.entradaNombre}
                    </p>
                  )}
                </div>

                {/* Mini Línea de Tiempo del Fiado */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        liquidado ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                    <span className="font-bold">
                      {liquidado
                        ? 'Liquidado por administración'
                        : 'Pendiente de liquidación'}
                    </span>
                  </div>

                  {pedido.horaEntrega && (
                    <span className="text-slate-400 text-[10px]">
                      Entregado a las {pedido.horaEntrega}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
