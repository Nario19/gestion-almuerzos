'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Filter,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Phone,
  FileText,
  Building2,
  Sparkles,
  PackageCheck,
  AlertCircle,
  X,
  CreditCard,
  Utensils,
  Calendar,
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/authContext';
import AccesoRestringido from '@/components/AccesoRestringido';
import ModalConfirmacion from '@/components/ModalConfirmacion';
import {
  obtenerFechaHoyPeru,
  formatearFechaLegiblePeru,
  formatearHoraPeru,
  formatearFechaEmisionPeru,
} from '@/lib/dateUtils';
import { PadreFiadoResumen, ItemFiadoPedido } from '@/types';

export default function FiadoPage() {
  const { usuario, esAdmin, esSuperAdmin, cargando: cargandoAuth } = useAuth();

  const [fiados, setFiados] = useState<PadreFiadoResumen[]>([]);
  const [colegios, setColegios] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [colegioFiltro, setColegioFiltro] = useState<string>(
    !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : 'TODOS'
  );
  const [filtroEstado, setFiltroEstado] = useState<'PENDIENTES' | 'TODOS' | 'SALDADOS'>('PENDIENTES');
  const [busqueda, setBusqueda] = useState('');

  // Estados de interfaz
  const [tarjetasExpandidas, setTarjetasExpandidas] = useState<Record<string, boolean>>({});
  const [padreReporteModal, setPadreReporteModal] = useState<PadreFiadoResumen | null>(null);

  // Confirmación de pago / liquidación
  const [confirmacion, setConfirmacion] = useState<{
    abierto: boolean;
    titulo: string;
    mensaje: React.ReactNode;
    onConfirmar: () => Promise<void>;
  }>({
    abierto: false,
    titulo: '',
    mensaje: null,
    onConfirmar: async () => {},
  });
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false);

  // Cargar datos
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const col = !esSuperAdmin && usuario?.colegioNombre ? usuario.colegioNombre : colegioFiltro;
      const [resFiados, resColegios] = await Promise.all([
        dataService.obtenerFiados(col),
        dataService.obtenerColegios(),
      ]);
      setFiados(resFiados);
      if (resColegios) setColegios(resColegios);
    } catch (err) {
      console.error('Error cargando lista de fiados:', err);
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
    const desuscribir = dataService.suscribirCambios(() => {
      cargarDatos();
    });
    return () => desuscribir();
  }, [esAdmin, colegioFiltro, usuario?.colegioNombre, esSuperAdmin]);

  // Filtrado de padres según búsqueda y estado
  const fiadosFiltrados = useMemo(() => {
    return fiados.filter((padre) => {
      // Filtro de estado
      if (filtroEstado === 'PENDIENTES' && padre.totalDeuda <= 0) return false;
      if (filtroEstado === 'SALDADOS' && padre.totalDeuda > 0) return false;

      // Filtro de búsqueda
      if (!busqueda.trim()) return true;
      const term = busqueda.toLowerCase();
      const matchNombre = padre.nombrePadre.toLowerCase().includes(term);
      const matchTelefono = padre.telefono.includes(term);
      const matchHijos = padre.hijosNombres.some((h) => h.toLowerCase().includes(term));
      const matchColegio = padre.colegioNombre.toLowerCase().includes(term);
      const matchCodigos = padre.pedidos.some((p) => p.codigoPedido.toLowerCase().includes(term));

      return matchNombre || matchTelefono || matchHijos || matchColegio || matchCodigos;
    });
  }, [fiados, filtroEstado, busqueda]);

  // KPIs
  const totalDeudaGlobal = useMemo(() => {
    return fiadosFiltrados.reduce((acc, p) => acc + p.totalDeuda, 0);
  }, [fiadosFiltrados]);

  const totalFamiliasConDeuda = useMemo(() => {
    return fiadosFiltrados.filter((p) => p.totalDeuda > 0).length;
  }, [fiadosFiltrados]);

  const totalAlmuerzosFiados = useMemo(() => {
    return fiadosFiltrados.reduce((acc, p) => {
      return acc + p.pedidos.filter((ped) => ped.estadoPago !== 'PAGADO').length;
    }, 0);
  }, [fiadosFiltrados]);

  const totalEntregadosSinCobrar = useMemo(() => {
    return fiadosFiltrados.reduce((acc, p) => {
      return (
        acc +
        p.pedidos.filter((ped) => ped.estadoPedido === 'ENTREGADO' && ped.estadoPago !== 'PAGADO').length
      );
    }, 0);
  }, [fiadosFiltrados]);

  // Toggle expandir detalles de un padre
  const toggleExpandir = (clave: string) => {
    setTarjetasExpandidas((prev) => ({
      ...prev,
      [clave]: !prev[clave],
    }));
  };

  // Generar y enviar mensaje de cobro por WhatsApp
  const enviarCobroWhatsApp = (padre: PadreFiadoResumen) => {
    const telefonoLimpio = padre.telefono.replace(/\D/g, '');
    const telefonoFinal = telefonoLimpio.startsWith('51')
      ? telefonoLimpio
      : `51${telefonoLimpio}`;

    const pedidosPendientes = padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO');

    // Desglose de almuerzos por fecha e hijo
    const lineasDetalle = pedidosPendientes
      .map((p) => {
        const entregaTag =
          p.estadoPedido === 'ENTREGADO' ? '✓ Entregado' : '⏳ En preparación';
        return `  • ${p.fecha} - ${p.estudianteNombre} (${p.gradoSeccion}):\n    ${p.entradaNombre ? `${p.entradaNombre} + ` : ''}${p.segundoNombre} [S/ ${(p.monto || 12).toFixed(2)}] (${entregaTag})`;
      })
      .join('\n');

    const mensaje =
      `Hola *${padre.nombrePadre}*, le saludamos de *Placeres Culinarios* (${padre.colegioNombre}).\n\n` +
      `Le compartimos el estado de cuenta de sus almuerzos bajo la modalidad *"Pagar luego / Fiado"*:\n\n` +
      `📋 *Detalle de almuerzos pendientes (${pedidosPendientes.length}):*\n` +
      `${lineasDetalle}\n\n` +
      `💰 *Total pendiente de pago: S/ ${padre.totalDeuda.toFixed(2)}*\n\n` +
      `Puede realizar su abono a través de:\n` +
      `• *Yape / Plin:* 999-999-999 (Placeres Culinarios)\n` +
      `• O cancelarlo directamente en el módulo de atención.\n\n` +
      `Agradecemos enviar su comprobante por este medio para registrar su abono. ¡Muchas gracias!`;

    const url = `https://wa.me/${telefonoFinal}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Acción: Marcar un almuerzo individual como pagado
  const handleSolicitarPagoIndividual = (pedido: ItemFiadoPedido, padre: PadreFiadoResumen) => {
    setConfirmacion({
      abierto: true,
      titulo: `¿Registrar pago del almuerzo?`,
      mensaje: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            ¿Confirmas que se recibió el abono de <strong>S/ {(pedido.monto || 12).toFixed(2)}</strong> por el almuerzo de{' '}
            <strong>{pedido.estudianteNombre}</strong> ({pedido.fecha})?
          </p>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="block font-bold text-slate-800">Menú:</span>
            <span>
              {pedido.entradaNombre ? `${pedido.entradaNombre} + ` : ''}
              {pedido.segundoNombre}
            </span>
          </div>
        </div>
      ),
      onConfirmar: async () => {
        await dataService.marcarFiadoComoPagado(pedido.id);
        await cargarDatos();
      },
    });
  };

  // Acción: Liquidar toda la deuda del padre
  const handleSolicitarLiquidarTotal = (padre: PadreFiadoResumen) => {
    const ident = padre.padreId || padre.telefono;
    setConfirmacion({
      abierto: true,
      titulo: `¿Liquidar deuda total de ${padre.nombrePadre}?`,
      mensaje: (
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Esta acción marcará como <strong>PAGADOS</strong> todos los almuerzos pendientes de esta familia ({padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO').length} almuerzos) por un total de:
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
            <span className="text-2xl font-black text-emerald-700">
              S/ {padre.totalDeuda.toFixed(2)}
            </span>
            <span className="block text-[11px] text-emerald-800 mt-0.5">Monto total a saldar</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Los pedidos se mantendrán en el historial de la familia marcados como pagos confirmados.
          </p>
        </div>
      ),
      onConfirmar: async () => {
        await dataService.liquidarDeudaPadre(ident, padre.colegioNombre);
        await cargarDatos();
      },
    });
  };

  const ejecutarAccionConfirmada = async () => {
    setEjecutandoAccion(true);
    try {
      await confirmacion.onConfirmar();
      setConfirmacion((prev) => ({ ...prev, abierto: false }));
    } catch (err) {
      console.error('Error procesando confirmación de fiado:', err);
    } finally {
      setEjecutandoAccion(false);
    }
  };

  // Formateador de fecha
  const formatearFecha = (f: string) => {
    return formatearFechaLegiblePeru(f);
  };

  if (cargandoAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verificando permisos...</p>
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <AccesoRestringido mensaje="Esta pantalla es de uso exclusivo para el control administrativo de cuentas por cobrar y fiados de Placeres Culinarios." />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Control de Fiados
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                  Pagar luego
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Almuerzos entregados o solicitados con pago posterior y seguimiento de cobranza
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/despacho"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition"
          >
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Ir a Despacho</span>
          </Link>
          <Link
            href="/cocina"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition"
          >
            <Utensils className="w-4 h-4 text-orange-500" />
            <span>Ir a Cocina</span>
          </Link>
        </div>
      </div>

      {/* Selector de Colegio Asignado o Filtro Global */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Institución Educativa:
            </span>
          </div>

          {!esSuperAdmin && usuario?.colegioNombre ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-bold text-orange-800">
              <span>🏫 Sede Asignada:</span>
              <span className="text-slate-900 font-black">{usuario.colegioNombre}</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setColegioFiltro('TODOS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  colegioFiltro === 'TODOS'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos los Colegios
              </button>
              {colegios.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColegioFiltro(col)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    colegioFiltro === col
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buscador y Filtro de Estado */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por padre, alumno, teléfono o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-hidden transition"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFiltroEstado('PENDIENTES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filtroEstado === 'PENDIENTES'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pendientes de Cobro
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado('SALDADOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filtroEstado === 'SALDADOS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Saldados / Historial
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filtroEstado === 'TODOS'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos los Registros
            </button>
          </div>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS (KPIS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Total por Cobrar
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            S/ {totalDeudaGlobal.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Saldo acumulado en fiados</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Familias Deudoras
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {totalFamiliasConDeuda} <span className="text-xs text-slate-400 font-normal">familias</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Con almuerzos por saldar</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              Almuerzos Fiados
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-600">
            {totalAlmuerzosFiados} <span className="text-xs text-slate-400 font-normal">platos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pendientes de abono</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Ya Entregados
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {totalEntregadosSinCobrar} <span className="text-xs text-slate-400 font-normal">entregados</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consumidos por estudiantes</p>
        </div>
      </div>

      {/* LISTADO DE PADRES Y ALMUERZOS FIADOS */}
      {cargando ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Cargando estado de fiados...</p>
        </div>
      ) : fiadosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            {filtroEstado === 'PENDIENTES'
              ? '¡No hay deudas de fiado pendientes!'
              : 'No se encontraron registros de fiado con los filtros seleccionados.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {filtroEstado === 'PENDIENTES'
              ? 'Todos los pedidos con método "Pagar luego" se encuentran al día o no hay órdenes registradas bajo esta modalidad.'
              : 'Prueba cambiando los filtros de colegio o el término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fiadosFiltrados.map((padre, idx) => {
            const claveCard = padre.padreId || padre.telefono || `card-${idx}`;
            const expandido = Boolean(tarjetasExpandidas[claveCard]);
            const tieneDeuda = padre.totalDeuda > 0;
            const pedidosPendientes = padre.pedidos.filter((p) => p.estadoPago !== 'PAGADO');

            return (
              <div
                key={claveCard}
                className={`bg-white rounded-3xl border transition shadow-xs overflow-hidden ${
                  tieneDeuda ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200'
                }`}
              >
                {/* Cabecera de la Familia / Padre */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                        {padre.nombrePadre}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {padre.colegioNombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      {padre.telefono && (
                        <div className="flex items-center gap-1 font-medium text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{padre.telefono}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                        <span>Hijos: {padre.hijosNombres.join(', ')}</span>
                      </div>
                      <div className="text-slate-400">
                        • {padre.pedidos.length} almuerzos registrados ({padre.pedidosEntregados} entregados)
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Deuda y Botones de Acción */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Saldo Pendiente
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-black block leading-none mt-0.5 ${
                          tieneDeuda ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        S/ {padre.totalDeuda.toFixed(2)}
                      </span>
                      {tieneDeuda ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1 inline-block">
                          {pedidosPendientes.length} por cobrar
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1 inline-block">
                          ✓ Al día
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Botón WhatsApp */}
                      {padre.telefono && tieneDeuda && (
                        <button
                          type="button"
                          onClick={() => enviarCobroWhatsApp(padre)}
                          className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          title="Enviar estado de cuenta y recordatorio por WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Cobrar por WhatsApp</span>
                        </button>
                      )}

                      {/* Botón Ver Reporte Detallado */}
                      <button
                        type="button"
                        onClick={() => setPadreReporteModal(padre)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        title="Ver e imprimir reporte detallado por fecha de cada hijo"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Reporte</span>
                      </button>

                      {/* Botón Liquidar Deuda Total */}
                      {tieneDeuda && (
                        <button
                          type="button"
                          onClick={() => handleSolicitarLiquidarTotal(padre)}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          title="Marcar todos los pedidos como pagados"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Liquidar</span>
                        </button>
                      )}

                      {/* Botón Desplegar / Contraer */}
                      <button
                        type="button"
                        onClick={() => toggleExpandir(claveCard)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                        title={expandido ? 'Ocultar detalles' : 'Ver detalle de almuerzos'}
                      >
                        {expandido ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desglose Expandido de Almuerzos */}
                {expandido && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-orange-500" />
                        Desglose de Almuerzos ("Pagar luego")
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        {padre.pedidos.length} órdenes en total
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                            <th className="py-2.5 px-3">Fecha</th>
                            <th className="py-2.5 px-3">Estudiante</th>
                            <th className="py-2.5 px-3">Sopa o postre</th>
                            <th className="py-2.5 px-3">Segundo</th>
                            <th className="py-2.5 px-3 text-center">Entrega</th>
                            <th className="py-2.5 px-3 text-right">Monto</th>
                            <th className="py-2.5 px-3 text-center">Estado Pago</th>
                            <th className="py-2.5 px-3 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {padre.pedidos.map((ped) => {
                            const pagado = ped.estadoPago === 'PAGADO';
                            const entregado = ped.estadoPedido === 'ENTREGADO';
                            return (
                              <tr key={ped.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                                  {ped.fecha}
                                  {ped.diaSemana && ped.diaSemana !== 'HOY' && (
                                    <span className="block text-[10px] text-slate-400 uppercase">
                                      {ped.diaSemana}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                                  {ped.estudianteNombre}
                                  <span className="block text-[10px] font-normal text-slate-500">
                                    {ped.gradoSeccion}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {ped.entradaNombre || '-'}
                                </td>
                                <td className="py-2.5 px-3 font-medium text-slate-800">
                                  {ped.segundoNombre}
                                </td>
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  {entregado ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                      ✓ Entregado {ped.horaEntrega ? `(${ped.horaEntrega})` : ''}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      ⏳ Pendiente
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                                  S/ {(ped.monto || 12).toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  {pagado ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                      PAGADO
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                                      POR COBRAR
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  {!pagado ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSolicitarPagoIndividual(ped, padre)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-2xs cursor-pointer"
                                    >
                                      Marcar Pagado
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-bold">
                                      ✓ Cancelado
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE REPORTE DETALLADO / ESTADO DE CUENTA FAMILIAR */}
      {padreReporteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Cabecera del Reporte */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 print:border-b-2">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md">
                  Estado de Cuenta • Pagar luego
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Reporte de Consumos Escolares
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {padreReporteModal.colegioNombre} • Emisión: {formatearFechaEmisionPeru()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPadreReporteModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Apoderado y Estudiantes */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Apoderado / Padre:
                </span>
                <span className="font-black text-slate-900 text-sm block">
                  {padreReporteModal.nombrePadre}
                </span>
                {padreReporteModal.telefono && (
                  <span className="text-slate-600 block mt-0.5 font-medium">
                    Teléfono: {padreReporteModal.telefono}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">
                  Estudiantes Vinculados:
                </span>
                <span className="font-bold text-slate-800 block">
                  {padreReporteModal.hijosNombres.join(', ')}
                </span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  Institución: {padreReporteModal.colegioNombre}
                </span>
              </div>
            </div>

            {/* Tabla Detallada con Fecha de Cada Hijo */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Detalle Cronológico de Almuerzos:
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Estudiante</th>
                      <th className="py-2.5 px-3">Platos (Sopa o postre + Segundo)</th>
                      <th className="py-2.5 px-3 text-center">Entrega</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                      <th className="py-2.5 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {padreReporteModal.pedidos.map((ped) => (
                      <tr key={ped.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                          {ped.fecha}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {ped.estudianteNombre}
                          <span className="block text-[10px] font-normal text-slate-500">
                            {ped.gradoSeccion}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <span className="block">
                            {ped.entradaNombre ? `${ped.entradaNombre} + ` : ''}
                            {ped.segundoNombre}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {ped.estadoPedido === 'ENTREGADO' ? (
                            <span className="text-[10px] font-bold text-emerald-700">
                              ✓ Entregado {ped.horaEntrega ? `(${ped.horaEntrega})` : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                          S/ {(ped.monto || 12).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {ped.estadoPago === 'PAGADO' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                              PAGADO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                              PENDIENTE
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-black border-t border-slate-200">
                      <td colSpan={4} className="py-3 px-3 text-right text-slate-700 uppercase">
                        Total Adeudado:
                      </td>
                      <td className="py-3 px-3 text-right text-base text-amber-600">
                        S/ {padreReporteModal.totalDeuda.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Acciones del Reporte */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Imprimir Reporte</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {padreReporteModal.telefono && padreReporteModal.totalDeuda > 0 && (
                  <button
                    type="button"
                    onClick={() => enviarCobroWhatsApp(padreReporteModal)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar a WhatsApp</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPadreReporteModal(null)}
                  className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ACCIONES */}
      <ModalConfirmacion
        abierto={confirmacion.abierto}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        textoBotonConfirmar="Sí, registrar pago"
        tipo="advertencia"
        cargando={ejecutandoAccion}
        onConfirmar={ejecutarAccionConfirmada}
        onCerrar={() => setConfirmacion((prev) => ({ ...prev, abierto: false }))}
      />
    </div>
  );
}
