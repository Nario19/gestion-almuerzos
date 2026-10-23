'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  Calendar,
  Utensils,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ChefHat,
  PackageCheck,
  Check,
  Receipt,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { SkeletonPedidosPage, Skeleton } from '@/components/Skeleton';
import { dataService } from '@/lib/dataService';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  formatearFechaCortaPeru,
  calcularOffsetFechaPeru,
} from '@/lib/dateUtils';
import { Pedido, EstadoPedido, EstadoPago } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function PedidosContent() {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const fechaHoy = obtenerFechaHoyPeru();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);
  const [fechaFiltro, setFechaFiltro] = useState<string>(fechaHoy);
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 5;

  const cargarPedidos = async () => {
    if (!usuario) return;
    setCargandoPedidos(true);
    try {
      const data = await dataService.obtenerPedidosPorPadre(usuario.id, usuario.telefono);
      setPedidos(data);
    } catch (e) {
      console.error('Error cargando historial de pedidos:', e);
    } finally {
      setCargandoPedidos(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      let cancelado = false;
      dataService.obtenerPedidosPorPadre(usuario.id, usuario.telefono).then((data) => {
        if (!cancelado) {
          setPedidos(data);
          setCargandoPedidos(false);
        }
      });
      const desuscribir = dataService.suscribirCambios(() => {
        cargarPedidos();
      });
      return () => {
        cancelado = true;
        desuscribir();
      };
    }
  }, [usuario]);

  // Reiniciar a página 1 cuando cambia el filtro de fecha (declarado antes de retornos condicionales)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPaginaActual(1);
  }, [fechaFiltro]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Pantalla de carga mientras se verifica sesión (Skeleton)
  if (cargandoAuth) {
    return <SkeletonPedidosPage />;
  }

  // Si no está autenticado
  if (!usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="w-14 h-14 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
            Inicia sesión para ver tus pedidos
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Ingresa a tu cuenta para consultar el historial detallado de los almuerzos escolares pedidos para tus hijos.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition shadow-xs"
            >
              Iniciar Sesión / Registrarme
            </Link>
            <Link
              href="/"
              className="py-2 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg text-xs transition"
            >
              Ver Carta Semanal
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Si es un administrador o super administrador
  if (usuario.rol === 'ADMIN' || usuario.rol === 'SUPER_ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <ShieldAlert className="w-12 h-12 text-zinc-900 mx-auto" />
          <h2 className="text-lg font-bold text-zinc-950">
            Vista de Administrador
          </h2>
          <p className="text-xs text-zinc-500">
            Para revisar todos los pedidos consolidados de cocina y despacho, accede a los paneles operativos.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/despacho"
              className="py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition text-center shadow-xs"
            >
              Ir a Despacho y Pagos
            </Link>
            <Link
              href="/cocina"
              className="py-2 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg text-xs transition text-center"
            >
              Ir a Consolidado de Cocina
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const badgeEstadoPedido = (estado: EstadoPedido) => {
    switch (estado) {
      case 'CANCELADO':
        return (
          <Badge variant="destructive" className="text-[11px] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Cancelado
          </Badge>
        );
      case 'ENTREGADO':
        return (
          <Badge variant="success" className="text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Entregado
          </Badge>
        );
      case 'REGISTRADO':
      case 'EN_COCINA':
      case 'EMPACADO':
      default:
        return (
          <Badge variant="secondary" className="text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-500" /> No entregado
          </Badge>
        );
    }
  };

  const badgeEstadoPago = (estado: EstadoPago, metodoPago?: string) => {
    const mPago = String(metodoPago || '').trim().toLowerCase();
    const esFiado = mPago === 'pagar luego' || mPago === 'pagar_luego' || mPago.includes('luego');

    if (estado === 'PAGADO') {
      return (
        <Badge variant="success" className="text-[11px] flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Pago aceptado
        </Badge>
      );
    }
    if (esFiado) {
      return (
        <Badge variant="warning" className="text-[11px] flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" /> Pagar luego (Fiado)
        </Badge>
      );
    }
    switch (estado) {
      case 'VERIFICANDO':
        return (
          <Badge variant="secondary" className="text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-500" /> Validando pago
          </Badge>
        );
      case 'PENDIENTE':
      default:
        return (
          <Badge variant="destructive" className="text-[11px] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Pendiente de pago
          </Badge>
        );
    }
  };

  const obtenerEstadoTimeline = (pedido: Pedido) => {
    if (pedido.estadoPedido === 'CANCELADO') {
      return {
        etapas: [
          {
            id: 1,
            titulo: 'Orden recibida',
            descripcion: 'Orden registrada',
            icono: ShoppingBag,
            completado: true,
            enCurso: false,
            alerta: false,
          },
          {
            id: 2,
            titulo: 'Pedido cancelado',
            descripcion: 'Anulado por administración',
            icono: AlertCircle,
            completado: false,
            enCurso: false,
            alerta: true,
          },
        ],
        estadoVivo: {
          titulo: 'Pedido Cancelado',
          descripcion: `Este pedido para ${pedido.estudianteNombre} ha sido cancelado por la administración.`,
          color: 'rose',
          icono: AlertCircle,
        },
        pagadoOAceptado: false,
        entregado: false,
        esFiado: false,
        fiadoPendiente: false,
        fiadoLiquidado: false,
      };
    }

    const mPago = String(pedido.metodoPago || '').trim().toLowerCase();
    const esFiado = mPago === 'pagar luego' || mPago === 'pagar_luego' || mPago.includes('luego');
    const fiadoLiquidado = esFiado && pedido.estadoPago === 'PAGADO';
    const fiadoPendiente = esFiado && pedido.estadoPago !== 'PAGADO';

    const entregado = pedido.estadoPedido === 'ENTREGADO';
    // Para fiados: sólo se considera 'pagadoOAceptado' si el fiado fue liquidado en administración.
    // Para pedidos regulares: es aceptado si ya está pagado o si ya está en cocina / preparación / despacho.
    const pagadoOAceptado = esFiado
      ? fiadoLiquidado
      : (pedido.estadoPago === 'PAGADO' || pedido.estadoPedido !== 'REGISTRADO');

    const etapas = [
      {
        id: 1,
        titulo: 'Orden recibida',
        descripcion: 'Orden registrada',
        icono: ShoppingBag,
        completado: true,
        enCurso: false,
        alerta: false,
      },
      {
        id: 2,
        titulo: esFiado
          ? (fiadoLiquidado ? 'Pago aceptado' : 'Pagar luego')
          : 'Pago aceptado',
        descripcion: esFiado
          ? (fiadoLiquidado ? 'Fiado liquidado' : 'Fiado pendiente de pago')
          : (entregado || pagadoOAceptado)
          ? 'Pago verificado'
          : pedido.estadoPago === 'VERIFICANDO'
          ? 'Validando pago'
          : 'Por pagar',
        icono: esFiado
          ? (fiadoLiquidado ? CheckCircle2 : Clock)
          : CheckCircle2,
        completado: esFiado ? fiadoLiquidado : (pagadoOAceptado || entregado),
        enCurso: esFiado ? false : (!pagadoOAceptado && !entregado),
        alerta: esFiado
          ? fiadoPendiente
          : (pedido.estadoPago === 'PENDIENTE' && !entregado),
      },
      {
        id: 3,
        titulo: 'Entregado',
        descripcion: entregado
          ? (pedido.horaEntrega ? `Entregado (${pedido.horaEntrega})` : 'Entregado en colegio')
          : (esFiado
              ? 'Programado para entrega'
              : pagadoOAceptado ? 'Programado para entrega' : 'Pendiente de pago'),
        icono: PackageCheck,
        completado: entregado,
        enCurso: !entregado && (esFiado || pagadoOAceptado),
        alerta: false,
      },
    ];

    let estadoVivo = {
      titulo: 'Orden Recibida - Esperando Pago',
      descripcion:
        'Por favor realiza el pago por Yape o Plin y adjunta el comprobante para que la administración valide el pago y acepte tu orden.',
      color: 'amber',
      icono: Clock,
    };

    if (entregado) {
      if (fiadoPendiente) {
        estadoVivo = {
          titulo: '¡Almuerzo Entregado! (Fiado Pendiente de Pago)',
          descripcion: pedido.horaEntrega
            ? `El pedido fue entregado a las ${pedido.horaEntrega} en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}. Este almuerzo fue solicitado con modalidad 'Pagar luego' y está pendiente de liquidación con administración.`
            : `El pedido fue entregado en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}. Este almuerzo fue solicitado con modalidad 'Pagar luego' y está pendiente de liquidación con administración.`,
          color: 'amber',
          icono: Clock,
        };
      } else {
        estadoVivo = {
          titulo: '¡Almuerzo Entregado con Éxito!',
          descripcion: pedido.horaEntrega
            ? `El pedido fue entregado a las ${pedido.horaEntrega} en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}.`
            : `El pedido fue entregado puntualmente en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}.`,
          color: 'emerald',
          icono: CheckCircle2,
        };
      }
    } else if (fiadoPendiente) {
      estadoVivo = {
        titulo: 'Modalidad Pagar Luego (Fiado Autorizado)',
        descripcion: `El almuerzo para ${pedido.estudianteNombre} está registrado bajo modalidad 'Pagar luego' y será entregado en el colegio ${pedido.colegioNombre}.`,
        color: 'amber',
        icono: Clock,
      };
    } else if (pedido.estadoPago === 'VERIFICANDO') {
      estadoVivo = {
        titulo: 'Comprobante en Revisión por Administración',
        descripcion:
          'Hemos recibido tu comprobante de pago. En breve el administrador lo validará para confirmar tu orden.',
        color: 'blue',
        icono: Clock,
      };
    } else if (pagadoOAceptado) {
      estadoVivo = {
        titulo: '¡Pago Aceptado! Programado para Entrega',
        descripcion:
          `El pago ha sido confirmado. El almuerzo de ${pedido.estudianteNombre} está programado para ser entregado en el colegio ${pedido.colegioNombre}.`,
        color: 'blue',
        icono: PackageCheck,
      };
    }

    return { etapas, estadoVivo, pagadoOAceptado, entregado, esFiado, fiadoPendiente, fiadoLiquidado };
  };

  const formatearFechaLegible = (fechaStr: string) => {
    if (fechaStr === 'TODAS') return 'Todos los pedidos';
    return formatearFechaLegiblePeru(fechaStr);
  };

  const formatearFechaCorta = (fechaStr?: string, diaSemana?: string) => {
    return formatearFechaCortaPeru(fechaStr?.slice(0, 10), diaSemana);
  };

  const cambiarDia = (offset: number) => {
    setPaginaActual(1);
    if (fechaFiltro === 'TODAS') {
      setFechaFiltro(fechaHoy);
      return;
    }
    setFechaFiltro(calcularOffsetFechaPeru(fechaFiltro, offset));
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (fechaFiltro === 'TODAS') return true;
    const fechaPedido = (p.fecha || '').slice(0, 10);
    return fechaPedido === fechaFiltro;
  });

  // Paginación para no sobrecargar la vista del padre
  const totalFiltrados = pedidosFiltrados.length;
  const totalPaginas = Math.ceil(totalFiltrados / porPagina) || 1;
  const paginaValida = Math.min(Math.max(1, paginaActual), totalPaginas);
  const indiceInicio = (paginaValida - 1) * porPagina;
  const indiceFin = Math.min(indiceInicio + porPagina, totalFiltrados);
  const pedidosPaginados = pedidosFiltrados.slice(indiceInicio, indiceFin);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6 pb-28">
      {/* Barra de cabecera con retorno */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 -ml-1 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Volver a la carta"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a Carta</span>
          </Link>
          <h1 className="sr-only">Historial de Pedidos</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/padres/deudas"
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs font-semibold rounded-lg transition shadow-2xs"
            title="Ver mis almuerzos fiados y deudas"
          >
            <Receipt className="w-3.5 h-3.5 text-zinc-600" />
            <span>Mis Deudas</span>
          </Link>
          <Badge variant="outline" className="text-xs font-medium">
            {fechaFiltro === 'TODAS'
              ? `${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'}`
              : `${pedidosFiltrados.length} de ${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'}`}
          </Badge>
        </div>
      </div>

      {/* Filtro por Día (Calendario y chips rápidos) */}
      {!cargandoPedidos && pedidos.length > 0 && (
        <Card className="p-3 sm:p-4 mb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">
                  Filtrar por Día
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 capitalize">
                  {formatearFechaLegible(fechaFiltro)}
                  {fechaFiltro === fechaHoy && (
                    <Badge variant="success" className="ml-2 text-[10px] px-1.5 py-0.2">
                      Hoy
                    </Badge>
                  )}
                </span>
              </div>
            </div>

            {/* Chips Rápidos: Todos vs Hoy */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setFechaFiltro('TODAS');
                  setPaginaActual(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  fechaFiltro === 'TODAS'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Todos ({pedidos.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFechaFiltro(fechaHoy);
                  setPaginaActual(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  fechaFiltro === fechaHoy
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Selector con Flechas y Calendario nativo optimizado */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2.5 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => cambiarDia(-1)}
                className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Día anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <Calendar className="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
                  onChange={(e) => {
                    setFechaFiltro(e.target.value || 'TODAS');
                    setPaginaActual(1);
                  }}
                  className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950 transition cursor-pointer"
                  title="Seleccionar fecha en el calendario"
                />
              </div>

              <button
                type="button"
                onClick={() => cambiarDia(1)}
                className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Día siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {fechaFiltro !== 'TODAS' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFechaFiltro('TODAS');
                  setPaginaActual(1);
                }}
                className="w-full sm:w-auto"
                title="Quitar filtro de fecha y ver todos los pedidos"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Ver todos</span>
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Lista de Pedidos */}
      {cargandoPedidos ? (
        <div className="space-y-3.5 animate-pulse" aria-busy="true" aria-label="Cargando pedidos...">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-zinc-100 text-zinc-400 rounded-lg flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-zinc-950">
            Aún no tienes pedidos registrados
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Explora la carta semanal con fotos reales y programa el almuerzo escolar de tus hijos en sencillos pasos.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition shadow-xs"
            >
              <Utensils className="w-4 h-4" />
              Ver Menú y Pedir
            </Link>
          </div>
        </Card>
      ) : pedidosFiltrados.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-lg flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-950">
            No tienes pedidos para el {formatearFechaLegible(fechaFiltro)}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
            No se encontraron almuerzos programados para este día. Puedes revisar otra fecha o consultar todo tu historial.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setFechaFiltro('TODAS');
                setPaginaActual(1);
              }}
              className="inline-flex items-center gap-2 py-2 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition shadow-xs cursor-pointer"
            >
              Ver todos mis pedidos ({pedidos.length})
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pedidosPaginados.map((pedido) => {
            const { etapas, estadoVivo, pagadoOAceptado, entregado, esFiado, fiadoPendiente } =
              obtenerEstadoTimeline(pedido);
            const EstadoIcono = estadoVivo.icono;

            return (
              <Card
                key={pedido.id}
                className="p-4 sm:p-5 space-y-3.5"
              >
                {/* Encabezado de la tarjeta */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md font-mono">
                      #{pedido.codigoPedido}
                    </span>
                    <span className="text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{formatearFechaCorta(pedido.fecha, pedido.diaSemana)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {badgeEstadoPedido(pedido.estadoPedido)}
                    {badgeEstadoPago(pedido.estadoPago, pedido.metodoPago)}
                  </div>
                </div>

                {/* LÍNEA DE TIEMPO DEL PEDIDO (STEPPER DE 3 ETAPAS) */}
                <div className="bg-zinc-50/70 rounded-lg p-3.5 border border-zinc-200/70 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider px-1">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-zinc-500" />
                      Estado del Almuerzo
                    </span>
                    <span className="text-zinc-700 font-medium lowercase">
                      {entregado
                        ? (fiadoPendiente
                            ? 'entregado (fiado pendiente de pago)'
                            : '3 de 3 completado (entregado)')
                        : fiadoPendiente
                        ? 'fiado registrado (por pagar)'
                        : pagadoOAceptado
                        ? '2 de 3 completado (pago aceptado)'
                        : '1 de 3 (orden recibida)'}
                    </span>
                  </div>

                  {/* Barra conectora y nodos del Stepper */}
                  <div className="relative flex items-center justify-between px-3 sm:px-6 pt-1">
                    {/* Línea conectora base */}
                    <div className="absolute left-8 right-8 top-4.5 -translate-y-1/2 h-1 bg-zinc-200 rounded-full z-0" />

                    {/* Línea conectora activa */}
                    <div
                      className="absolute left-8 top-4.5 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-700 bg-zinc-900"
                      style={{
                        width: entregado
                          ? 'calc(100% - 4rem)'
                          : (pagadoOAceptado || fiadoPendiente)
                          ? '50%'
                          : '0%',
                      }}
                    />

                    {etapas.map((etapa) => {
                      const IconComponent = etapa.icono;
                      return (
                        <div key={etapa.id} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              etapa.completado
                                ? 'bg-zinc-950 text-white shadow-xs'
                                : etapa.enCurso
                                ? 'bg-zinc-900 text-white ring-4 ring-zinc-200 shadow-xs'
                                : etapa.alerta
                                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                                : 'bg-white text-zinc-300 border-2 border-zinc-200'
                            }`}
                            title={etapa.titulo}
                          >
                            {etapa.completado ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              <IconComponent className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs font-semibold mt-1.5 whitespace-nowrap ${
                              etapa.completado
                                ? 'text-zinc-950'
                                : etapa.enCurso
                                ? 'text-zinc-950 font-bold'
                                : etapa.alerta
                                ? 'text-amber-800'
                                : 'text-zinc-400'
                            }`}
                          >
                            {etapa.titulo}
                          </span>
                          <span className="text-[9px] text-zinc-500 hidden sm:block">
                            {etapa.descripcion}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tarjeta de estado en vivo explicativo */}
                  <div className="p-2.5 rounded-lg border border-zinc-200 bg-white flex items-start gap-2.5 text-xs">
                    <EstadoIcono className="w-4 h-4 shrink-0 mt-0.5 text-zinc-700" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-zinc-900 text-[11px] sm:text-xs">{estadoVivo.titulo}</p>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed">
                        {estadoVivo.descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos del estudiante */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-zinc-600 shrink-0" />
                    <span className="text-sm font-bold text-zinc-950">
                      {pedido.estudianteNombre}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 pl-6">
                    {pedido.colegioNombre} • <span className="font-semibold text-zinc-700">{pedido.gradoSeccion}</span>
                  </p>
                </div>

                {/* Menú seleccionado */}
                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-400 font-medium shrink-0">1. Entrada:</span>
                    <span className="font-medium text-zinc-800">{pedido.entradaNombre}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-400 font-medium shrink-0">2. Segundo:</span>
                    <span className="font-semibold text-zinc-950">{pedido.segundoNombre}</span>
                  </div>
                  {pedido.ensaladaNombre && (
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400 font-medium shrink-0">3. Ensalada:</span>
                      <span className="font-medium text-zinc-800">{pedido.ensaladaNombre}</span>
                    </div>
                  )}
                  {pedido.refrigerioNombre && (
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-400 font-medium shrink-0">Extras:</span>
                      <span className="font-medium text-zinc-900">{pedido.refrigerioNombre}</span>
                    </div>
                  )}
                  {pedido.observacion && (
                    <div className="pt-1.5 border-t border-zinc-200/60 text-[11px] text-zinc-700 flex items-start gap-1.5 font-medium">
                      <span className="font-semibold shrink-0">Nota:</span>
                      <span>{pedido.observacion}</span>
                    </div>
                  )}
                </div>

                {/* Pie de tarjeta con monto y acciones */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">
                      Pago: {pedido.metodoPago}
                    </span>
                    <span className="text-sm font-bold text-zinc-950 font-mono">
                      S/ {pedido.monto.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {pedido.comprobanteUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setComprobanteModal(pedido.comprobanteUrl || null)}
                        className="flex items-center gap-1"
                        title="Ver comprobante adjunto"
                      >
                        <FileImage className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="hidden sm:inline">Comprobante</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* BARRA DE PAGINACIÓN */}
          {totalPaginas > 1 && (
            <Card className="p-3.5 flex items-center justify-between text-xs text-zinc-600 mt-4">
              <span className="font-medium text-zinc-500">
                Página <strong className="text-zinc-900">{paginaValida}</strong> de{' '}
                <strong className="text-zinc-900">{totalPaginas}</strong> ({totalFiltrados} pedidos)
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaValida === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaValida === totalPaginas}
                  className="flex items-center gap-1"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modal de Comprobante */}
      {comprobanteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setComprobanteModal(null)}
        >
          <Card
            className="p-4 max-w-sm w-full shadow-2xl relative animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-zinc-600" /> Comprobante de Pago
              </span>
              <button
                type="button"
                onClick={() => setComprobanteModal(null)}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 px-2 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={comprobanteModal}
              alt="Comprobante de pago"
              className="w-full max-h-[70vh] object-contain rounded-lg bg-zinc-50"
            />
          </Card>
        </div>
      )}
    </div>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={<SkeletonPedidosPage />}>
      <PedidosContent />
    </Suspense>
  );
}
