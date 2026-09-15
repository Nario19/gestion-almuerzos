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
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { dataService } from '@/lib/dataService';
import { Pedido, EstadoPedido, EstadoPago } from '@/types';

function PedidosContent() {
  const { usuario, cargando: cargandoAuth } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [comprobanteModal, setComprobanteModal] = useState<string | null>(null);

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
              href="/cocina"
              className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs transition"
            >
              Ir a Consolidado de Cocina
            </Link>
            <Link
              href="/despacho"
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition"
            >
              Ir a Despacho
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
          {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>

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
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-orange-200 transition space-y-3.5"
            >
              {/* Encabezado de la tarjeta */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl font-mono">
                    #{pedido.codigoPedido}
                  </span>
                  <span className="text-xs font-bold text-orange-600 uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {pedido.diaSemana || 'Hoy'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {badgeEstadoPedido(pedido.estadoPedido)}
                  {badgeEstadoPago(pedido.estadoPago)}
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
          ))}
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
