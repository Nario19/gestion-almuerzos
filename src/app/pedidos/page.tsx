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
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ChefHat,
  PackageCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { dataService } from '@/lib/dataService';
import { Pedido, EstadoPedido, EstadoPago } from '@/types';

const obtenerFechaHoy = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function PedidosContent() {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const fechaHoy = obtenerFechaHoy();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);
  const [fechaFiltro, setFechaFiltro] = useState<string>('TODAS');

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
      cargarPedidos();
      const desuscribir = dataService.suscribirCambios(() => {
        cargarPedidos();
      });
      return () => desuscribir();
    }
  }, [usuario]);

  // Pantalla de carga mientras se verifica sesión
  if (cargandoAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Cargando tus pedidos...</p>
      </div>
    );
  }

  // Si no está autenticado
  if (!usuario) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Inicia sesión para ver tus pedidos
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ingresa a tu cuenta para consultar el historial detallado de los almuerzos escolares pedidos para tus hijos.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
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

  // Si es un administrador
  if (usuario.rol === 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
          <ShieldAlert className="w-12 h-12 text-orange-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">
            Vista de Administrador
          </h2>
          <p className="text-xs text-slate-500">
            Para revisar todos los pedidos consolidados de cocina y despacho, accede a los paneles operativos.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/despacho"
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition text-center shadow-xs"
            >
              Ir a Despacho y Pagos
            </Link>
            <Link
              href="/cocina"
              className="py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs transition text-center"
            >
              Ir a Consolidado de Cocina
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const badgeEstadoPedido = (estado: EstadoPedido) => {
    switch (estado) {
      case 'REGISTRADO':
        return (
          <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recibido
          </span>
        );
      case 'EN_COCINA':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-xl flex items-center gap-1 animate-pulse">
            <Utensils className="w-3 h-3" /> En Cocina
          </span>
        );
      case 'EMPACADO':
        return (
          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" /> Empacado
          </span>
        );
      case 'ENTREGADO':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Entregado
          </span>
        );
      default:
        return null;
    }
  };

  const badgeEstadoPago = (estado: EstadoPago) => {
    switch (estado) {
      case 'PAGADO':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Pagado
          </span>
        );
      case 'VERIFICANDO':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
            <Clock className="w-3 h-3" /> Verificando Pago
          </span>
        );
      case 'PENDIENTE':
      default:
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-xl flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Pendiente de Pago
          </span>
        );
    }
  };

  const obtenerEstadoTimeline = (pedido: Pedido) => {
    const pagadoOAceptado = pedido.estadoPago === 'PAGADO' || pedido.estadoPedido !== 'REGISTRADO';
    const enCocinaOListo =
      pedido.estadoPedido === 'EN_COCINA' ||
      pedido.estadoPedido === 'EMPACADO' ||
      pedido.estadoPedido === 'ENTREGADO';
    const empacadoOListo = pedido.estadoPedido === 'EMPACADO' || pedido.estadoPedido === 'ENTREGADO';
    const entregado = pedido.estadoPedido === 'ENTREGADO';

    const etapas = [
      {
        id: 1,
        titulo: 'Pedido',
        descripcion: 'Orden recibida',
        icono: ShoppingBag,
        completado: true,
        enCurso: false,
        alerta: false,
      },
      {
        id: 2,
        titulo: 'Aceptado',
        descripcion: pagadoOAceptado
          ? 'Pago verificado'
          : pedido.estadoPago === 'VERIFICANDO'
          ? 'Validando pago'
          : 'Por Pagar',
        icono: CheckCircle2,
        completado: pagadoOAceptado,
        enCurso: !pagadoOAceptado,
        alerta: pedido.estadoPago === 'PENDIENTE',
      },
      {
        id: 3,
        titulo: 'Preparado',
        descripcion: enCocinaOListo ? 'En Cocina' : 'En cola',
        icono: ChefHat,
        completado: empacadoOListo,
        enCurso: pagadoOAceptado && !empacadoOListo,
        alerta: false,
      },
      {
        id: 4,
        titulo: 'Entrega',
        descripcion: entregado ? 'Entregado' : empacadoOListo ? 'Empacado' : 'En camino',
        icono: PackageCheck,
        completado: entregado,
        enCurso: empacadoOListo && !entregado,
        alerta: false,
      },
    ];

    let estadoVivo = {
      titulo: 'Orden Registrada - Esperando Pago',
      descripcion:
        'Por favor realiza el pago por Yape o Plin y adjunta el comprobante para que la administración acepte la orden y la envíe a cocina.',
      color: 'amber',
      icono: Clock,
    };

    if (entregado) {
      estadoVivo = {
        titulo: '¡Almuerzo Entregado con Éxito!',
        descripcion: `El pedido fue entregado puntualmente en el colegio ${pedido.colegioNombre} para ${pedido.estudianteNombre}.`,
        color: 'emerald',
        icono: CheckCircle2,
      };
    } else if (pedido.estadoPedido === 'EMPACADO') {
      estadoVivo = {
        titulo: 'Lonchera Empacada y Rotulada',
        descripcion: `Almuerzo listo y empacado en envase térmico rotulado con el grado (${pedido.gradoSeccion}). En ruta de entrega al colegio.`,
        color: 'purple',
        icono: PackageCheck,
      };
    } else if (pedido.estadoPedido === 'EN_COCINA') {
      estadoVivo = {
        titulo: 'En Preparación Activa en Cocina',
        descripcion: `El equipo de cocina está elaborando la entrada (${pedido.entradaNombre}) y el segundo (${pedido.segundoNombre}).`,
        color: 'orange',
        icono: ChefHat,
      };
    } else if (pagadoOAceptado) {
      estadoVivo = {
        titulo: '¡Orden Aceptada! Pasó a Cocina',
        descripcion:
          'El pago ha sido confirmado por administración. La orden ya está asignada al equipo de cocina para la preparación de hoy.',
        color: 'blue',
        icono: CheckCircle2,
      };
    } else if (pedido.estadoPago === 'VERIFICANDO') {
      estadoVivo = {
        titulo: 'Comprobante en Revisión por Administración',
        descripcion:
          'Hemos recibido tu comprobante de pago. En breve el administrador lo validará para aceptar tu orden y pasarla a cocina.',
        color: 'blue',
        icono: Clock,
      };
    }

    return { etapas, estadoVivo, pagadoOAceptado, empacadoOListo, entregado };
  };

  const abrirConsultaWhatsApp = (pedido: Pedido) => {
    const phone = '51999999999';
    const texto =
      `Hola Placeres Culinarios, tengo una consulta sobre mi pedido:\n\n` +
      `• Código: #${pedido.codigoPedido}\n` +
      `• Día: ${pedido.diaSemana || 'Hoy'}\n` +
      `• Estudiante: ${pedido.estudianteNombre}\n` +
      `• Colegio: ${pedido.colegioNombre} (${pedido.gradoSeccion})\n` +
      `• Menú: ${pedido.entradaNombre} + ${pedido.segundoNombre}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const formatearFechaLegible = (fechaStr: string) => {
    if (fechaStr === 'TODAS') return 'Todos los pedidos';
    try {
      const [y, m, d] = fechaStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (_) {
      return fechaStr;
    }
  };

  const formatearFechaCorta = (fechaStr?: string, diaSemana?: string) => {
    if (!fechaStr) return diaSemana || 'Hoy';
    try {
      const [y, m, d] = fechaStr.slice(0, 10).split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const fechaFormateada = date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `${diaSemana ? `${diaSemana} • ` : ''}${fechaFormateada}`;
    } catch (_) {
      return `${diaSemana ? `${diaSemana} • ` : ''}${fechaStr}`;
    }
  };

  const cambiarDia = (offset: number) => {
    if (fechaFiltro === 'TODAS') {
      setFechaFiltro(fechaHoy);
      return;
    }
    try {
      const [y, m, d] = fechaFiltro.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() + offset);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setFechaFiltro(`${year}-${month}-${day}`);
    } catch (_) {}
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (fechaFiltro === 'TODAS') return true;
    const fechaPedido = (p.fecha || '').slice(0, 10);
    return fechaPedido === fechaFiltro;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:py-6 pb-28">
      {/* Barra de cabecera con retorno */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Volver a la carta"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              Historial de Pedidos
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Almuerzos programados para tus hijos
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl">
          {fechaFiltro === 'TODAS'
            ? `${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'}`
            : `${pedidosFiltrados.length} de ${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'}`}
        </span>
      </div>

      {/* Filtro por Día (Calendario y chips rápidos) */}
      {!cargandoPedidos && pedidos.length > 0 && (
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs mb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Filtrar por Día
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800 capitalize">
                  {formatearFechaLegible(fechaFiltro)}
                  {fechaFiltro === fechaHoy && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                      Hoy
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Chips Rápidos: Todos vs Hoy */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFechaFiltro('TODAS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  fechaFiltro === 'TODAS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({pedidos.length})
              </button>
              <button
                type="button"
                onClick={() => setFechaFiltro(fechaHoy)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                  fechaFiltro === fechaHoy
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Selector con Flechas y Calendario nativo */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => cambiarDia(-1)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
              title="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex-1">
              <input
                type="date"
                value={fechaFiltro === 'TODAS' ? '' : fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value || 'TODAS')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => cambiarDia(1)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
              title="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {fechaFiltro !== 'TODAS' && (
              <button
                type="button"
                onClick={() => setFechaFiltro('TODAS')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2 py-1.5 transition shrink-0"
                title="Quitar filtro de fecha"
              >
                Ver todos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      {cargandoPedidos ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Actualizando tus pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            Aún no tienes pedidos registrados
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Explora la carta semanal con fotos reales y programa el almuerzo escolar de tus hijos en sencillos pasos.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-xs"
            >
              <Utensils className="w-4 h-4" />
              Ver Menú y Pedir
            </Link>
          </div>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            No tienes pedidos para el {formatearFechaLegible(fechaFiltro)}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            No se encontraron almuerzos programados para este día. Puedes revisar otra fecha o consultar todo tu historial.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setFechaFiltro('TODAS')}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
            >
              Ver todos mis pedidos ({pedidos.length})
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => {
            const { etapas, estadoVivo, pagadoOAceptado, empacadoOListo, entregado } =
              obtenerEstadoTimeline(pedido);
            const EstadoIcono = estadoVivo.icono;

            return (
              <div
                key={pedido.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-orange-200 transition space-y-3.5"
              >
                {/* Encabezado de la tarjeta */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl font-mono">
                      #{pedido.codigoPedido}
                    </span>
                    <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200/60 px-2.5 py-1 rounded-xl flex items-center gap-1.5 uppercase">
                      <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{formatearFechaCorta(pedido.fecha, pedido.diaSemana)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {badgeEstadoPedido(pedido.estadoPedido)}
                    {badgeEstadoPago(pedido.estadoPago)}
                  </div>
                </div>

                {/* LÍNEA DE TIEMPO DEL PEDIDO (STEPPER DE 4 ETAPAS) */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider px-1">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      Estado del Almuerzo
                    </span>
                    <span className="text-orange-600 font-bold lowercase">
                      {entregado
                        ? '4 de 4 completado'
                        : empacadoOListo
                        ? '3 de 4 empacado'
                        : pagadoOAceptado
                        ? '2 de 4 aceptado'
                        : '1 de 4 en validación'}
                    </span>
                  </div>

                  {/* Barra conectora y nodos del Stepper */}
                  <div className="relative flex items-center justify-between px-3 sm:px-6 pt-1">
                    {/* Línea conectora base */}
                    <div className="absolute left-8 right-8 top-5 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0" />

                    {/* Línea conectora activa animada */}
                    <div
                      className="absolute left-8 top-5 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-700"
                      style={{
                        width: entregado
                          ? 'calc(100% - 4rem)'
                          : empacadoOListo
                          ? '66%'
                          : pagadoOAceptado
                          ? '33%'
                          : '0%',
                      }}
                    />

                    {etapas.map((etapa) => {
                      const IconComponent = etapa.icono;
                      return (
                        <div key={etapa.id} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              etapa.completado
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : etapa.enCurso
                                ? 'bg-orange-500 text-white ring-4 ring-orange-100 shadow-xs'
                                : etapa.alerta
                                ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                                : 'bg-white text-slate-300 border-2 border-slate-200'
                            }`}
                            title={etapa.titulo}
                          >
                            {etapa.completado ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : (
                              <IconComponent className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs font-bold mt-1.5 whitespace-nowrap ${
                              etapa.completado
                                ? 'text-emerald-700'
                                : etapa.enCurso
                                ? 'text-orange-600 font-black'
                                : etapa.alerta
                                ? 'text-amber-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {etapa.titulo}
                          </span>
                          <span className="text-[9px] text-slate-400 hidden sm:block">
                            {etapa.descripcion}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tarjeta de estado en vivo explicativo */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                      estadoVivo.color === 'emerald'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : estadoVivo.color === 'purple'
                        ? 'bg-purple-50 border-purple-200 text-purple-950'
                        : estadoVivo.color === 'orange'
                        ? 'bg-orange-50 border-orange-200 text-orange-950'
                        : estadoVivo.color === 'blue'
                        ? 'bg-blue-50 border-blue-200 text-blue-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <EstadoIcono
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        estadoVivo.color === 'emerald'
                          ? 'text-emerald-600'
                          : estadoVivo.color === 'purple'
                          ? 'text-purple-600'
                          : estadoVivo.color === 'orange'
                          ? 'text-orange-600'
                          : estadoVivo.color === 'blue'
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <p className="font-bold text-[11px] sm:text-xs">{estadoVivo.titulo}</p>
                      <p className="text-[10px] sm:text-[11px] opacity-90 leading-relaxed">
                        {estadoVivo.descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos del estudiante */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-900">
                      {pedido.estudianteNombre}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pl-6">
                    {pedido.colegioNombre} • <span className="font-semibold text-slate-700">{pedido.gradoSeccion}</span>
                  </p>
                </div>

              {/* Menú seleccionado */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold shrink-0">1. Entrada:</span>
                  <span className="font-semibold text-slate-800">{pedido.entradaNombre}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold shrink-0">2. Segundo:</span>
                  <span className="font-bold text-slate-900">{pedido.segundoNombre}</span>
                </div>
                {pedido.observacion && (
                  <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-amber-800 flex items-start gap-1.5 font-medium">
                    <span className="font-bold shrink-0">Nota:</span>
                    <span>{pedido.observacion}</span>
                  </div>
                )}
              </div>

              {/* Pie de tarjeta con monto y acciones */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    Pago: {pedido.metodoPago}
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    S/ {pedido.monto.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {pedido.comprobanteUrl && (
                    <button
                      type="button"
                      onClick={() => setComprobanteModal(pedido.comprobanteUrl || null)}
                      className="p-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1"
                      title="Ver comprobante adjunto"
                    >
                      <FileImage className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">Comprobante</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => abrirConsultaWhatsApp(pedido)}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Modal de Comprobante */}
      {comprobanteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setComprobanteModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-sm w-full shadow-2xl relative animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-orange-500" /> Comprobante de Pago
              </span>
              <button
                type="button"
                onClick={() => setComprobanteModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={comprobanteModal}
              alt="Comprobante de pago"
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando...</div>}>
      <PedidosContent />
    </Suspense>
  );
}
